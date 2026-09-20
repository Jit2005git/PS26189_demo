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

from api.dependencies import (
    get_graph,
    get_cases,
    get_analytics,
    get_priority,
    require_permission,
    get_investigation_access_repo,
)
from modules.auth.models import User
from modules.auth.permissions import Permission
from modules.auth.investigation_access import InvestigationAccessRepository
from modules.assistant.models import AssistantQueryRequest, AssistantQueryResponse
from modules.assistant.assistant_service import process_assistant_query

router = APIRouter(
    dependencies=[Depends(require_permission(Permission.USE_AI_ASSISTANT))]
)


@router.post("/assistant/query", response_model=AssistantQueryResponse)
def query_assistant(
    request: AssistantQueryRequest,
    current_user: User = Depends(require_permission(Permission.USE_AI_ASSISTANT)),
    inv_repo: InvestigationAccessRepository = Depends(get_investigation_access_repo),
    inventory: list = Depends(get_cases),
    G: nx.MultiDiGraph = Depends(get_graph),
    analytics: dict = Depends(get_analytics),
    priority: list = Depends(get_priority)
):
    """
    Step 21: Grounded AI Investigation Assistant query endpoint.
    Retrieval is strictly gated server-side by officer authorized investigation scope.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Inquiry question cannot be empty.")

    authorized_case_ids = inv_repo.get_authorized_case_ids_for_officer(
        current_user.user_id,
        current_user.role.value,
        inventory
    )
    scope = inv_repo.get_jurisdiction(current_user.user_id)

    context = {
        "active_case_id": request.active_case_id,
        "active_person_id": request.active_person_id,
        "conversation_context": request.conversation_context,
        "user_id": current_user.user_id,
        "user_role": current_user.role.value,
        "authorized_case_ids": list(authorized_case_ids),
        "jurisdiction": scope.model_dump() if scope else None,
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

