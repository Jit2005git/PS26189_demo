# PS26189 — AI-Powered Criminal Network Analysis System

> **Smart India Hackathon 2026 · Problem Statement 26189**

An AI-assisted investigation intelligence platform that combines NLP, entity resolution, relationship analysis, knowledge graphs, explainable analytics, authorization, provenance, and grounded AI assistance.

---

## 📌 Overview

**PS26189 — AI-Powered Criminal Network Analysis System** is an internal Smart India Hackathon 2026 MVP designed to demonstrate how fragmented investigation information can be transformed into a structured and explainable network of entities and relationships.

The system combines:

- Natural Language Processing
- Named Entity Recognition
- Entity normalization
- Embedding-based entity resolution
- Relationship extraction
- Machine-learning-based relationship confidence
- Knowledge graph construction
- Graph analytics
- Cross-case analysis
- Investigation-priority analysis
- Evidence provenance
- Authentication and RBAC
- Jurisdiction-aware authorization
- Audit logging
- Grounded AI assistance

The project is designed as an **analytical demonstration and architectural foundation**, not as a production law-enforcement system.

### Core Principle

> **Graph = Source of Truth · ML = Evidence / Confidence · LLM = Explanation / Interface**

The system assists authorized human investigators by organizing and explaining synthetic investigation data. It does not determine guilt, criminality, or enforcement action.

---

# 🧠 System Architecture

```text
                    SYNTHETIC INVESTIGATION DATA
                               │
                               ▼
                       NLP PREPROCESSING
                               │
                               ▼
                    NER + RULE-BASED EXTRACTION
                               │
                               ▼
                    ENTITY NORMALIZATION
                               │
                               ▼
                 EMBEDDING-BASED ENTITY RESOLUTION
                               │
                               ▼
                   RELATIONSHIP EXTRACTION
                               │
                               ▼
              RELATIONSHIP EVIDENCE / ML CONFIDENCE
                               │
                               ▼
                    NETWORKX KNOWLEDGE GRAPH
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       Graph Analytics   Cross-Case Links   Provenance
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    INVESTIGATION PRIORITY
                               │
                               ▼
                  GROUNDED AI ASSISTANT
                               │
                               ▼
                    HUMAN REVIEW / ANALYSIS
