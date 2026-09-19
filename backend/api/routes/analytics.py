"""
analytics.py
============
Analytics API routes with RBAC protection.
- /analytics: Aggregated investigation and network metrics (IO, IPS, HOME_MINISTRY)
- /analytics/cross-case: Multi-case connectivity & community bridging (IPS)
- /analytics/trends & /analytics/strategic-trends: Strategic trends over time (HOME_MINISTRY)
- /analytics/regional-statistics: District and regional stats (HOME_MINISTRY)
- /analytics/reports: Strategic and operational summary reports (IPS, HOME_MINISTRY)
- /analytics/entities/{entity_id}: Entity-level analytics (IO, IPS only)
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from api.dependencies import get_analytics, require_permission
from modules.auth.permissions import Permission

router = APIRouter()


@router.get(
    "/analytics",
    dependencies=[Depends(require_permission(Permission.VIEW_ANALYTICS, Permission.VIEW_AGGREGATED_ANALYTICS))]
)
def get_all_analytics(analytics: dict = Depends(get_analytics)):
    """
    Returns complete high-level graph analytics.
    Accessible to INVESTIGATING_OFFICER, IPS_OFFICER, and HOME_MINISTRY.
    """
    return analytics


@router.get(
    "/analytics/cross-case",
    dependencies=[Depends(require_permission(Permission.VIEW_CROSS_CASE_ANALYTICS))]
)
def get_cross_case_analytics(analytics: dict = Depends(get_analytics)):
    """
    Multi-case connectivity patterns and bridging entities.
    Accessible strictly to IPS_OFFICER supervisory tier.
    """
    return {
        "cross_case_connectivity": analytics.get("cross_case_connectivity", []),
        "community_bridging": analytics.get("community_bridging", []),
        "communities_count": len(analytics.get("communities", [])),
    }


@router.get(
    "/analytics/trends",
    dependencies=[Depends(require_permission(Permission.VIEW_TRENDS, Permission.VIEW_AGGREGATED_ANALYTICS))]
)
@router.get(
    "/analytics/strategic-trends",
    dependencies=[Depends(require_permission(Permission.VIEW_TRENDS, Permission.VIEW_AGGREGATED_ANALYTICS))]
)
def get_strategic_trends(analytics: dict = Depends(get_analytics)):
    """
    Macro crime trends and strategic indicators.
    Accessible to HOME_MINISTRY oversight.
    """
    return {
        "trend_summary": "Macro incident indicators across reporting periods",
        "communities_overview": [
            {"community_id": c["community_id"], "size": len(c.get("entities", []))}
            for c in analytics.get("communities", [])[:10]
        ],
        "degree_distribution_top": analytics.get("degree_centrality", [])[:10],
    }


@router.get(
    "/analytics/regional-statistics",
    dependencies=[Depends(require_permission(Permission.VIEW_REGIONAL_STATISTICS))]
)
def get_regional_statistics(analytics: dict = Depends(get_analytics)):
    """
    Regional and state-level statistical breakdowns.
    Accessible to HOME_MINISTRY oversight.
    """
    return {
        "jurisdiction_scope": "National / Regional Aggregates",
        "total_communities_monitored": len(analytics.get("communities", [])),
        "high_centrality_nodes": len(analytics.get("betweenness_centrality", [])),
        "status": "Aggregated strategic telemetry ready",
    }


@router.get(
    "/analytics/reports",
    dependencies=[Depends(require_permission(Permission.GENERATE_REPORTS, Permission.GENERATE_STRATEGIC_REPORTS))]
)
def generate_reports(analytics: dict = Depends(get_analytics)):
    """
    Generates operational or strategic intelligence reports.
    Accessible to IPS_OFFICER and HOME_MINISTRY.
    """
    return {
        "report_type": "Executive Intelligence Brief",
        "total_cross_case_links": len(analytics.get("cross_case_connectivity", [])),
        "top_bridging_entities": analytics.get("community_bridging", [])[:5],
        "generated_status": "CONFIDENTIAL_OFFICIAL",
    }


@router.get(
    "/analytics/entities/{entity_id}",
    dependencies=[Depends(require_permission(Permission.VIEW_ANALYTICS))]
)
def get_entity_analytics(entity_id: str, analytics: dict = Depends(get_analytics)):
    """
    Entity-specific graph metrics.
    Restricted to field investigators and supervisory officers (IO, IPS).
    Denied to HOME_MINISTRY and CITIZEN.
    """
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
