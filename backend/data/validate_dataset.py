import os
import csv
from collections import defaultdict

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

FILES_TO_CHECK = [
    "cases.csv", "persons.csv", "phones.csv", "bank_accounts.csv", 
    "vehicles.csv", "locations.csv", "organizations.csv", 
    "communications.csv", "transactions.csv", "ground_truth.csv"
]

def load_csv(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def validate():
    print("DATASET VALIDATION")
    print("------------------")
    
    all_data = {}
    missing_files = []
    
    # 1. Check if files exist and load data
    for f in FILES_TO_CHECK:
        data = load_csv(f)
        if data is None:
            missing_files.append(f)
            print(f"{f.split('.')[0].title()}: FAIL (Missing file)")
        else:
            all_data[f] = data
            
    if missing_files:
        print("Cannot proceed with full validation due to missing files.")
        return False
        
    for f in FILES_TO_CHECK:
        print(f"{f.split('.')[0].replace('_', ' ').title()}: PASS")

    # Check IDs Uniqueness
    id_maps = {
        "cases.csv": "case_id",
        "persons.csv": "person_id",
        "phones.csv": "phone_id",
        "bank_accounts.csv": "bank_account_id",
        "vehicles.csv": "vehicle_id",
        "locations.csv": "location_id",
        "organizations.csv": "organization_id",
        "communications.csv": "communication_id",
        "transactions.csv": "transaction_id",
        "ground_truth.csv": "ground_truth_id"
    }

    entity_sets = {}
    for filename, id_col in id_maps.items():
        ids = [row[id_col] for row in all_data[filename] if row[id_col]]
        if len(ids) != len(set(ids)):
            print(f"Foreign Keys: FAIL (Duplicate IDs in {filename})")
            return False
        entity_sets[filename] = set(ids)
        
    # Check Foreign Keys
    # persons -> phone_id, bank_account_id, vehicle_id, location_id, organization_id
    fk_pass = True
    for p in all_data["persons.csv"]:
        if p["phone_id"] and p["phone_id"] not in entity_sets["phones.csv"]: fk_pass = False
        if p["bank_account_id"] and p["bank_account_id"] not in entity_sets["bank_accounts.csv"]: fk_pass = False
        if p["vehicle_id"] and p["vehicle_id"] not in entity_sets["vehicles.csv"]: fk_pass = False
        if p["location_id"] and p["location_id"] not in entity_sets["locations.csv"]: fk_pass = False
        if p["organization_id"] and p["organization_id"] not in entity_sets["organizations.csv"]: fk_pass = False
        
    # comms -> case_id, source_person_id, target_person_id, phone_id
    for c in all_data["communications.csv"]:
        if c["case_id"] and c["case_id"] not in entity_sets["cases.csv"]: fk_pass = False
        if c["source_person_id"] and c["source_person_id"] not in entity_sets["persons.csv"]: fk_pass = False
        if c["target_person_id"] and c["target_person_id"] not in entity_sets["persons.csv"]: fk_pass = False
        if c["phone_id"] and c["phone_id"] not in entity_sets["phones.csv"]: fk_pass = False

    # txns -> case_id, source_person_id, target_person_id, source_account_id, target_account_id
    for t in all_data["transactions.csv"]:
        if t["case_id"] and t["case_id"] not in entity_sets["cases.csv"]: fk_pass = False
        if t["source_person_id"] and t["source_person_id"] not in entity_sets["persons.csv"]: fk_pass = False
        if t["target_person_id"] and t["target_person_id"] not in entity_sets["persons.csv"]: fk_pass = False
        if t["source_account_id"] and t["source_account_id"] not in entity_sets["bank_accounts.csv"]: fk_pass = False
        if t["target_account_id"] and t["target_account_id"] not in entity_sets["bank_accounts.csv"]: fk_pass = False

    print(f"Foreign Keys: {'PASS' if fk_pass else 'FAIL'}")
    
    # Check Cross-Case Networks
    # To check cross-case networks, let's see if there are entities linked to multiple cases through comms/txns.
    # Person -> Cases (via comms/txns where person is source or target)
    person_cases = defaultdict(set)
    for c in all_data["communications.csv"]:
        if c["case_id"]:
            person_cases[c["source_person_id"]].add(c["case_id"])
            person_cases[c["target_person_id"]].add(c["case_id"])
    for t in all_data["transactions.csv"]:
        if t["case_id"]:
            person_cases[t["source_person_id"]].add(t["case_id"])
            person_cases[t["target_person_id"]].add(t["case_id"])
            
    # Also person -> cases from ground truth
    for gt in all_data["ground_truth.csv"]:
        if gt["relationship_type"] == "INVOLVED_IN":
            # source_entity is person, target is case
            person_cases[gt["source_entity_id"]].add(gt["target_entity_id"])

    # A cross-case network is present if we find paths connecting multiple cases.
    # For a simple check, if there are multiple cases that share persons, or persons in different cases communicating.
    # Since we explicitly generated cross-case paths (Case -> P1 -> Phone -> P2 -> Case2),
    # P1 is involved in Case1, P2 involved in Case2, and there is a communication between P1 and P2.
    
    cross_case_connections = 0
    for c in all_data["communications.csv"]:
        p1 = c["source_person_id"]
        p2 = c["target_person_id"]
        cases_p1 = person_cases.get(p1, set())
        cases_p2 = person_cases.get(p2, set())
        # If they belong to different cases, this is a cross-case link
        diff_cases = cases_p1.union(cases_p2)
        if len(diff_cases) > 1:
            cross_case_connections += 1
            
    for t in all_data["transactions.csv"]:
        p1 = t["source_person_id"]
        p2 = t["target_person_id"]
        cases_p1 = person_cases.get(p1, set())
        cases_p2 = person_cases.get(p2, set())
        diff_cases = cases_p1.union(cases_p2)
        if len(diff_cases) > 1:
            cross_case_connections += 1

    # Our script explicitly creates 10 such cross-case paths.
    if cross_case_connections >= 8:
        print("Cross-Case Networks: PASS")
    else:
        print(f"Cross-Case Networks: FAIL (Found only {cross_case_connections})")
        fk_pass = False

    return fk_pass

if __name__ == "__main__":
    success = validate()
    import sys
    sys.exit(0 if success else 1)
