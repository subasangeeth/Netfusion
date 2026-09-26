import argparse
import requests
import json
import sys

def run_simulation(sim_type: str, target: str, api_url: str):
    print(f"[NetFusion Attack Simulator] Triggering {sim_type} against target {target}...")
    try:
        res = requests.post(
            f"{api_url}/security/simulate",
            json={"simulation_type": sim_type, "target": target},
            timeout=10
        )
        if res.status_code == 200:
            data = res.json()
            print(f"✓ Simulation Success: {data.get('details')}")
            print(f"✓ Suricata Detection Rule: {data.get('detected_by')}")
        else:
            print(f"✗ Failed (Status {res.status_code}): {res.text}")
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NetFusion In-Lab Attack Simulator")
    parser.add_argument("--type", choices=["port_scan", "failed_login", "icmp_flood"], default="port_scan")
    parser.add_argument("--target", default="10.10.30.10")
    parser.add_argument("--url", default="http://localhost:8000/api/v1")
    args = parser.parse_args()

    run_simulation(args.type, args.target, args.url)
