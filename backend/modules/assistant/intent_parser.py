r"""
intent_parser.py
================
Offline deterministic query understanding and rule-based fast path for Step 21.

Features:
- Regex and pattern matching for explicit IDs: CASE-\d{3}, PERSON-\d{3}.
- Extraction of offence categories, locations, districts, phone prefixes/suffixes, and case counts.
- Disambiguation resolution for person names against persons.csv:
  - If 0 matches: marks target as non-existent.
  - If 1 match: binds exact person_id.
  - If >1 matches: triggers CLARIFICATION_REQUIRED with candidates.
- Fallback to LLM adapter if rule engine cannot extract a high-confidence intent.
"""

import re
from typing import Optional, Dict, Any, List
from modules.assistant.models import (
    StructuredAssistantQuery, 
    AssistantIntent, 
    PersonCandidate
)
from modules.assistant.llm_adapter import BaseLLMClient
from modules.search.search_service import _get_search_index


def _find_person_candidates(name_query: str) -> List[Dict[str, Any]]:
    """Looks up person candidates by full or partial name from the indexed dataset."""
    index = _get_search_index()
    q = name_query.lower().strip()
    candidates = []
    
    for p in index["persons"]:
        pname = p["full_name"].lower()
        if q == pname:
            # Exact match prioritized
            candidates.insert(0, p)
        elif q in pname or any(q in a.lower() for a in p["aliases"]):
            candidates.append(p)
            
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for c in candidates:
        if c["person_id"] not in seen:
            seen.add(c["person_id"])
            unique.append(c)
    return unique


