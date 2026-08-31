import json, time, urllib.request, sys

TOKEN = open(r"C:\Users\Ma\.github_token").read().strip()
SHA = "f208171"
BASE = "https://api.github.com/repos/17mohammad1718-png/planner"
PROXY = "http://127.0.0.1:10808"

def api(url):
    op = urllib.request.build_opener(urllib.request.ProxyHandler({"https": PROXY}))
    req = urllib.request.Request(url, headers={"Authorization": "token " + TOKEN, "User-Agent": "hermes"})
    with op.open(req, timeout=40) as r:
        return json.load(r)

start = time.time()
while True:
    try:
        d = api(BASE + "/actions/runs?branch=main&per_page=3")
        for run in d.get("workflow_runs", []):
            if SHA in run["head_sha"]:
                st = run["status"]; concl = run.get("conclusion")
                elapsed = int(time.time() - start)
                print(f"[{elapsed}s] status={st} conclusion={concl}", flush=True)
                if st == "completed":
                    if concl == "success":
                        jobs = api(BASE + f"/actions/runs/{run['id']}/jobs")
                        for j in jobs.get("jobs", []):
                            if j.get("conclusion") == "failure":
                                logs_url = BASE + f"/actions/jobs/{j['id']}/logs"
                                print(f"FAILED at step. Job logs: {logs_url}")
                                sys.exit(1)
                        print(f"SUCCESS! run_id={run['id']}")
                    else:
                        print(f"FAILED: {concl}")
                    sys.exit(0)
    except Exception as e:
        print(f"poll err: {e}")
    if time.time() - start > 780:
        print("TIMEOUT"); sys.exit(1)
    time.sleep(30)
