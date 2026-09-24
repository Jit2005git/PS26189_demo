# PS26189 --- AI-Powered Criminal Network Analysis System

```{=html}
<p align="center">
```
`<strong>`{=html}Smart India Hackathon 2026 · Problem Statement
26189`</strong>`{=html}`<br>`{=html} AI-assisted investigation
intelligence through NLP, entity resolution, relationship analysis,
knowledge graphs, explainable analytics, and grounded AI assistance.
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<a href="https://github.com/Jit2005git/PS26189_demo">`{=html}GitHub
Repository`</a>`{=html} ·
`<a href="https://ps26189-frontend.onrender.com">`{=html}Live
Frontend`</a>`{=html} ·
`<a href="https://ps26189-backend-v2.onrender.com/docs">`{=html}API
Docs`</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## Overview

**PS26189** is an internal Smart India Hackathon 2026 MVP for
demonstrating how fragmented investigation information can be
transformed into a structured, explainable network of entities and
relationships.

The system combines **NLP, deterministic extraction, embedding-assisted
entity resolution, supervised relationship-confidence estimation, graph
analytics, role-based authorization, audit logging, provenance, and a
grounded AI investigation assistant** into a single web application.

The objective is not to replace investigators or make decisions about
guilt. The objective is to provide a structured analytical workspace
where a human investigator can move from:

> **Investigation Data → Entities → Relationships → Knowledge Graph →
> Cross-Case Connections → Analytics → Investigation Priority →
> Evidence/Provenance → Grounded Explanation**

This is a working demonstration and architectural foundation, not a
production law-enforcement deployment.

------------------------------------------------------------------------

## Core Design Philosophy

> **Graph = Source of Truth · ML = Evidence/Confidence · LLM =
> Explanation/Interface**

The LLM is deliberately not treated as the system's intelligence engine.

``` text
Synthetic Investigation Data
          ↓
NLP Preprocessing
          ↓
NER + Structured Rules
          ↓
Entity Normalization
          ↓
Embedding-Based Entity Resolution
          ↓
Relationship Extraction
          ↓
Relationship Evidence / Confidence Model
          ↓
NetworkX Knowledge Graph
          ↓
Graph Analytics + Cross-Case Analysis
          ↓
Investigation Priority
          ↓
Evidence / Provenance
          ↓
Grounded AI Investigation Assistant
          ↓
Human Investigator Review
```

The LLM must never invent graph relationships, evidence, confidence
values, or authorization decisions.

------------------------------------------------------------------------

## Current Features

### Investigation Intelligence

-   Synthetic investigation data
-   NLP preprocessing
-   Named Entity Recognition
-   Structured entity extraction
-   Entity normalization
-   Embedding-assisted entity resolution
-   Relationship extraction
-   Relationship-confidence estimation
-   NetworkX knowledge graph
-   Cross-case relationship discovery
-   Degree and betweenness centrality
-   Community detection and bridging analysis
-   Relationship diversity
-   Shortest-path analysis
-   Potential connector detection
-   Explainable investigation priority
-   Evidence/provenance exploration
-   Investigation timeline
-   Interactive network visualization
-   Grounded AI investigation assistant

### Security and Governance

-   Authentication
-   Role-based access control (RBAC)
-   Citizen object-level authorization
-   Investigation-level authorization
-   Jurisdiction-aware access control
-   Officer case assignment
-   IPS supervisory access within configured jurisdiction
-   Server-authoritative authorization
-   Audit logging
-   Privacy-aware audit records
-   Role-based frontend navigation
-   Protected routes
-   Unauthorized-access handling

### Demonstration Flow

``` text
Login
  ↓
Dashboard
  ↓
Open CASE-001
  ↓
Inspect people and entities
  ↓
Explore network
  ↓
Discover cross-case connection
  ↓
Trace supporting evidence
  ↓
Inspect potential connector
  ↓
Understand priority score
  ↓
Ask AI Investigation Assistant
  ↓
Receive grounded explanation
```

