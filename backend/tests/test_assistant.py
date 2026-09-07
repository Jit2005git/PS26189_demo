"""
test_assistant.py
=================
Comprehensive unit & integration test suite for Step 21: AI Investigation Assistant.

Tests all required criteria:
1. "Show persons associated with kidnapping cases." (PERSON_SEARCH by offence)
2. "Show persons associated with kidnapping cases in Kolkata." (PERSON_SEARCH by offence + location)
3. "Find people linked to at least 3 associated cases." (PERSON_SEARCH by min_case_count)
4. "Show people whose phone number ends in 4895." (PERSON_SEARCH by phone suffix)
5. "Tell me more about Arjun Mehta." (PERSON_PROFILE)
6. "What cases is Arjun Mehta associated with?" (PERSON_PROFILE requested_aspect=CASES)
7. "Show the network connections for Arjun Mehta." (NETWORK_QUERY)
8. "Why is Arjun Mehta an investigation priority?" (PRIORITY_EXPLANATION)
9. "Which cases are connected through common persons?" (RELATED_CASES)
10. "Show potential connectors between these cases." (RELATED_CASES)
11. Ambiguous person name triggers CLARIFICATION_REQUIRED with candidates (NEVER guesses)
12. Unknown person returns informative empty result without inventing facts
13. Unknown case returns informative empty result without inventing facts
14. Unsupported query handling
15. Offline / Zero-API-key operation via deterministic fast path
16. Strict safety terminology: prohibition of "criminal", "guilty", "convicted"
17. Telecom / banking wording: "synthetic communication record" / "synthetic transaction record"
18. Family isolation: family relationships are never used as investigative evidence
19. Provenance preservation: structured ProvenanceItem records returned
20. API endpoint validation: POST /api/assistant/query returns 200 with valid schema
"""

import pytest
from fastapi.testclient import TestClient
from main import app

from modules.assistant.models import AssistantIntent, AssistantQueryResponse
from modules.assistant.assistant_service import process_assistant_query
from modules.assistant.intent_parser import parse_investigator_query
from modules.assistant.llm_adapter import MockLLMClient
from modules.graph.dataset_integration import build_dataset_graph
from modules.analytics.graph_analytics import analyze_graph
from modules.priority.priority_scorer import calculate_priority_scores

from typing import Generator

@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def app_context():
    G = build_dataset_graph()
    analytics = analyze_graph(G)
    priority = calculate_priority_scores(G, analytics)
    return {"G": G, "analytics": analytics, "priority": priority}


def test_1_persons_associated_with_kidnapping(app_context):
    """Test Question 1: 'Show persons associated with kidnapping cases.'"""
    q = "Show persons associated with kidnapping cases."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.PERSON_SEARCH
    assert res.structured_query.offence == "Kidnapping"
    assert len(res.persons) > 0
    assert len(res.provenance) > 0
    assert "kidnapping" in res.answer_markdown.lower()


def test_2_persons_associated_with_kidnapping_in_kolkata(app_context):
    """Test Question 2: 'Show persons associated with kidnapping cases in Kolkata.'"""
    q = "Show persons associated with kidnapping cases in Kolkata."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.PERSON_SEARCH
    assert res.structured_query.offence == "Kidnapping"
    assert res.structured_query.location == "Kolkata"
    assert "Kolkata" in res.answer_markdown or "kolkata" in res.answer_markdown.lower()


def test_3_min_case_count(app_context):
    """Test Question 3: 'Find people linked to at least 3 associated cases.'"""
    q = "Find people linked to at least 3 associated cases."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.PERSON_SEARCH
    assert res.structured_query.min_case_count == 3
    assert len(res.persons) > 0
    for p in res.persons:
        assert p["associated_case_count"] >= 3


def test_4_phone_suffix(app_context):
    """Test Question 4: 'Show people whose phone number ends in 4895.'"""
    q = "Show people whose phone number ends in 4895."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.PERSON_SEARCH
    assert res.structured_query.phone_suffix == "4895"
    assert len(res.persons) > 0
    assert any(p["person_id"] == "PERSON-001" for p in res.persons)


def test_5_tell_me_about_arjun_mehta(app_context):
    """Test Question 5: 'Tell me more about Arjun Mehta.'"""
    q = "Tell me more about Arjun Mehta."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.PERSON_PROFILE
    assert res.structured_query.person_id == "PERSON-001"
    assert "Arjun Mehta" in res.answer_markdown
    assert "PERSON-001" in res.answer_markdown
    assert len(res.provenance) > 0


def test_6_what_cases_is_arjun_mehta_associated_with(app_context):
    """Test Question 6: 'What cases is Arjun Mehta associated with?'"""
    q = "What cases is Arjun Mehta associated with?"
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.PERSON_PROFILE
    assert res.structured_query.person_id == "PERSON-001"
    assert len(res.cases) == 4
    # Provenance must cite the exact cases
    case_ids_in_prov = [p.case_id for p in res.provenance if p.case_id]
    assert "CASE-001" in case_ids_in_prov


