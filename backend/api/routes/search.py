from fastapi import APIRouter, Depends
import networkx as nx
from api.dependencies import get_graph
from api.models import SearchResponse, SearchResult

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
def search(q: str = "", G: nx.MultiDiGraph = Depends(get_graph)):
    if not q:
        return SearchResponse(results=[])
        
    query = q.lower()
    results = []
    
    for n, d in G.nodes(data=True):
        node_id = str(n).lower()
        original_value = str(d.get("value", "")).lower()
        normalized_value = str(d.get("normalized_value", "")).lower()
        
        # Check for match in ID, value or normalized value
        if query in node_id or query in original_value or query in normalized_value:
            node_type = d.get("type", "UNKNOWN")
            match_type = "case" if node_type in ("CASE", "CASE_ID") else "entity"
            
            results.append(SearchResult(
                id=n,
                type=node_type,
                label=d.get("value") or n,
                match_type=match_type
            ))
            
    # Sort for deterministic output
    results.sort(key=lambda x: (x.match_type, x.id))
    return SearchResponse(results=results)