------------------------------------------------------------------------

## Architecture

``` text
┌──────────────────────────────────────────────────────┐
│                    React Frontend                    │
│ Dashboard · Cases · Search · Network · Priority · AI │
│ Citizen · Supervisory · Ministry Views              │
└──────────────────────────┬───────────────────────────┘
                           │ REST / JSON
                           ▼
┌──────────────────────────────────────────────────────┐
│                   FastAPI Backend                    │
│ Auth · RBAC · Authorization · Audit · API Routes    │
│ NLP · Extraction · Resolution · ML · Graph · AI     │
└──────────────────────────┬───────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────┐
│                NetworkX Knowledge Graph              │
│ CASE · PERSON · PHONE · ACCOUNT · VEHICLE           │
│ LOCATION · ORGANIZATION                              │
└──────────────────────────┬───────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────┐
│              Synthetic CSV Data Layer                │
│ Cases · Persons · Families · Communications · etc.  │
└──────────────────────────────────────────────────────┘
```

The MVP intentionally keeps graph processing local and in-memory so the
demonstration remains simple to run while preserving a clear path toward
scalable architecture.

------------------------------------------------------------------------

## Technology Stack

### Frontend

  Technology         Purpose
  ------------------ ----------------------------------------
  **React**          Component-based web application
  **Vite**           Frontend development and build tooling
  **Tailwind CSS**   Styling and responsive UI
  **React Router**   Routing and protected routes
  **Axios**          REST API communication
  **Cytoscape.js**   Interactive network visualization
  **Recharts**       Analytics and dashboard charts
  **Lucide React**   UI icons

### Backend

  -----------------------------------------------------------------------
  Technology                          Purpose
  ----------------------------------- -----------------------------------
  **Python**                          Core application and intelligence
                                      modules

  **FastAPI**                         REST API framework

  **Pydantic**                        Typed request/response models

  **Pandas**                          Tabular data processing

  **NetworkX**                        Knowledge graph and graph analytics

  **scikit-learn**                    Relationship-confidence ML

  **spaCy**                           NLP and NER

  **sentence-transformers**           Embedding-based similarity/entity
                                      resolution

  **python-dotenv**                   Environment configuration

  **pytest**                          Automated testing
  -----------------------------------------------------------------------

### AI / ML

-   spaCy NER
-   Regex and deterministic rules
-   Sentence Transformers (`all-MiniLM-L6-v2`)
-   Jaro-Winkler/similarity features
-   Logistic Regression for relationship evidence confidence
-   NetworkX graph analytics
-   LLM API layer for grounded query interpretation and explanation
-   Synthetic ground truth for evaluation and benchmarking

### Security

-   PBKDF2-HMAC-SHA256 password hashing
-   Salted hashes
-   Constant-time password comparison
-   HTTP Bearer authentication
-   Token validation and revocation
-   Role-based permissions
-   Object-level authorization
-   Jurisdiction-aware authorization
-   Case-assignment enforcement
-   Privacy-aware audit logging

### Deployment

-   Render frontend static site
-   Render FastAPI backend
-   REST API
-   Local/in-memory NetworkX graph for the MVP

------------------------------------------------------------------------

## Knowledge Graph

### Node Types

``` text
CASE
PERSON
PHONE
BANK_ACCOUNT
VEHICLE
LOCATION
ORGANIZATION
```

### Relationship Types

``` text
INVOLVED_IN
USES
CONTACTED
OWNS
TRANSFERRED_TO
LOCATED_AT
WORKS_FOR
RELATED_TO
```

Relationships preserve structured provenance such as:

``` text
source
target
relationship_type
confidence
evidence
case_id
detection_method
```

The graph is the analytical source of truth.

------------------------------------------------------------------------

## Entity Resolution

The system supports normalization and embedding-assisted entity
resolution so different representations of a fictional entity can be
recognized as potentially related.

Example:

``` text
+91 9876543210
9876543210
98765-43210
```