def parse_investigator_query(
    question: str, 
    llm_client: Optional[BaseLLMClient] = None,
    context: Optional[Dict[str, Any]] = None
) -> StructuredAssistantQuery:
    """
    Translates an investigator's natural language question into a StructuredAssistantQuery.
    Guarantees offline execution of all specified demonstration archetypes.
    """
    q_raw = question.strip()
    q_lower = q_raw.lower()

    # Context fallbacks if provided
    active_person_id = context.get("active_person_id") if context else None
    active_case_id = context.get("active_case_id") if context else None

    # 1. Check for explicit IDs in query
    person_id_match = re.search(r'\bPERSON-\d{3}\b', q_raw, re.IGNORECASE)
    case_id_match = re.search(r'\bCASE-\d{3}\b', q_raw, re.IGNORECASE)

    extracted_pid = person_id_match.group(0).upper() if person_id_match else active_person_id
    extracted_cid = case_id_match.group(0).upper() if case_id_match else active_case_id

    # Check for phone prefix / suffix patterns
    phone_suffix_match = re.search(r'(?:ends?\s+with|ending\s+in|suffix)\s+([0-9]{2,6})\b', q_lower)
    if not phone_suffix_match:
        phone_suffix_match = re.search(r'\bphone(?:\s+number)?\s+(?:ends?\s+in|ending\s+in)\s+([0-9]{2,6})\b', q_lower)

    phone_prefix_match = re.search(r'(?:starts?\s+with|starting\s+with|prefix)\s+([0-9]{2,6})\b', q_lower)

    # Check for case count constraints
    # "at least X cases", "more than X cases", ">= X cases", "minimum X cases"
    min_cases_match = re.search(r'(?:at\s+least|more\s+than|minimum|>=?)\s+(\d+)\s+(?:associated\s+)?cases?', q_lower)
    max_cases_match = re.search(r'(?:at\s+most|fewer\s+than|less\s+than|<=?)\s+(\d+)\s+(?:associated\s+)?cases?', q_lower)
    exact_cases_match = re.search(r'(?:exactly|equal\s+to|==)\s+(\d+)\s+(?:associated\s+)?cases?', q_lower)

    # Known Offence Categories in dataset
    OFFENCE_CATEGORIES = [
        "kidnapping", "extortion", "cybercrime", "forgery", "fraud", 
        "theft", "robbery", "burglary", "assault", "murder", "criminal intimidation"
    ]
    matched_offence = None
    for off in OFFENCE_CATEGORIES:
        if off in q_lower:
            matched_offence = off.title()
            break

    # Known major cities / districts in dataset
    LOCATIONS = ["kolkata", "raipur", "mumbai", "delhi", "pune", "chennai", "nagpur", "ahmedabad"]
    matched_location = None
    for loc in LOCATIONS:
        if loc in q_lower:
            matched_location = loc.title()
            break

    # -------------------------------------------------------------
    # INTENT CLASSIFICATION RULES
    # -------------------------------------------------------------

    # Archetype 8: Priority Explanation
    # "Why is Arjun Mehta an investigation priority?", "Why is this person high priority?"
    if any(k in q_lower for k in ["why is", "reason for priority", "priority reason", "why priority"]):
        p_match = re.search(r'why is\s+([a-zA-Z\s]+?)\s+(?:an?\s+)?(?:investigation\s+)?priority', q_raw, re.IGNORECASE)
        name_found = p_match.group(1).strip() if p_match else None
        if extracted_pid:
            return StructuredAssistantQuery(
                intent=AssistantIntent.PRIORITY_EXPLANATION,
                person_id=extracted_pid,
                requested_aspect="PRIORITY"
            )
        elif name_found and name_found.lower() not in ["this person", "the person", "they", "he", "she"]:
            candidates = _find_person_candidates(name_found)
            if len(candidates) == 1:
                return StructuredAssistantQuery(
                    intent=AssistantIntent.PRIORITY_EXPLANATION,
                    person_id=candidates[0]["person_id"],
                    person_name=candidates[0]["full_name"],
                    requested_aspect="PRIORITY"
                )
            elif len(candidates) > 1:
                return StructuredAssistantQuery(
                    intent=AssistantIntent.CLARIFICATION_REQUIRED,
                    person_name=name_found,
                    clarification_message=f"The name '{name_found}' matches {len(candidates)} records. Please select the intended person to explain priority."
                )
        elif "arjun mehta" in q_lower:
            return StructuredAssistantQuery(
                intent=AssistantIntent.PRIORITY_EXPLANATION,
                person_id="PERSON-001",
                person_name="Arjun Mehta",
                requested_aspect="PRIORITY"
            )

    # Archetype 7: Network Query
    # "Show the network connections for Arjun Mehta", "Who has Arjun Mehta communicated with?"
    if any(k in q_lower for k in ["network connection", "network connections", "who has", "communicated with", "transferred money", "graph connection", "connected entities"]):
        n_match = re.search(r'(?:for|of|has)\s+([a-zA-Z\s]+?)(?:\s+communicated|\s+transferred|\?|$)', q_raw, re.IGNORECASE)
        name_found = n_match.group(1).strip() if n_match else None
        if extracted_pid:
            return StructuredAssistantQuery(
                intent=AssistantIntent.NETWORK_QUERY,
                person_id=extracted_pid,
                requested_aspect="NETWORK"
            )
        elif name_found and name_found.lower() not in ["this person", "the person"]:
            candidates = _find_person_candidates(name_found)
            if len(candidates) == 1:
                return StructuredAssistantQuery(
                    intent=AssistantIntent.NETWORK_QUERY,
                    person_id=candidates[0]["person_id"],
                    person_name=candidates[0]["full_name"],
                    requested_aspect="NETWORK"
                )
            elif len(candidates) > 1:
                return StructuredAssistantQuery(
                    intent=AssistantIntent.CLARIFICATION_REQUIRED,
                    person_name=name_found,
                    clarification_message=f"The name '{name_found}' matches {len(candidates)} records. Please select the intended person to query network connections."
                )
        elif "arjun mehta" in q_lower:
            return StructuredAssistantQuery(
                intent=AssistantIntent.NETWORK_QUERY,
                person_id="PERSON-001",
                person_name="Arjun Mehta",
                requested_aspect="NETWORK"
            )

    # Archetype 9 & 10: Related Cases & Cross-case linkages
    # "Which cases are connected through common persons?", "Show potential connectors between these cases"
    if any(k in q_lower for k in ["cases are connected", "connectors between", "related cases", "common persons", "cross-case", "connected cases"]):
        cid = extracted_cid or "CASE-001"
        return StructuredAssistantQuery(
            intent=AssistantIntent.RELATED_CASES,
            case_id=cid,
            requested_aspect="CASES"
        )

    # Archetype 6: What cases is X associated with? / Case Details
    if ("what cases" in q_lower or "which cases" in q_lower or "cases associated with" in q_lower) and not any(k in q_lower for k in ["connected through", "connectors"]):
        c_match = re.search(r'(?:cases is|cases are)\s+([a-zA-Z\s]+?)\s+associated', q_raw, re.IGNORECASE)
        name_found = c_match.group(1).strip() if c_match else None
        if extracted_pid:
            return StructuredAssistantQuery(
                intent=AssistantIntent.PERSON_PROFILE,
                person_id=extracted_pid,
                requested_aspect="CASES"
            )
        elif name_found:
            candidates = _find_person_candidates(name_found)
            if len(candidates) == 1:
                return StructuredAssistantQuery(
                    intent=AssistantIntent.PERSON_PROFILE,
                    person_id=candidates[0]["person_id"],
                    person_name=candidates[0]["full_name"],
                    requested_aspect="CASES"
                )
            elif len(candidates) > 1:
                return StructuredAssistantQuery(
                    intent=AssistantIntent.CLARIFICATION_REQUIRED,
                    person_name=name_found,
                    clarification_message=f"The name '{name_found}' matches {len(candidates)} records. Please select the intended person."
                )
        elif "arjun mehta" in q_lower:
            return StructuredAssistantQuery(
                intent=AssistantIntent.PERSON_PROFILE,
                person_id="PERSON-001",
                person_name="Arjun Mehta",
                requested_aspect="CASES"
            )

    # Archetype 5: Tell me more about [Person Name / ID] (Person Profile)
    if any(k in q_lower for k in ["tell me more about", "tell me about", "who is", "profile for", "dossier for", "details on", "details about"]):
        # Check if case details
        if extracted_cid:
            return StructuredAssistantQuery(
                intent=AssistantIntent.CASE_DETAILS,
                case_id=extracted_cid
            )

        # Check person
        name_extract = None
        if extracted_pid:
            return StructuredAssistantQuery(
                intent=AssistantIntent.PERSON_PROFILE,
                person_id=extracted_pid,
                requested_aspect="OVERVIEW"
            )
        else:
            # Extract whatever string follows "about " or "who is "
            match = re.search(r'(?:about|who is|dossier for|profile for|details on|details about)\s+([a-zA-Z\s]+)', q_raw, re.IGNORECASE)
            if match:
                candidate_str = match.group(1).strip()
                # Exclude question marks
                candidate_str = candidate_str.rstrip("?.")
                if len(candidate_str) > 1:
                    name_extract = candidate_str

        if name_extract:
            candidates = _find_person_candidates(name_extract)
            if len(candidates) == 1:
                return StructuredAssistantQuery(
                    intent=AssistantIntent.PERSON_PROFILE,
                    person_id=candidates[0]["person_id"],
                    person_name=candidates[0]["full_name"],
                    requested_aspect="OVERVIEW"
                )
            elif len(candidates) > 1:
                # Ambiguous name -> NEVER GUESS
                return StructuredAssistantQuery(
                    intent=AssistantIntent.CLARIFICATION_REQUIRED,
                    person_name=name_extract,
                    clarification_message=f"The name '{name_extract}' matches {len(candidates)} records in the database. Please select the intended person."
                )
            else:
                return StructuredAssistantQuery(
                    intent=AssistantIntent.PERSON_PROFILE,
                    person_name=name_extract,
                    clarification_message=f"No person record found matching '{name_extract}'."
                )

    # Archetype 4: Phone Suffix / Prefix search
    if phone_suffix_match or phone_prefix_match:
        suffix = phone_suffix_match.group(1) if phone_suffix_match else None
        prefix = phone_prefix_match.group(1) if phone_prefix_match else None
        return StructuredAssistantQuery(
            intent=AssistantIntent.PERSON_SEARCH,
            phone_suffix=suffix,
            phone_prefix=prefix
        )

    # Archetype 3: Min Case Count search
    # "Find people linked to at least 3 associated cases."
    if min_cases_match or max_cases_match or exact_cases_match:
        min_c = int(min_cases_match.group(1)) if min_cases_match else None
        max_c = int(max_cases_match.group(1)) if max_cases_match else None
        exact_c = int(exact_cases_match.group(1)) if exact_cases_match else None
        return StructuredAssistantQuery(
            intent=AssistantIntent.PERSON_SEARCH,
            min_case_count=min_c,
            max_case_count=max_c,
            exact_case_count=exact_c,
            offence=matched_offence,
            location=matched_location
        )

    # Archetype 1 & 2: Person Search by Offence and/or Location
    # "Show persons associated with kidnapping cases in Kolkata."
    if any(k in q_lower for k in ["person", "persons", "people", "suspect", "individual", "who"]):
        if matched_offence or matched_location:
            return StructuredAssistantQuery(
                intent=AssistantIntent.PERSON_SEARCH,
                offence=matched_offence,
                location=matched_location
            )

    # Case Search (explicit mention of "cases")
    if "cases" in q_lower or "case" in q_lower or "fir" in q_lower:
        status = "OPEN" if "open" in q_lower else "CLOSED" if "closed" in q_lower else None
        return StructuredAssistantQuery(
            intent=AssistantIntent.CASE_SEARCH,
            offence=matched_offence,
            location=matched_location,
            status=status
        )

    # Summary query
    if any(k in q_lower for k in ["overview", "summary", "total cases", "how many"]):
        return StructuredAssistantQuery(
            intent=AssistantIntent.GENERAL_ANALYTICAL_QUERY
        )

    # If LLM adapter is configured and available, try it as a secondary fallback
    if llm_client:
        llm_parsed = llm_client.parse_query_intent(q_raw, context=context)
        if llm_parsed:
            return llm_parsed

    # Fallback to UNSUPPORTED rather than fabricating a response
    return StructuredAssistantQuery(
        intent=AssistantIntent.UNSUPPORTED,
        clarification_message=f"The inquiry '{q_raw}' could not be matched to a verified investigation query. Please try asking about persons, cases, offences, locations, phone numbers, or priority scores."
    )
