from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
import networkx as nx
from api.dependencies import get_graph, get_cases
from api.models import Case, GraphResponse, Node, Edge
from modules.graph.graph_builder import get_case_subgraph

router = APIRouter()

@router.get("/cases", response_model=List[Case])
def list_cases(
    G: nx.MultiDiGraph = Depends(get_graph),
    inventory: List = Depends(get_cases)
):
    # Return all cases from the inventory
    cases = []
    
    # We map what's in the graph to include graph details, 
    # but still return cases not in the graph.
    graph_cases = {}
    for n, d in G.nodes(data=True):
        if d.get("type") in ("CASE", "CASE_ID"):
            graph_cases[n] = d
            
    for row in inventory:
        case_id = row.get("case_id")
        if not case_id:
            continue
            
        details = graph_cases.get(case_id, {
            "type": "CASE", 
            "value": case_id,
            "title": row.get("title", ""),
            "status": row.get("status", ""),
            "description": row.get("description", "")
        })
        cases.append(Case(id=case_id, type=details.get("type", "CASE"), details=details))
        
    # Sort for determinism
    cases.sort(key=lambda x: x.id)
    return cases

@router.get("/cases/{case_id}")
def get_case_details(
    case_id: str, 
    G: nx.MultiDiGraph = Depends(get_graph),
    inventory: List = Depends(get_cases)
):
    # Find case in inventory first
    case_row = next((r for r in inventory if r.get("case_id") == case_id), None)
    
    if not case_row:
        raise HTTPException(status_code=404, detail="Case not found")
        
    case_data = {
        "type": "CASE",
        "value": case_id,
        "title": case_row.get("title", ""),
        "status": case_row.get("status", ""),
        "description": case_row.get("description", "")
    }
    
    # Check if case is in graph to supplement details and get connected entities
    connected_entities = []
    if case_id in G and G.nodes[case_id].get("type") in ("CASE", "CASE_ID"):
        case_data.update(G.nodes[case_id])
        
        # Get direct connected entities
        for neighbor in G.neighbors(case_id):
            connected_entities.append({"id": neighbor, "details": G.nodes[neighbor]})
        for pred in G.predecessors(case_id):
            if pred not in [c["id"] for c in connected_entities]:
                connected_entities.append({"id": pred, "details": G.nodes[pred]})
                
    return {
        "case_id": case_id,
        "details": case_data,
        "connected_entities": connected_entities
    }

@router.get("/cases/{case_id}/graph", response_model=GraphResponse)
def get_case_graph(
    case_id: str, 
    G: nx.MultiDiGraph = Depends(get_graph),
    inventory: List = Depends(get_cases)
):
    case_row = next((r for r in inventory if r.get("case_id") == case_id), None)
    if not case_row:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # If case exists in inventory but has no graph relationships, return empty graph
    if case_id not in G or G.nodes[case_id].get("type") not in ("CASE", "CASE_ID"):
        # We can add the case itself as a solitary node
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
    case_row = next((r for r in inventory if r.get("case_id") == case_id), None)
    if not case_row:
        raise HTTPException(status_code=404, detail="Case not found")
        
    related_cases = set()
    
    # If case is in the graph, we can find related cases via shared entities
    if case_id in G and G.nodes[case_id].get("type") in ("CASE", "CASE_ID"):
        incident_entities = set(G.predecessors(case_id)) | set(G.successors(case_id))
        
        for ent in incident_entities:
            if G.nodes[ent].get("type") in ("CASE", "CASE_ID"):
                continue
            # Find cases connected to this entity
            ent_neighbors = set(G.predecessors(ent)) | set(G.successors(ent))
            for en in ent_neighbors:
                if G.nodes[en].get("type") in ("CASE", "CASE_ID") and en != case_id:
                    related_cases.add(en)
                    
    return {"related_cases": sorted(list(related_cases))}