Possible decisions:

``` text
MATCH
POSSIBLE_MATCH
NO_MATCH
```

The system does not automatically merge entities when evidence is
insufficient.

------------------------------------------------------------------------

## Relationship Confidence

The relationship-confidence model answers:

> **How strongly does the available evidence support this
> relationship?**

It does **not** estimate criminality, guilt, or the probability that
someone committed a crime.

Synthetic training/evaluation features include:

-   entity similarity
-   text evidence strength
-   relationship keyword match
-   supporting-record count
-   source-record count
-   relationship frequency
-   cross-case connectivity

The project also includes controlled ML benchmarking and robustness
evaluation.

------------------------------------------------------------------------

## Graph Analytics

The graph layer supports:

-   Degree Centrality
-   Betweenness Centrality
-   Community Detection
-   Cross-Case Connectivity
-   Community Bridging
-   Relationship Diversity
-   Shortest Path Analysis

These are used to surface **Potential Connectors, Potential
Relationships, Analytical Leads, and Investigation Priorities** within
the synthetic demonstration environment.

------------------------------------------------------------------------

## Explainable Investigation Priority

The priority score represents:

> **Priority for human investigator review**

The current weighted model is:

``` text
30%  Betweenness Centrality
25%  Cross-Case Connectivity
20%  Community Bridging
15%  Relationship Diversity
10%  Evidence Confidence
```

The underlying scoring algorithm is preserved as the project evolves.
Future provenance work will expose the normalized component values and
their contribution to the existing score rather than introducing a
different scoring formula.

------------------------------------------------------------------------

## Provenance & Explainability

The project is evolving toward a provenance-first analytical experience.

The planned provenance layer covers:

-   Relationship evidence
-   Priority-score explanations
-   Potential connector explanations
-   Entity-resolution explanations
-   Underlying case references
-   Evidence summaries
-   Detection methods
-   ML confidence signals
-   Human-readable confidence breakdowns

Guiding principle:

> **Important analytical outputs should be traceable back to the
> synthetic records and graph evidence that produced them.**

Phase 8 is being developed incrementally so explainability does not
weaken authorization or privacy controls.

------------------------------------------------------------------------

## AI Investigation Assistant

The assistant follows a retrieval-first architecture:

``` text
User Question
     ↓
Intent / Query Interpretation
     ↓
Authorized Retrieval
     ↓
Structured Graph + Dataset Evidence
     ↓
Grounded Explanation
     ↓
Citation / Evidence Validation
     ↓
Human Investigator
```

Supported analytical areas include:

-   Person search
-   Case search
-   Person profiles
-   Case details
-   Network queries
-   Related cases
-   Priority explanations
-   General analytical queries
-   Clarification requests

The assistant must not:

-   create graph edges
-   invent evidence
-   override authorization
-   expose unauthorized cases
-   invent confidence values
-   decide guilt or criminality

The core application should remain usable even when an external LLM API
is unavailable.

------------------------------------------------------------------------

## Authentication & Authorization

The project uses four defined roles:

``` text
CITIZEN
INVESTIGATING_OFFICER
IPS_OFFICER
HOME_MINISTRY
```

### Investigating Officer

Access is constrained by active case assignment and configured
jurisdiction.

### IPS Officer

Provides supervisory access within the configured state jurisdiction,
including authorized cross-case analytics and reporting.

### Home Ministry

Restricted to its strategic and aggregated capabilities. It is not
automatically granted investigator-level dossier or provenance access.

### Citizen

Uses dedicated citizen-safe endpoints and object-level case
authorization.

### Security Principle

> **Authorization is decided by the backend, not by frontend claims, URL
> parameters, or client-controlled role headers.**

------------------------------------------------------------------------

## Audit Logging

The application includes a lightweight, thread-safe, bounded in-memory
audit system.

Audited actions include:

