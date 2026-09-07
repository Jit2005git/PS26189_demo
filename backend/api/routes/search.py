from fastapi import APIRouter, Depends
import networkx as nx
from api.dependencies import get_graph
from api.models import SearchResponse, SearchResult
from modules.entities.person_service import list_persons_summary

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
def search(q: str = "", G: nx.MultiDiGraph = Depends(get_graph)):
    if not q:
        return SearchResponse(results=[])
        
    query = q.lower().strip()
    results = []
    seen_ids = set()
    
    # 1. Search NetworkX graph nodes
    for n, d in G.nodes(data=True):
        node_id = str(n).lower()
        original_value = str(d.get("value", "")).lower()
        normalized_value = str(d.get("normalized_value", "")).lower()
        
        if query in node_id or query in original_value or query in normalized_value:
            node_type = d.get("type", "UNKNOWN")
            match_type = "case" if node_type in ("CASE", "CASE_ID") else "entity"
            
            seen_ids.add(n)
            results.append(SearchResult(
                id=n,
                type=node_type,
                label=d.get("value") or n,
                match_type=match_type
            ))

    # 2. Search synthetic person registry
    matching_persons = list_persons_summary(search=query, limit=20)
    for p in matching_persons:
        pid = p["person_id"]
        if pid not in seen_ids:
            seen_ids.add(pid)
            label = p["full_name"]
            if p.get("primary_alias"):
                label += f' ("{p["primary_alias"]}")'
            results.append(SearchResult(
                id=pid,
                type="PERSON",
                label=label,
                match_type="entity"
            ))
            
    # Sort for deterministic output
    results.sort(key=lambda x: (x.match_type, x.id))
    return SearchResponse(results=results)


# --- Step 20: Advanced Search & Investigation Filtering Endpoints ---
from api.models import AdvancedSearchRequest, AdvancedSearchResponse
from modules.search.search_service import advanced_search, get_search_metadata

@router.post("/search/advanced", response_model=AdvancedSearchResponse)
def run_advanced_search(payload: AdvancedSearchRequest):
    """
    Step 20: Advanced deterministic search & investigation filtering.
    Evaluates multi-criteria structured filters across persons and cases.
    """
    res = advanced_search(payload.model_dump())
    return AdvancedSearchResponse(**res)


@router.get("/search/metadata")
def get_filter_metadata():
    """
    Returns available filter choices (offence categories, districts, statuses, years)
    for advanced search dropdowns directly from indexed dataset.
    """
    return get_search_metadata()


