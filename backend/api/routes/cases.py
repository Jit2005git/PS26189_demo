from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Dict, Any
import networkx as nx
from api.dependencies import get_graph, get_cases, require_permission
from modules.auth.permissions import Permission
from api.models import Case, GraphResponse, Node, Edge, RegisterCaseRequest, RegisterCaseResponse
from modules.graph.graph_builder import get_case_subgraph
from modules.cases.case_service import (
    get_all_cases_enriched,
    get_case_record,
    get_case_associated_persons,
    get_case_related_entities,
    get_case_evidence_relationships,
    get_case_related_cases_details
)
from modules.cases.case_registration_service import (
    register_case_transaction,
    ValidationError
)
from modules.persistence.runtime_store import get_next_case_id

router = APIRouter(
    dependencies=[Depends(require_permission(Permission.VIEW_ASSIGNED_CASES, Permission.VIEW_AUTHORIZED_CASES))]
)


@router.get("/cases", response_model=List[Case])
def list_cases(
    G: nx.MultiDiGraph = Depends(get_graph),
    inventory: List = Depends(get_cases)
):
    # Retrieve enriched cases with complete synthetic metadata
    enriched = get_all_cases_enriched(G=G)
    cases = [
        Case(id=c["case_id"], type=c.get("type", "CASE"), details=c)
        for c in enriched
    ]
    return cases

@router.get("/cases/next-id")
def get_next_case_id_route():
    """Returns the dynamically allocated next Case ID."""
    return {"next_case_id": get_next_case_id()}

@router.post("/cases/register", response_model=RegisterCaseResponse)
def register_new_case_route(
    payload: RegisterCaseRequest,
    request: Request
):
    """
    Step 27: Register New Case + Create / Link Person.
    Transactional coordinator storing to isolated runtime data and updating live graph.
    """
    try:
        result = register_case_transaction(payload.model_dump(), app_state=request.app.state)
        return result
    except ValidationError as ve:
        raise HTTPException(status_code=400, detail={"message": ve.message, "errors": ve.errors})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Case registration failed: {str(e)}")

@router.get("/cases/{case_id}")
def get_case_details(
    case_id: str, 
    G: nx.MultiDiGraph = Depends(get_graph),
    inventory: List = Depends(get_cases)
):
    case_row = get_case_record(case_id)
    if not case_row:
        raise HTTPException(status_code=404, detail="Case not found")
        
    title = case_row.get("case_title") or case_row.get("title") or f"Case {case_id}"
    case_data = {
        "case_id": case_id,
        "type": "CASE",
        "value": case_id,
        "title": title,
        "case_title": title,
        "offence_category": case_row.get("offence_category", "General Enquiry"),
        "legal_section": case_row.get("legal_section", "Not Specified"),
        "fir_number": case_row.get("fir_number", "N/A"),
        "date_opened": case_row.get("date_opened", ""),
        "status": case_row.get("status", "OPEN"),
        "police_station": case_row.get("police_station", ""),
        "district": case_row.get("district", ""),
        "state": case_row.get("state", ""),
        "description": case_row.get("description", ""),
        "location_id": case_row.get("location_id", "")
    }
    
    # Check if case is in graph to supplement details and get connected entities
    connected_entities = []
    if case_id in G and G.nodes[case_id].get("type") in ("CASE", "CASE_ID"):
        case_data.update(G.nodes[case_id])
        # Preserve original fields
        case_data["case_id"] = case_id
        case_data["title"] = title
        
        # Direct connected entities in NetworkX graph
        for neighbor in G.neighbors(case_id):
            connected_entities.append({"id": neighbor, "details": G.nodes[neighbor]})
        for pred in G.predecessors(case_id):
            if pred not in [c["id"] for c in connected_entities]:
                connected_entities.append({"id": pred, "details": G.nodes[pred]})

    # Investigator-oriented analytical sections
    associated_persons = get_case_associated_persons(case_id)
    related_entities = get_case_related_entities(case_id)
    relationships = get_case_evidence_relationships(case_id, G=G)
    related_cases = get_case_related_cases_details(case_id, G=G)

    case_data["associated_persons_count"] = len(associated_persons)
    case_data["related_entities_count"] = related_entities.get("total_count", 0)
    case_data["evidence_count"] = len(relationships)
                
    return {
        "case_id": case_id,
        "details": case_data,
        "connected_entities": connected_entities,
        "associated_persons": associated_persons,
        "related_entities": related_entities,
        "relationships": relationships,
        "related_cases": related_cases
    }

@router.get("/cases/{case_id}/graph", response_model=GraphResponse)
def get_case_graph(
    case_id: str, 
    G: nx.MultiDiGraph = Depends(get_graph),
    inventory: List = Depends(get_cases)
):
    case_row = get_case_record(case_id)
    if not case_row:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # If case exists in inventory but has no graph relationships, return solitary node
    if case_id not in G or G.nodes[case_id].get("type") not in ("CASE", "CASE_ID"):
        return GraphResponse(
            nodes=[Node(id=case_id, label=case_id, type="CASE")],
            edges=[]
        )
        
    subgraph = get_case_subgraph(G, case_id)
    
    nodes = []
    for n, d in subgraph.nodes(data=True):
        nodes.append(Node(
            id=n,
            label=d.get("value") or n,
            type=d.get("type", "UNKNOWN")
        ))
        
    edges = []
    edge_id = 0
    for u, v, k, d in subgraph.edges(data=True, keys=True):
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
        
    return GraphResponse(nodes=nodes, edges=edges)

@router.get("/cases/{case_id}/related")
def get_related_cases(
    case_id: str, 
    G: nx.MultiDiGraph = Depends(get_graph),
    inventory: List = Depends(get_cases)
):
    case_row = get_case_record(case_id)
    if not case_row:
        raise HTTPException(status_code=404, detail="Case not found")
        
    related_cases_details = get_case_related_cases_details(case_id, G=G)
    related_ids = [r["case_id"] for r in related_cases_details]
    
    # Also include any direct graph neighbors
    if case_id in G and G.nodes[case_id].get("type") in ("CASE", "CASE_ID"):
        incident_entities = set(G.predecessors(case_id)) | set(G.successors(case_id))
        for ent in incident_entities:
            if G.nodes[ent].get("type") in ("CASE", "CASE_ID"):
                continue
            ent_neighbors = set(G.predecessors(ent)) | set(G.successors(ent))
            for en in ent_neighbors:
                if G.nodes[en].get("type") in ("CASE", "CASE_ID") and en != case_id:
                    if en not in related_ids:
                        related_ids.append(en)
                     
    return {
        "related_cases": sorted(list(set(related_ids))),
        "related_cases_details": related_cases_details
    }