-   Authentication success/failure
-   Logout
-   Case dossier access
-   Case graph access
-   Case registration
-   Person/entity access
-   Family-profile access
-   Search execution
-   Priority-lead viewing
-   AI assistant queries
-   Cross-case analytics access
-   Citizen case access
-   Unauthorized-access denials

Privacy rules include:

-   no passwords
-   no password hashes
-   no bearer tokens
-   no raw AI prompts/responses
-   search metadata rather than sensitive search content
-   exclusion of sensitive case narratives and family addresses

Persistent, tamper-evident audit infrastructure is future scope.

------------------------------------------------------------------------

## Synthetic Data Policy

This repository uses **strictly synthetic, fictional demonstration
data**.

Never use:

-   real criminal records
-   real police records
-   real CDR data
-   real banking information
-   real phone records
-   real addresses
-   real personally identifiable information

The UI should clearly communicate:

> **SYNTHETIC DEMONSTRATION DATA**

and:

> **Analytical lead only. Requires human verification.**

The system does not determine criminality or guilt.

------------------------------------------------------------------------

## Demonstration Scenario

A representative synthetic cross-case path is:

``` text
CASE-001
   │
   ▼
PERSON-017
   │
   ▼
PHONE-004
   │
   ▼
PERSON-043
   │
   ▼
CASE-014
```

The system is designed to discover this from the actual graph, show the
entities and evidence, preserve authorization boundaries, and let a
human reviewer inspect the supporting information.

Analytical results should never be hardcoded solely for presentation.

------------------------------------------------------------------------

## Testing & Validation

Major modules are tested incrementally.

Coverage includes:

-   entity extraction
-   normalization
-   entity resolution
-   relationship extraction
-   relationship-confidence modeling
-   graph construction
-   graph analytics
-   priority scoring
-   dataset integrity
-   authentication
-   token handling
-   RBAC
-   citizen authorization
-   investigation authorization
-   jurisdiction filtering
-   graph traversal leakage prevention
-   AI retrieval authorization
-   prompt-injection isolation
-   audit logging and privacy
-   provenance authorization

Development workflow:

``` text
PLAN → IMPLEMENT → RUN → TEST → FIX → VERIFY → NEXT MODULE
```

------------------------------------------------------------------------

## Repository Structure

``` text
PS26189_demo/
├── backend/
│   ├── api/
│   │   └── routes/
│   ├── modules/
│   │   ├── auth/
│   │   ├── nlp/
│   │   ├── extraction/
│   │   ├── entity_resolution/
│   │   ├── relationships/
│   │   ├── ml/
│   │   ├── graph/
│   │   ├── analytics/
│   │   ├── priority/
│   │   ├── assistant/
│   │   └── provenance/
│   ├── data/
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/
│       ├── auth/
│       ├── components/
│       └── pages/
├── scratch/
├── PROJECT_RULES.md
├── .env.example
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

## Local Development

### Prerequisites

-   Python 3.12.x
-   Node.js
-   npm
-   Git

### Backend

``` bash
cd backend
python -m venv venv
```

Windows:

``` bash
.env\Scriptsctivate
```

macOS/Linux:

``` bash
source venv/bin/activate
```

Install:

``` bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Run:

``` bash
uvicorn main:app --reload
```

API:

``` text
http://localhost:8000
```

Health:

``` text
http://localhost:8000/api/health
```

Docs:

``` text
http://localhost:8000/docs
```

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

Vite normally serves:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## Deployment

### Frontend

https://ps26189-frontend.onrender.com

### Backend

https://ps26189-backend-v2.onrender.com

### API Documentation

https://ps26189-backend-v2.onrender.com/docs

The backend may take time to wake on a sleeping/free hosting tier. For a
live demonstration, check the health endpoint before opening the
application.

------------------------------------------------------------------------

## Development Status

### Completed

