"""
conftest.py
===========
Pytest fixtures and configuration for the test suite.

Ensures that legacy unit and regression tests written prior to the introduction
of Phase 2/3 authentication and RBAC can execute without modification,
while tests in test_rbac.py and test_auth_api.py run with 100% strict, real,
unmocked authentication and authorization.
"""

import pytest
from main import app
from api.dependencies import require_authenticated_user
from modules.auth.demo_users import get_demo_user_repository


LEGACY_TEST_MODULES = {
    "test_api",
    "test_case_registration",
    "test_assistant",
    "test_family_explorer",
    "test_advanced_search",
}



@pytest.fixture(autouse=True)
def handle_legacy_auth(request):
    """
    For legacy integration test modules, provide an authenticated IO session
    via FastAPI dependency_overrides so baseline assertions continue to pass
    without altering the existing test files.
    """
    module_name = request.module.__name__.split(".")[-1]
    if module_name in LEGACY_TEST_MODULES:
        io_user = get_demo_user_repository().get_by_username("io.demo")
        app.dependency_overrides[require_authenticated_user] = lambda: io_user
        try:
            yield
        finally:
            app.dependency_overrides.pop(require_authenticated_user, None)
    else:
        yield
