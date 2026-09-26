import time
import json
import os
import requests
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("netfusion.security_collector")

EVE_PATH = os.getenv("SURICATA_EVE_PATH", "/var/log/suricata/eve.json")
BACKEND_URL = os.getenv("BACKEND_API_URL", "http://backend:8000/api/v1")

def follow_eve():
    logger.info(f"Starting EVE JSON security collector on {EVE_PATH}...")
    while not os.path.exists(EVE_PATH):
        logger.info(f"Waiting for {EVE_PATH} to be initialized by Suricata...")
        time.sleep(3)

    with open(EVE_PATH, "r") as f:
        # Seek to end
        f.seek(0, 2)
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.5)
                continue

            try:
                data = json.loads(line)
                if data.get("event_type") == "alert":
                    alert_info = data.get("alert", {})
                    payload = {
                        "source_ip": data.get("src_ip", "0.0.0.0"),
                        "dest_ip": data.get("dest_ip", "0.0.0.0"),
                        "protocol": data.get("proto", "TCP"),
                        "src_port": data.get("src_port"),
                        "dest_port": data.get("dest_port"),
                        "severity": "critical" if alert_info.get("severity", 3) == 1 else "high" if alert_info.get("severity") == 2 else "medium",
                        "rule_id": f"SURICATA-{alert_info.get('signature_id', '0')}",
                        "rule_name": alert_info.get("signature", "Unknown Security Alert"),
                        "payload_snippet": alert_info.get("category", "Security Anomaly"),
                        "status": "new",
                        "timestamp": data.get("timestamp")
                    }
                    logger.info(f"Ingested alert: {payload['rule_name']} from {payload['source_ip']}")
                    # Forward to backend or log
                    try:
                        requests.post(f"{BACKEND_URL}/security/events", json=payload, timeout=2)
                    except Exception:
                        pass
            except Exception as e:
                logger.warning(f"Error parsing eve line: {e}")

if __name__ == "__main__":
    follow_eve()
