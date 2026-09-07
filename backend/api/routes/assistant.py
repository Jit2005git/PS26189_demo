"""
assistant.py
============
API endpoints for the Step 21 AI Investigation Assistant.

Exposes:
- POST /api/assistant/query: Accepts natural language investigator questions and returns
  grounded structured answers, deterministic provenance items, and entity cards.
"""

from fastapi import APIRouter, Depends, HTTPException
import networkx as nx

from api.dependencies import get_graph, get_analytics, get_priority
from modules.assistant.models import AssistantQueryRequest, AssistantQueryResponse
from modules.assistant.assistant_service import process_assistant_query

router = APIRouter()

@router.post("/assistant/query", response_model=AssistantQueryResponse)
def query_assistant(
    request: AssistantQueryRequest,
    G: nx.MultiDiGraph = Depends(get_graph),
    analytics: dict = Depends(get_analytics),
    priority: list = Depends(get_priority)
):
    """
    Step 21: Grounded AI Investigation Assistant query endpoint.
    Converts natural language question -> structured query -> deterministic execution -> grounded explanation.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Inquiry question cannot be empty.")

    context = {
        "active_case_id": request.active_case_id,
        "active_person_id": request.active_person_id,
        "conversation_context": request.conversation_context
    }

    try:
        response = process_assistant_query(
            question=request.question,
            context=context,
            G=G,
            analytics=analytics,
            priority=priority
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant query processing failed: {str(e)}")
