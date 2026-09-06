from fastapi import APIRouter, Depends, Query
from typing import List, Optional
import networkx as nx
from api.dependencies import get_graph
from api.models import Edge

router = APIRouter()

@router.get("/relationships", response_model=List[Edge])
def list_relationships(
    relationship_type: Optional[str] = None,
    case_id: Optional[str] = None,
    min_confidence: Optional[float] = 0.0,
    limit: Optional[int] = Query(100, ge=1),
    G: nx.MultiDiGraph = Depends(get_graph)
):
    edges = []
    edge_id = 0
    
    for u, v, k, d in G.edges(data=True, keys=True):
        rel_type = d.get("relationship_type", "")
        conf = d.get("confidence", 0.0)
        cid = d.get("case_id", "")
        
        if relationship_type and rel_type != relationship_type:
            continue
        if case_id and cid != case_id:
            continue
        if conf < min_confidence:
            continue
            
        edges.append(Edge(
            id=f"e{edge_id}",
            source=u,
            target=v,
            relationship_type=rel_type,
            confidence=conf,
            evidence=d.get("evidence", ""),
            case_id=cid,
            detection_method=d.get("detection_method", "")
        ))
        edge_id += 1
        
        if len(edges) >= limit:
            break
            
    return edges