-   NLP/extraction pipeline
-   Entity normalization
-   Entity resolution
-   Relationship extraction
-   ML relationship confidence
-   NetworkX knowledge graph
-   Graph analytics
-   Investigation priority
-   FastAPI backend
-   React/Vite frontend
-   Network visualization
-   Case Explorer / Details
-   Person Investigation Profile
-   Family Explorer
-   Advanced Search
-   Grounded AI Investigation Assistant
-   Expanded synthetic dataset
-   ML benchmarking and robustness experiments
-   Runtime case/person registration
-   Authentication
-   Backend RBAC
-   Citizen object-level authorization
-   Investigation-level authorization
-   Jurisdiction-aware access control
-   Role-based frontend
-   Audit logging and compliance viewer

### Phase 8 --- Explainability & Provenance

``` text
8A  Relationship Provenance
 ↓
8B  Priority Explanation
 ↓
8C  Connector Explanation
 ↓
8D  Entity Resolution Explanation
 ↓
8E  Grounded Assistant + Citation Validation
```

Phase 8A has been implemented and reviewed in local development. It
remains a development checkpoint until intentionally pushed to the
public repository.

------------------------------------------------------------------------

## Phase 8 Roadmap

### 8A --- Relationship Provenance

-   sanitized structured evidence
-   underlying case references
-   detection method
-   confidence information
-   authorization-aware retrieval
-   provenance UI
-   provenance audit events

### 8B --- Priority Explanation

Expose the actual components behind the existing priority score without
changing its algorithm or weights.

### 8C --- Connector Explanation

Explain why a potential connector appears using actual graph structure
and supporting synthetic evidence.

### 8D --- Entity Resolution Explanation

Explain `MATCH`, `POSSIBLE_MATCH`, and `NO_MATCH` using the actual
resolver's similarity features, weights, and thresholds.

### 8E --- Grounded Assistant & Citation Validation

Strengthen retrieval, authorization, evidence grounding, and
deterministic citation validation while preventing the LLM from creating
relationships or bypassing authorization.

------------------------------------------------------------------------

## Future / Final-Round Architecture

These are **planned future technologies**, not MVP requirements.

### Data & Storage

-   PostgreSQL
-   Neo4j
-   Redis
-   controlled object/cloud storage

### Graph Intelligence

-   Neo4j Graph Data Science
-   GraphRAG
-   large-scale graph processing
-   temporal graph analytics
-   advanced community and bridge analysis

### NLP / AI

-   domain-specific NER
-   advanced relation extraction
-   advanced entity resolution
-   multilingual NLP
-   improved evidence ranking
-   production LLM orchestration and grounding

### Platform

-   Docker
-   microservices where justified
-   Kubernetes
-   cloud infrastructure
-   background workers/message queues
-   real-time data pipelines
-   scalable graph processing

### Security & Governance

-   persistent tamper-evident audit logs
-   OIDC/SAML enterprise identity
-   MFA
-   HttpOnly Secure SameSite cookies
-   secrets management
-   stronger RBAC/ABAC infrastructure
-   observability and security hardening

### Data Integration

Only where legally authorized and appropriately governed:

-   real or anonymized investigation data
-   controlled ingestion pipelines
-   authorized external data sources

------------------------------------------------------------------------

## MVP vs Future Architecture

  --------------------------------------------------------------------------
  Area                    Current MVP             Future Direction
  ----------------------- ----------------------- --------------------------
  Frontend                React + Vite            Scalable React design
                                                  system

  API                     FastAPI                 Scalable service/API
                                                  architecture

  Graph                   NetworkX                Neo4j + Graph Data Science

  Storage                 CSV + in-memory runtime PostgreSQL + durable
                                                  storage

  Cache                   Not required            Redis

  NLP                     spaCy + rules           Advanced/domain-specific
                                                  NLP

  Entity Resolution       Embeddings + similarity Advanced hybrid resolution

  Relation Extraction     Rules/NLP               Advanced relation
                                                  extraction

  ML Confidence           scikit-learn            Larger validated ML
                                                  pipeline

  LLM                     Grounded assistant      GraphRAG / production
                                                  orchestration

  Auth                    MVP bearer-token        OIDC/SAML + MFA
                          architecture            

  Audit                   In-memory bounded log   Persistent tamper-evident
                                                  audit

  Deployment              Render                  Docker / cloud /
                                                  Kubernetes

  Processing              Local graph             Distributed/scalable graph
                                                  processing

  Data                    Synthetic only          Authorized real/anonymized
                                                  data

  Analytics               Graph metrics           Temporal + large-scale
                                                  analytics
  --------------------------------------------------------------------------

