# PS26189 - AI-Powered Criminal Network Analysis System

This is the internal MVP for the Smart India Hackathon 2026.

## Architecture

The project consists of:
*   **Backend:** Python + FastAPI
*   **Frontend:** React + Vite

## Getting Started

### 1. Start the Backend

```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
The backend API will run at `http://localhost:8000`.
Health endpoint: `http://localhost:8000/api/health`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```
The frontend dashboard will run typically at `http://localhost:5173`.
Url: https://ps26189-frontend.onrender.com
## Demonstration Data Policy
**IMPORTANT:** ALL demonstration data used in this project must be synthetic, fictional, and anonymized. Do not use any real criminal, police, or personally identifiable information.

## Note
This system is an analytical lead generator only. It requires human verification and does not determine criminality or guilt.
