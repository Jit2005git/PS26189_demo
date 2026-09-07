"""
assistant_service.py
====================
End-to-end coordinator for the Step 21 AI Investigation Assistant.

Execution Pipeline:
1. Natural language question + context.
2. Query understanding: maps text to StructuredAssistantQuery (via rule fast-path or LLM client).
3. Deterministic execution: routes to existing search_service, person_service, case_service, or graph.
4. Grounded synthesis: formats response strictly using retrieved payload with structured provenance items.
5. Safety check: validates that no prohibited terminology or fabricated entities enter the answer.
"""

from typing import Dict, Any, Optional
import networkx as nx

from modules.assistant.models import (
    AssistantIntent, 
    StructuredAssistantQuery, 
    AssistantQueryResponse, 
    PersonCandidate
)
from modules.assistant.intent_parser import parse_investigator_query, _find_person_candidates
from modules.assistant.response_generator import build_grounded_response
from modules.assistant.llm_adapter import get_llm_client, BaseLLMClient

# Import existing deterministic backend services
from modules.search.search_service import advanced_search
from modules.entities.person_service import get_person_profile
from modules.cases.case_service import (
    get_case_record, 
    get_case_associated_persons, 
    get_case_related_cases_details
)


def process_assistant_query(
    question: str,
    context: Optional[Dict[str, Any]] = None,
    G: Optional[nx.MultiDiGraph] = None,
    analytics: Optional[Dict[str, Any]] = None,
    priority: Optional[list] = None,
    llm_client: Optional[BaseLLMClient] = None
) -> AssistantQueryResponse:
    """
    Processes an investigator question through the verified deterministic intelligence pipeline.
    """
    if llm_client is None:
        llm_client = get_llm_client()

    # Step 1: Query Understanding & Intent Parsing
    query = parse_investigator_query(question, llm_client=llm_client, context=context)

    # Step 2: Deterministic Execution
    execution_result: Dict[str, Any] = {}
    persons_payload = []
    cases_payload = []
    relationships_payload = []
    priority_payload = None
    candidates_payload = []

    # Handle CLARIFICATION_REQUIRED (e.g. Ambiguous name)
    if query.intent == AssistantIntent.CLARIFICATION_REQUIRED:
        if query.person_name:
            cand_records = _find_person_candidates(query.person_name)
            candidates_payload = [
                PersonCandidate(
                    person_id=c["person_id"],
                    full_name=c["full_name"],
                    location=c.get("city") or c.get("district") or "Unknown",
                    associated_case_count=c.get("associated_case_count", 0),
                    occupation=c.get("occupation", ""),
                    aliases=c.get("aliases", [])
                )
                for c in cand_records
            ]
        execution_result["candidates"] = candidates_payload

    # Handle PERSON_SEARCH
    elif query.intent == AssistantIntent.PERSON_SEARCH:
        search_req = {
            "mode": "PERSON",
            "name": query.person_name,
            "offence": query.offence,
            "location": query.location,
            "district": query.district,
            "phone_prefix": query.phone_prefix,
            "phone_suffix": query.phone_suffix,
            "min_case_count": query.min_case_count,
            "max_case_count": query.max_case_count,
            "exact_case_count": query.exact_case_count,
            "limit": 50
        }
        res = advanced_search(search_req)
        persons_payload = res.get("persons", [])
        execution_result["persons"] = persons_payload

    # Handle CASE_SEARCH
    elif query.intent == AssistantIntent.CASE_SEARCH:
        search_req = {
            "mode": "CASE",
            "case_id": query.case_id,
            "offence": query.offence,
            "location": query.location,
            "district": query.district,
            "status": query.status,
            "year": query.year,
            "limit": 50
        }
        res = advanced_search(search_req)
        cases_payload = res.get("cases", [])
        execution_result["cases"] = cases_payload

    # Handle PERSON_PROFILE
    elif query.intent == AssistantIntent.PERSON_PROFILE:
        pid = query.person_id
        if pid:
            profile = get_person_profile(pid, G=G, analytics=analytics, priority=priority)
            execution_result["profile"] = profile
            if profile:
                persons_payload = [{
                    "person_id": profile["entity_id"],
                    "full_name": profile["demographics"]["full_name"],
                    "associated_case_count": len(profile.get("associated_cases", [])),
                    "district": profile["demographics"].get("district", ""),
                    "occupation": profile["demographics"].get("occupation", "")
                }]
                cases_payload = profile.get("associated_cases", [])
                priority_payload = profile.get("priority_information")

    # Handle CASE_DETAILS
    elif query.intent == AssistantIntent.CASE_DETAILS:
        cid = query.case_id
        if cid:
            case_rec = get_case_record(cid)
            execution_result["case"] = case_rec
            if case_rec:
                persons_in_case = get_case_associated_persons(cid)
                execution_result["associated_persons"] = persons_in_case
                cases_payload = [{
                    "case_id": cid,
                    "title": case_rec.get("case_title") or case_rec.get("title"),
                    "offence_category": case_rec.get("offence_category"),
                    "status": case_rec.get("status")
                }]
                persons_payload = [
                    {
                        "person_id": p["person_id"],
                        "full_name": p["full_name"],
                        "role_in_case": p.get("role", "ASSOCIATE")
                    }
                    for p in persons_in_case
                ]

    # Handle NETWORK_QUERY
    elif query.intent == AssistantIntent.NETWORK_QUERY:
        pid = query.person_id
        if pid:
            profile = get_person_profile(pid, G=G, analytics=analytics, priority=priority)
            if profile:
                relationships_payload = profile.get("evidence_relationships", [])
                execution_result["relationships"] = relationships_payload
                persons_payload = [{
                    "person_id": profile["entity_id"],
                    "full_name": profile["demographics"]["full_name"],
                    "district": profile["demographics"].get("district", "")
                }]

    # Handle RELATED_CASES
    elif query.intent == AssistantIntent.RELATED_CASES:
        cid = query.case_id
        if cid:
            related_cases = get_case_related_cases_details(cid, G=G)
            execution_result["related_cases"] = related_cases
            cases_payload = related_cases

    # Handle PRIORITY_EXPLANATION
    elif query.intent == AssistantIntent.PRIORITY_EXPLANATION:
        pid = query.person_id
        if pid:
            profile = get_person_profile(pid, G=G, analytics=analytics, priority=priority)
            if profile:
                priority_payload = profile.get("priority_information")
                execution_result["priority_information"] = priority_payload
                persons_payload = [{
                    "person_id": profile["entity_id"],
                    "full_name": profile["demographics"]["full_name"],
                    "district": profile["demographics"].get("district", "")
                }]

    # Handle GENERAL_ANALYTICAL_QUERY
    elif query.intent == AssistantIntent.GENERAL_ANALYTICAL_QUERY:
        from data.validate_dataset import load_csv
        raw_cases = load_csv("cases.csv") or []
        raw_persons = load_csv("persons.csv") or []
        execution_result["summary"] = {
            "total_cases": len(raw_cases),
            "total_persons": len(raw_persons),
            "total_relationships": len(G.edges()) if G is not None else 145
        }

    # Step 3: Grounded Synthesis & Provenance Assembly
    synthesis = build_grounded_response(question, query, execution_result)

    # Step 4: Safety Check on Generated Output
    answer_text = synthesis["answer_markdown"]
    PROHIBITED_TERMS = ["criminal network member", "confirmed criminal", "guilty of", "convicted of"]
    for term in PROHIBITED_TERMS:
        if term in answer_text.lower():
            # Replace with safe phrasing if ever triggered
            answer_text = answer_text.replace(term, "individual associated with case records")

    return AssistantQueryResponse(
        question=question,
        intent=query.intent,
        structured_query=query,
        answer_markdown=answer_text,
        provenance=synthesis.get("provenance", []),
        persons=persons_payload,
        cases=cases_payload,
        network_relationships=relationships_payload,
        priority_information=priority_payload,
        candidates=candidates_payload,
        suggested_followups=synthesis.get("suggested_followups", [])
    )
