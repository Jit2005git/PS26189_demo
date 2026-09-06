from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class HealthResponse(BaseModel):
    status: str

class SummaryResponse(BaseModel):
    total_cases: int
    total_entities: int
    total_relationships: int
    total_network_nodes: int
    node_counts_by_type: Dict[str, int]
    relationship_counts_by_type: Dict[str, int]

class Case(BaseModel):
    id: str
    type: str
    details: Dict[str, Any]

class Entity(BaseModel):
    id: str
    type: str
    value: Optional[str] = None
    details: Dict[str, Any]

class Edge(BaseModel):
    id: str
    source: str
    target: str
    relationship_type: str
    confidence: float
    evidence: str
    case_id: str
    detection_method: str

class Node(BaseModel):
    id: str
    label: str
    type: str

class GraphResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class PriorityResult(BaseModel):
    entity_id: str
    entity_type: str
    priority_score: float
    priority_level: str
    reasons: List[str]
    supporting_evidence: List[str]

class SearchResult(BaseModel):
    id: str
    type: str
    label: str
    match_type: str

class SearchResponse(BaseModel):
    results: List[SearchResult]
