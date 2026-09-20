import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import networkx as nx

from modules.graph.dataset_integration import build_dataset_graph, get_case_inventory
from modules.analytics.graph_analytics import analyze_graph
from modules.priority.priority_scorer import calculate_priority_scores
from modules.auth.demo_users import get_demo_user_repository
from modules.auth.tokens import TokenStore
from modules.auth.citizen_access import create_demo_citizen_access_repository
from modules.auth.investigation_access import create_demo_investigation_access_repository
from api.routes import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Load the complete case inventory
    print("Building application context: Loading case inventory...")
    cases = get_case_inventory()
    app.state.cases = cases
    
    # 2. Build integration graph exactly once
    print("Building application context: Loading dataset graph...")
    G = build_dataset_graph()
    app.state.graph = G
    
    # 3. Run graph analytics exactly once
    print("Building application context: Running graph analytics...")
    analytics = analyze_graph(G)
    app.state.analytics = analytics
    
    # 4. Calculate priority scores exactly once
    print("Building application context: Calculating priority scores...")
    priority = calculate_priority_scores(G, analytics)
    app.state.priority = priority
    
    # 5. Initialize authentication store, citizen access repository, and investigation access repository
    print("Building application context: Initializing authentication repository, token store & investigation access...")
    app.state.user_repo = get_demo_user_repository()
    app.state.token_store = TokenStore()
    app.state.citizen_access_repo = create_demo_citizen_access_repository()
    app.state.investigation_access_repo = create_demo_investigation_access_repository()
    
    print("Application context fully initialized. API ready.")
    yield
    # Clean up resources if necessary
    app.state.cases = []
    app.state.graph = nx.MultiDiGraph()
    app.state.analytics = {}
    app.state.priority = []
    if hasattr(app.state, "token_store") and app.state.token_store:
        app.state.token_store.clear()
    if hasattr(app.state, "citizen_access_repo") and app.state.citizen_access_repo:
        app.state.citizen_access_repo.clear()
    if hasattr(app.state, "investigation_access_repo") and app.state.investigation_access_repo:
        app.state.investigation_access_repo.clear()

app = FastAPI(
    title="Investigation Intelligence API",
    description="SYNTHETIC DEMONSTRATION DATA. Analytical decision-support interface. Requires human verification.",
    version="1.0.0",
    lifespan=lifespan
)

# Initialize fallback state on app immediately for test isolation
app.state.user_repo = get_demo_user_repository()
app.state.token_store = TokenStore()
app.state.citizen_access_repo = create_demo_citizen_access_repository()
app.state.investigation_access_repo = create_demo_investigation_access_repo = create_demo_investigation_access_repository()



# CORS Configuration
# Retain local development origins and allow external production frontend configuration via environment variables
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

env_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("FRONTEND_URL")
if env_origins:
    for origin in env_origins.split(","):
        cleaned = origin.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
