from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
import networkx as nx
from api.dependencies import get_graph, get_analytics, get_priority, require_permission
from modules.auth.permissions import Permission
from api.models import Entity, Edge, DuplicateCheckRequest, DuplicateCheckResponse
from modules.entities.person_service import (
    get_person_profile, 
    get_person_family_profile, 
    list_persons_summary
)
from modules.persistence.runtime_store import get_next_person_id
from modules.cases.case_registration_service import (
    check_person_duplicate,
    search_persons_for_linking
)

router = APIRouter(
    dependencies=[Depends(require_permission(Permission.VIEW_PEOPLE, Permission.VIEW_NETWORK))]
)


@router.get("/persons", response_model=List[Dict[str, Any]])
def get_persons(
    search: Optional[str] = None,
    district: Optional[str] = None,
    limit: Optional[int] = Query(250, ge=1)
):
    """Returns synthetic person registry with search and district filtering for Step 18."""
    return list_persons_summary(search=search, district=district, limit=limit)

@router.get("/persons/next-id")
def get_next_person_id_route():
    """Returns dynamically allocated next Person ID."""
    return {"next_person_id": get_next_person_id()}

@router.get("/persons/search-linking")
def search_persons_for_case_linking(
    q: str = Query("", description="Search term for linking person to case"),
    limit: int = Query(10, ge=1, le=50)
):
    """Searches registered persons by name, ID, phone, or alias for case linking."""
    return search_persons_for_linking(query=q, limit=limit)

@router.post("/persons/check-duplicate", response_model=DuplicateCheckResponse)
def check_person_duplicate_route(
    payload: DuplicateCheckRequest
):
    """Advisory Entity Resolution check for duplicate or similar existing persons."""
    return check_person_duplicate(payload.model_dump())

@router.get("/entities", response_model=List[Entity])
def list_entities(
    type: Optional[str] = None,
    limit: Optional[int] = Query(100, ge=1),
    G: nx.MultiDiGraph = Depends(get_graph)
):
    entities = []
    for n, d in G.nodes(data=True):
        t = d.get("type")
        if t in ("CASE", "CASE_ID"):
            continue
        if type and t != type:
            continue
            
        entities.append(Entity(
            id=n,
            type=t or "UNKNOWN",
            value=d.get("value"),
            details=d
        ))
        if len(entities) >= limit:
            break
            
    # Sort for determinism
    entities.sort(key=lambda x: x.id)
    return entities

@router.get("/entities/{entity_id}")
def get_entity_details(
    entity_id: str,
    G: nx.MultiDiGraph = Depends(get_graph),
    analytics: dict = Depends(get_analytics),
    priority: list = Depends(get_priority)
):
    # Check if entity is a person first (Step 18 Person Dossier)
    person_profile = get_person_profile(entity_id, G=G, analytics=analytics, priority=priority)
    if person_profile:
        return person_profile

    # Fallback to general graph entity
    if entity_id not in G or G.nodes[entity_id].get("type") in ("CASE", "CASE_ID"):
        raise HTTPException(status_code=404, detail="Entity not found")
        
    entity_data = G.nodes[entity_id]
    
    # Get connections
    connected_entities = []
    neighbors = set(G.predecessors(entity_id)) | set(G.successors(entity_id))
    for neighbor in neighbors:
        connected_entities.append({"id": neighbor, "type": G.nodes[neighbor].get("type")})
        
    # Find analytics if available
    entity_analytics = {}
    for r in analytics.get("degree_centrality", []):
        if r["entity_id"] == entity_id:
            entity_analytics["degree_centrality"] = r["centrality_score"]
    for r in analytics.get("betweenness_centrality", []):
        if r["entity_id"] == entity_id:
            entity_analytics["betweenness_centrality"] = r["betweenness_score"]
            
    # Find priority if available
    entity_priority = None
    for p in priority:
        if p["entity_id"] == entity_id:
            entity_priority = p
            break
            
    return {
        "entity_id": entity_id,
        "entity_type": entity_data.get("type", "UNKNOWN"),
        "value": entity_data.get("value"),
        "details": entity_data,
        "connected_entities": connected_entities,
        "graph_metrics": entity_analytics,
        "priority_information": entity_priority
    }

@router.get("/entities/{entity_id}/family")
def get_entity_family(entity_id: str):
    """
    Step 19: Dedicated Investigator Family Profile Endpoint.
    
    CRITICAL INVESTIGATIVE SAFETY RULE:
    Family relationship data is strictly civilian relationship data.
    It does NOT imply case involvement, criminality, guilt, or investigative association.
    """
    family_profile = get_person_family_profile(entity_id)
    if not family_profile:
        raise HTTPException(status_code=404, detail="Person not found or entity is not a person")
    return family_profile

@router.get("/entities/{entity_id}/relationships", response_model=List[Edge])
def get_entity_relationships(
    entity_id: str,
    G: nx.MultiDiGraph = Depends(get_graph)
):
    if entity_id not in G or G.nodes[entity_id].get("type") in ("CASE", "CASE_ID"):
        raise HTTPException(status_code=404, detail="Entity not found")
        
    edges = []
    edge_id = 0
    
    for u, v, k, d in G.in_edges(entity_id, data=True, keys=True):
        edges.append(Edge(
            id=f"e{edge_id}",
            source=u,
            target=v,
            relationship_type=d.get("relationship_type", "UNKNOWN"),
            confidence=d.get("confidence", 0.0),
            evidence=d.get("evidence", ""),
            case_id=d.get("case_id", ""),
            detection_method=d.get("detection_method", "")
        ))
        edge_id += 1
        
    for u, v, k, d in G.out_edges(entity_id, data=True, keys=True):
        edges.append(Edge(
            id=f"e{edge_id}",
            source=u,
            target=v,
            relationship_type=d.get("relationship_type", "UNKNOWN"),
            confidence=d.get("confidence", 0.0),
            evidence=d.get("evidence", ""),
            case_id=d.get("case_id", ""),
            detection_method=d.get("detection_method", "")
        ))
        edge_id += 1
        
    # Remove duplicates based on exact evidence match if they exist
    unique_edges = []
    seen = set()
    for e in edges:
        key = (e.source, e.target, e.relationship_type, e.case_id, e.evidence)
        if key not in seen:
            seen.add(key)
            unique_edges.append(e)
            
    # Sort for determinism
    unique_edges.sort(key=lambda x: (x.source, x.target, x.relationship_type))
    return unique_edges
