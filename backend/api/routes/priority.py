from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from api.dependencies import get_priority, require_permission
from modules.auth.permissions import Permission
from api.models import PriorityResult

router = APIRouter(
    dependencies=[Depends(require_permission(Permission.VIEW_PRIORITY_LEADS))]
)


@router.get("/priority", response_model=List[PriorityResult])
def get_priority_scores(
    entity_type: Optional[str] = None,
    priority_level: Optional[str] = None,
    limit: Optional[int] = Query(100, ge=1),
    priority: list = Depends(get_priority)
):
    results = []
    
    for p in priority:
        if entity_type and p["entity_type"] != entity_type:
            continue
        if priority_level and p["priority_level"] != priority_level:
            continue
            
        # Pydantic will validate the response against PriorityResult automatically
        results.append(p)
        
        if len(results) >= limit:
            break
            
    return results
