import os
import sys
import pytest

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data.validate_dataset import validate, load_csv, FILES_TO_CHECK

def test_files_exist():
    for f in FILES_TO_CHECK:
        assert load_csv(f) is not None, f"File {f} is missing"

def test_foreign_keys_and_cross_case():
    # The validate function checks FKs, ID uniqueness, and cross-case networks.
    # It returns True if everything passes.
    assert validate() is True, "Validation failed (FKs, Uniqueness, or Cross-case networks)"

def test_duplicate_representations():
    # Test that we actually generated ER duplicate test cases
    phones = load_csv("phones.csv")
    phone_ids = [p["phone_id"] for p in phones]
    
    # We should have PHONE-XXX-V1 and PHONE-XXX-V2 in our dataset
    has_variants = any("-V" in pid for pid in phone_ids)
    assert has_variants, "No duplicate phone representations found for ER testing"

    persons = load_csv("persons.csv")
    person_ids = [p["person_id"] for p in persons]
    has_person_variants = any("-V" in pid for pid in person_ids)
    assert has_person_variants, "No duplicate person representations found for ER testing"

def test_ground_truth_references():
    gt = load_csv("ground_truth.csv")
    assert len(gt) > 0, "Ground truth is empty"
    
    positive_gt = [g for g in gt if g["expected_relationship"] == "1"]
    negative_gt = [g for g in gt if g["expected_relationship"] == "0"]
    
    assert len(positive_gt) > 0, "No positive ground truth examples"
    assert len(negative_gt) > 0, "No negative ground truth examples"

def test_required_columns():
    cases = load_csv("cases.csv")
    assert "case_id" in cases[0]
    assert "status" in cases[0]
    
    communications = load_csv("communications.csv")
    assert "source_person_id" in communications[0]
    assert "description" in communications[0]
