from fastapi import Request

def get_graph(request: Request):
    return request.app.state.graph

def get_analytics(request: Request):
    return request.app.state.analytics

def get_priority(request: Request):
    return request.app.state.priority

def get_cases(request: Request):
    return request.app.state.cases