------------------------------------------------------------------------

## Safety & Scope Boundary

This is an **AI-assisted analytical demonstration**.

It does not determine:

-   whether a person is a criminal,
-   whether a person is guilty,
-   whether a person committed a crime,
-   or whether a person should be subjected to enforcement action.

Use neutral terms such as:

-   Potential Relationship
-   Potential Connector
-   Analytical Lead
-   Investigation Priority
-   Confidence Evidence Breakdown

with:

> **Human verification required.**

------------------------------------------------------------------------

## Engineering Principles

1.  Build one module at a time.
2.  Preserve working functionality.
3.  Test before moving forward.
4.  Keep business logic inside reusable modules.
5.  Keep the graph as the analytical source of truth.
6.  Use ML for evidence/confidence, not guilt.
7.  Use the LLM for grounded explanation, not graph creation.
8.  Keep authorization server-side.
9.  Use synthetic data throughout the demonstration.
10. Avoid unnecessary MVP over-engineering.
11. Review major architectural changes before implementation.
12. Prefer explainability over opaque automation.

------------------------------------------------------------------------

## Roadmap at a Glance

``` text
FOUNDATION
 ├─ NLP & Entity Extraction
 ├─ Entity Resolution
 ├─ Relationship Extraction
 ├─ ML Confidence
 └─ NetworkX Graph
          ↓
ANALYTICS
 ├─ Cross-Case Analysis
 ├─ Connector Detection
 ├─ Priority Scoring
 └─ Network Visualization
          ↓
APPLICATION
 ├─ React Dashboard
 ├─ Case Explorer
 ├─ Person Profiles
 ├─ Search
 └─ AI Assistant
          ↓
SECURITY & GOVERNANCE
 ├─ Authentication
 ├─ RBAC
 ├─ Citizen Authorization
 ├─ Jurisdiction Controls
 └─ Audit Logging
          ↓
EXPLAINABILITY
 ├─ 8A Relationship Provenance
 ├─ 8B Priority Explanation
 ├─ 8C Connector Explanation
 ├─ 8D Entity Resolution Explanation
 └─ 8E Grounded Assistant Validation
          ↓
FUTURE SCALE
 ├─ Neo4j
 ├─ GraphRAG
 ├─ PostgreSQL
 ├─ Advanced NLP
 ├─ Temporal Analytics
 ├─ Production Identity
 ├─ Persistent Audit
 └─ Cloud / Kubernetes
```

------------------------------------------------------------------------

## Project Documentation

`PROJECT_RULES.md` is the project's engineering contract. It defines the
architecture, safety constraints, graph model, ML principles,
development workflow, and future scope.

------------------------------------------------------------------------

## Project Status

**Status:** Active development\
**Project:** Smart India Hackathon 2026 --- PS26189\
**Architecture:** React + FastAPI + Python Intelligence Modules +
NetworkX\
**Data:** Synthetic / fictional demonstration data\
**Focus:** Explainable network analysis, authorization, provenance, and
grounded AI assistance

------------------------------------------------------------------------

## License

No open-source license has been declared for this repository yet.

Until a license is added, the repository should not be assumed to grant
permission to reuse, redistribute, or modify the code beyond applicable
law and GitHub's platform terms.

------------------------------------------------------------------------

```{=html}
<p align="center">
```
`<strong>`{=html}PS26189`</strong>`{=html}`<br>`{=html} AI-Assisted
Investigation Intelligence · Synthetic Data · Explainable Analytics ·
Human Verification
```{=html}
</p>
```