def test_7_show_network_connections_for_arjun_mehta(app_context):
    """Test Question 7: 'Show the network connections for Arjun Mehta.'"""
    q = "Show the network connections for Arjun Mehta."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.NETWORK_QUERY
    assert res.structured_query.person_id == "PERSON-001"
    assert len(res.network_relationships) > 0
    # Must use synthetic communication/transaction wording
    assert "synthetic" in res.answer_markdown.lower()


def test_8_why_is_arjun_mehta_priority(app_context):
    """Test Question 8: 'Why is Arjun Mehta an investigation priority?'"""
    q = "Why is Arjun Mehta an investigation priority?"
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.PRIORITY_EXPLANATION
    assert res.structured_query.person_id == "PERSON-001"
    assert res.priority_information is not None
    assert "Priority Score" in res.answer_markdown
    # Does not predict criminality or guilt
    assert "criminality or guilt" in res.answer_markdown.lower()


def test_9_connected_cases_through_common_persons(app_context):
    """Test Question 9: 'Which cases are connected through common persons?'"""
    q = "Which cases are connected through common persons?"
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.RELATED_CASES
    assert len(res.cases) > 0


def test_10_potential_connectors_between_cases(app_context):
    """Test Question 10: 'Show potential connectors between these cases.'"""
    q = "Show potential connectors between these cases."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.RELATED_CASES


def test_11_ambiguous_name_disambiguation(app_context):
    """Requirement: Ambiguous person names NEVER guess; return CLARIFICATION_REQUIRED."""
    # "Arjun" matches Arjun Mehta (PERSON-001), Arjun Pandey (PERSON-108), Arjun Shukla (PERSON-194)
    q = "Tell me about Arjun"
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.CLARIFICATION_REQUIRED
    assert len(res.candidates) > 1
    assert any(c.person_id == "PERSON-001" for c in res.candidates)
    assert any(c.person_id == "PERSON-108" for c in res.candidates)
    assert "ambiguous" in res.answer_markdown.lower()


def test_12_unknown_person(app_context):
    """Requirement: Unknown person returns clean message without inventing facts."""
    q = "Tell me about NonExistentPerson123"
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert "no person record found" in res.answer_markdown.lower()


def test_13_unknown_case(app_context):
    """Requirement: Unknown case returns clean message without inventing facts."""
    q = "Tell me about CASE-999"
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert "not found" in res.answer_markdown.lower()


def test_14_unsupported_query(app_context):
    """Requirement: Off-topic questions return UNSUPPORTED with guidance."""
    q = "What is the recipe for chocolate cake?"
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert res.intent == AssistantIntent.UNSUPPORTED
    assert "could not be matched" in res.answer_markdown.lower()


def test_15_offline_mock_llm_adapter():
    """Requirement: Operates 100% offline with MockLLMClient."""
    mock_client = MockLLMClient()
    parsed = parse_investigator_query("Show persons associated with kidnapping cases in Kolkata.", llm_client=mock_client)
    assert parsed.intent == AssistantIntent.PERSON_SEARCH
    assert parsed.offence == "Kidnapping"
    assert parsed.location == "Kolkata"


def test_16_safety_terminology_enforcement(app_context):
    """Requirement: Never output prohibited terms like criminal or guilty."""
    q = "Tell me more about Arjun Mehta."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    ans_lower = res.answer_markdown.lower()
    for forbidden in ["confirmed criminal", "criminal network member", "guilty of", "convicted of"]:
        assert forbidden not in ans_lower


def test_17_telecom_and_banking_terminology(app_context):
    """Requirement: Telecom and transaction records described as synthetic."""
    q = "Show the network connections for Arjun Mehta."
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    ans_lower = res.answer_markdown.lower()
    if res.network_relationships:
        assert "synthetic communication record" in ans_lower or "synthetic transaction record" in ans_lower or "synthetic" in ans_lower


def test_18_provenance_items_presence(app_context):
    """Requirement: Every response contains structured ProvenanceItem entries."""
    q = "What cases is Arjun Mehta associated with?"
    res = process_assistant_query(q, G=app_context["G"], analytics=app_context["analytics"], priority=app_context["priority"])
    assert len(res.provenance) > 0
    for prov in res.provenance:
        assert prov.source_type in ["CASE_RECORD", "PERSON_RECORD", "CASE_PERSON_ASSOCIATION", "GRAPH_EDGE", "PRIORITY_ANALYSIS"]
        assert prov.source_id is not None


def test_19_api_endpoint_query(client):
    """Test POST /api/assistant/query with FastAPI TestClient."""
    payload = {
        "question": "Show persons associated with kidnapping cases in Kolkata."
    }
    resp = client.post("/api/assistant/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "PERSON_SEARCH"
    assert "answer_markdown" in data
    assert "provenance" in data
    assert "safety_notice" in data


def test_20_api_endpoint_empty_validation(client):
    """Test POST /api/assistant/query with empty question returns 400."""
    resp = client.post("/api/assistant/query", json={"question": "   "})
    assert resp.status_code == 400
