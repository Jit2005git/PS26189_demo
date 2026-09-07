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

# --- Step 20: Advanced Search & Investigation Filtering Models ---

class AdvancedSearchRequest(BaseModel):
    mode: Optional[str] = "ALL"  # "ALL", "PERSON", "CASE"
    query: Optional[str] = None
    name: Optional[str] = None
    alias: Optional[str] = None
    person_id: Optional[str] = None
    case_id: Optional[str] = None
    fir_number: Optional[str] = None
    offence: Optional[str] = None
    legal_section: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    police_station: Optional[str] = None
    status: Optional[str] = None
    year: Optional[str] = None
    phone: Optional[str] = None
    phone_prefix: Optional[str] = None
    phone_suffix: Optional[str] = None
    vehicle: Optional[str] = None
    organization: Optional[str] = None
    occupation: Optional[str] = None
    min_case_count: Optional[int] = None
    max_case_count: Optional[int] = None
    exact_case_count: Optional[int] = None
    limit: Optional[int] = 100

class PersonSearchResultItem(BaseModel):
    person_id: str
    full_name: str
    aliases: List[str]
    gender: str
    age: Optional[Any] = ""
    occupation: str
    phone_number: str
    district: str
    city: str
    associated_case_count: int
    matching_case_ids: List[str]
    matching_reasons: List[str]
    threat_level: str

class CaseSearchResultItem(BaseModel):
    case_id: str
    title: str
    fir_number: str
    offence_category: str
    legal_section: str
    date_opened: str
    year: str
    district: str
    police_station: str
    status: str
    associated_persons_count: int
    matching_reasons: List[str]

class AdvancedSearchResponse(BaseModel):
    mode: str
    total_persons: int
    total_cases: int
    total_results: int
    persons: List[PersonSearchResultItem]
    cases: List[CaseSearchResultItem]
    safety_notice: str

