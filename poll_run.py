import json, time, urllib.request, sys, os

TOKEN = open(r"C:\Users\Ma\.github_token").read().strip()
SHA = "fa40e75"
BASE = "https://api.github.com/repos/17mohammad1718-png/planner"
PROXY = "http://127.0.0.1:10808"

def api(url):
    op = urllib.request.build_opener(
        urllib.request.ProxyHandler({"https": PROXY})
    )
    req = urllib.request.Request(url, headers={"Authorization": "token " + TOKEN, "User-Agent": "hermes"})
    with op.open(req, timeout=40) as r:
        return json.load(r)

start = time.time()
while True:
    try:
        d = api(BASE + "/actions/runs?branch=main&per_page=5")
        for run in d.get("workflow_runs", []):
            if SHA in run["head_sha"]:
                st = run["status"]; concl = run.get("conclusion")
                print(f"elapsed={(time.time()-start):.0f}s status={st} conclusion={concl}")
                if st == "completed":
                    print("RUN_DONE id=%d conclusion=%s" % (run["id"], concl))
                    sys.exit(0)
                break
    except Exception as e:
        print("poll err:", e)
    if time.time() - start > 780:
        print("TIMEOUT")
        sys.exit(1)
    time.sleep(30)
