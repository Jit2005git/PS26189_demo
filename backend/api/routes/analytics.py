from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from api.dependencies import get_analytics

router = APIRouter()

@router.get("/analytics")
def get_all_analytics(analytics: dict = Depends(get_analytics)):
    return analytics

@router.get("/analytics/entities/{entity_id}")
def get_entity_analytics(entity_id: str, analytics: dict = Depends(get_analytics)):
    entity_analytics = {}
    
    found = False
    for r in analytics.get("degree_centrality", []):
        if r["entity_id"] == entity_id:
            entity_analytics["degree_centrality"] = r["centrality_score"]
            found = True
            
    for r in analytics.get("betweenness_centrality", []):
        if r["entity_id"] == entity_id:
            entity_analytics["betweenness_centrality"] = r["betweenness_score"]
            found = True
            
    for r in analytics.get("cross_case_connectivity", []):
        if r["entity_id"] == entity_id:
            entity_analytics["cross_case_connectivity"] = r
            found = True
            
    for r in analytics.get("community_bridging", []):
        if r["entity_id"] == entity_id:
            entity_analytics["community_bridging"] = r
            found = True
            
    for r in analytics.get("relationship_diversity", []):
        if r["entity_id"] == entity_id:
            entity_analytics["relationship_diversity"] = r
            found = True
            
    for c in analytics.get("communities", []):
        if entity_id in c["entities"]:
            entity_analytics["community_id"] = c["community_id"]
            found = True
            
    if not found:
        raise HTTPException(status_code=404, detail="Analytics for entity not found")
        
    return entity_analytics
