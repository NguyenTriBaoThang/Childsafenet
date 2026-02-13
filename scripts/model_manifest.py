import argparse, hashlib, json, os, datetime

def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model_version", required=True)
    ap.add_argument("--model_path", required=True)
    ap.add_argument("--dataset_snapshot", required=True)
    ap.add_argument("--metrics_path", default="")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    manifest = {
        "model_version": args.model_version,
        "trained_at_utc": datetime.datetime.utcnow().isoformat() + "Z",
        "dataset_snapshot": args.dataset_snapshot,
        "artifact_sha256": sha256_file(args.model_path),
        "metrics": {},
        "notes": ""
    }

    if args.metrics_path and os.path.exists(args.metrics_path):
        with open(args.metrics_path, "r", encoding="utf-8") as f:
            manifest["metrics"] = json.load(f)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print("Wrote:", args.out)

if __name__ == "__main__":
    main()
