import os
import re
import time
import math
import traceback
import numpy as np
from typing import Optional, List, Dict, Any, Tuple
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import joblib


# ======================================================
# Utils
# ======================================================
def safe_str(x: Optional[str]) -> str:
    return (x or "").strip()

def normalize_url(url: str) -> str:
    # remove spaces only, keep original characters
    return re.sub(r"\s+", "", safe_str(url))

def host_of(url: str) -> str:
    try:
        u = url if "://" in url else "http://" + url
        return (urlparse(u).hostname or "").lower()
    except Exception:
        return ""

def has_ip(host: str) -> bool:
    return bool(re.fullmatch(r"(\d{1,3}\.){3}\d{1,3}", host or ""))

def is_private_host(host: str) -> bool:
    """
    allow local/private:
    - localhost, 127.0.0.1
    - 10.0.0.0/8
    - 192.168.0.0/16
    - 172.16.0.0/12 (172.16 -> 172.31)
    - *.local
    """
    if not host:
        return False
    h = host.lower()

    if h in {"localhost", "127.0.0.1"}:
        return True
    if h.endswith(".local"):
        return True

    if has_ip(h):
        parts = h.split(".")
        try:
            a, b = int(parts[0]), int(parts[1])
        except Exception:
            return False

        if a == 10:
            return True
        if a == 192 and b == 168:
            return True
        if a == 172 and (16 <= b <= 31):
            return True

    return False

def count_subdomains(host: str) -> int:
    parts = [p for p in (host or "").split(".") if p]
    return max(0, len(parts) - 2)

def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq: Dict[str, int] = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    ent = 0.0
    n = len(s)
    for c in freq.values():
        p = c / n
        ent -= p * math.log2(p)
    return float(ent)

def normalize_label(label: str) -> str:
    l = (label or "").strip().lower()
    if l in {"porn", "xxx"}:
        return "adult"
    return l

def pipeline_input(url: str) -> str:
    """
    Input cho pipeline train từ URL string:
    - lower
    - remove scheme
    - remove leading www.
    """
    u = normalize_url(url).lower()
    u = re.sub(r"^https?://", "", u)
    u = re.sub(r"^www\.", "", u)
    return u


# ======================================================
# 58 URL FEATURES (RF)
# ======================================================
def extract_url_features(url: str) -> np.ndarray:
    """
    IMPORTANT: phải luôn ra (1,58) để khớp RF.
    """
    parsed = urlparse(url if "://" in url else "http://" + url)

    scheme = (parsed.scheme or "").lower()
    host = (parsed.netloc or "").lower()
    path = parsed.path or ""
    query = parsed.query or ""

    # strip port
    host_no_port = host.split(":")[0] if ":" in host else host

    full = url

    host_tokens = [t for t in re.split(r"[.\-]", host_no_port) if t]
    path_tokens = [t for t in re.split(r"[\/\-_.]", path) if t]
    query_tokens = [t for t in re.split(r"[=&\-_.]", query) if t]

    digits_in_url = sum(c.isdigit() for c in full)
    digits_in_host = sum(c.isdigit() for c in host_no_port)
    letters_in_url = sum(c.isalpha() for c in full)

    special_chars = "@?=&%#:/\\._-+"
    special_count = sum(full.count(c) for c in special_chars)

    suspicious_words = ["login", "verify", "bank", "secure", "account", "signin", "password"]
    susp_count = sum(1 for w in suspicious_words if w in full.lower())

    feats = [
        # 1-10
        len(full), len(host_no_port), len(path), len(query),
        letters_in_url, digits_in_url, special_count,
        full.count("."), full.count("/"), full.count("-"),

        # 11-20
        full.count("@"), full.count("?"), full.count("&"),
        full.count("="), full.count("%"), full.count("#"),
        digits_in_url, count_subdomains(host_no_port),
        max([len(t) for t in host_tokens], default=0),
        (sum([len(t) for t in host_tokens]) / len(host_tokens)) if host_tokens else 0,

        # 21-30
        min([len(t) for t in host_tokens], default=0), len(host_tokens),
        max([len(t) for t in path_tokens], default=0),
        (sum([len(t) for t in path_tokens]) / len(path_tokens)) if path_tokens else 0,
        min([len(t) for t in path_tokens], default=0), len(path_tokens),
        max([len(t) for t in query_tokens], default=0),
        (sum([len(t) for t in query_tokens]) / len(query_tokens)) if query_tokens else 0,
        min([len(t) for t in query_tokens], default=0), len(query_tokens),

        # 31-40 booleans
        1 if scheme == "https" else 0,
        1 if "www" in host_tokens else 0,
        1 if "@" in full else 0,
        1 if "-" in full else 0,
        1 if "_" in full else 0,
        1 if "~" in full else 0,
        1 if "%" in full else 0,
        1 if "." in full else 0,
        1 if "#" in full else 0,
        1 if "?" in full else 0,

        # 41-50 patterns
        1 if "=" in full else 0,
        1 if full.count("//") > 1 else 0,
        1 if has_ip(host_no_port) else 0,
        1 if ":" in (parsed.netloc or "") else 0,  # has port
        1 if host_no_port.startswith("xn--") else 0,
        1 if ".." in full else 0,
        1 if "//" in path else 0,
        digits_in_host,
        (digits_in_host / len(host_no_port)) if host_no_port else 0,
        susp_count,

        # 51-58 entropy + ratios + heuristic
        shannon_entropy(full), shannon_entropy(host_no_port), shannon_entropy(path),
        (digits_in_url / len(full)) if full else 0,
        (letters_in_url / len(full)) if full else 0,
        (special_count / len(full)) if full else 0,
        1 if host_no_port.count(".") >= 3 else 0,
        1 if len(full) >= 75 else 0
    ]

    X = np.array(feats, dtype=float).reshape(1, -1)
    if X.shape[1] != 58:
        raise ValueError(f"Feature count mismatch: got {X.shape[1]}, expected 58")
    return X


# ======================================================
# Policy mapping
# ======================================================
def policy(label: str) -> Tuple[str, str]:
    label = normalize_label(label)
    mapping = {
        "benign": ("LOW", "ALLOW"),
        "phishing": ("HIGH", "BLOCK"),
        "malware": ("HIGH", "BLOCK"),
        "adult": ("HIGH", "BLOCK"),
        "gambling": ("HIGH", "BLOCK"),
        "defacement": ("MEDIUM", "WARN"),
        "spam": ("MEDIUM", "WARN"),
    }
    return mapping.get(label, ("MEDIUM", "WARN"))


# ======================================================
# API schema
# ======================================================
class PredictRequest(BaseModel):
    url: str = Field(..., examples=["https://example.com"])
    title: Optional[str] = ""
    text: Optional[str] = ""
    child_age: Optional[int] = Field(10, ge=1, le=18)

class PredictResponse(BaseModel):
    risk_level: str
    label: str
    score: float
    action: str
    explanation: List[str]
    meta: Dict[str, Any]


# ======================================================
# Load models
# ======================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

RF_PATH = os.path.join(MODEL_DIR, "childsafenet_rf.pkl")
PIPE_PATH = os.path.join(MODEL_DIR, "childsafenet_pipeline.joblib")

rf_model = None
pipe_model = None

# ✅ allowlist chống false positive (chỉ dùng cho demo)
SAFE_DOMAIN_ALLOWLIST = set([
    "google.com",
    "wikipedia.org",
    "github.com",
    "microsoft.com",
    "facebook.com",
    "youtube.com",
    "hutech.edu.vn",
])

def is_safe_allow(host: str) -> bool:
    if not host:
        return False
    h = host.lower()
    return any(h == d or h.endswith("." + d) for d in SAFE_DOMAIN_ALLOWLIST)

def load_models():
    global rf_model, pipe_model
    if not os.path.exists(RF_PATH):
        raise FileNotFoundError(f"Missing RF model: {RF_PATH}")
    if not os.path.exists(PIPE_PATH):
        raise FileNotFoundError(f"Missing pipeline model: {PIPE_PATH}")

    rf_model = joblib.load(RF_PATH)
    pipe_model = joblib.load(PIPE_PATH)

    # sanity checks
    if hasattr(rf_model, "n_features_in_") and int(rf_model.n_features_in_) != 58:
        raise RuntimeError(f"RF model expects {rf_model.n_features_in_} features, but app extracts 58.")

    if not hasattr(rf_model, "predict_proba"):
        raise RuntimeError("RF model must support predict_proba().")

    if not hasattr(pipe_model, "predict_proba"):
        raise RuntimeError("Pipeline model must support predict_proba().")


# ======================================================
# FastAPI
# ======================================================
app = FastAPI(title="ChildSafeNet AI Service (Hybrid Final)", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _startup():
    load_models()

@app.get("/health")
def health():
    return {
        "status": "ok",
        "rf_loaded": rf_model is not None,
        "pipeline_loaded": pipe_model is not None,
        "rf_expected_features": int(getattr(rf_model, "n_features_in_", -1)) if rf_model else None,
        "pipeline_classes": list(getattr(pipe_model, "classes_", [])) if pipe_model else None,
        "safe_allowlist": sorted(list(SAFE_DOMAIN_ALLOWLIST)),
    }

@app.get("/debug")
def debug():
    return {
        "rf_type": type(rf_model).__name__ if rf_model else None,
        "rf_has_proba": hasattr(rf_model, "predict_proba") if rf_model else None,
        "pipe_type": type(pipe_model).__name__ if pipe_model else None,
        "pipe_has_proba": hasattr(pipe_model, "predict_proba") if pipe_model else None,
        "safe_allowlist_size": len(SAFE_DOMAIN_ALLOWLIST),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    t0 = time.time()
    url = normalize_url(req.url)
    host = host_of(url)

    # thresholds (tuning)
    ADULT_GAMBLING_BLOCK = 0.90   # tăng lên để giảm false-positive
    PHISHING_BLOCK = 0.85         # tăng lên để tránh block domain tốt
    WARN_SCORE = 0.70             # tăng warn band

    try:
        # 1) Always allow private/local
        if is_private_host(host):
            return PredictResponse(
                risk_level="LOW",
                label="benign",
                score=1.0,
                action="ALLOW",
                explanation=["Local/private network allowed"],
                meta={"host": host, "latency_ms": int((time.time() - t0) * 1000)}
            )

        # 2) Safe allowlist (demo)
        if is_safe_allow(host):
            return PredictResponse(
                risk_level="LOW",
                label="benign",
                score=1.0,
                action="ALLOW",
                explanation=["Safe allowlist domain (demo)"],
                meta={"host": host, "latency_ms": int((time.time() - t0) * 1000)}
            )

        # 3) RF predict (phishing/malware)
        X = extract_url_features(url)
        rf_proba = rf_model.predict_proba(X)[0]
        rf_idx = int(np.argmax(rf_proba))
        rf_label = normalize_label(str(rf_model.classes_[rf_idx]))
        rf_score = float(rf_proba[rf_idx])

        # 4) Pipeline predict (adult/gambling/phishing/benign)
        pipe_in = pipeline_input(url)
        pipe_proba = pipe_model.predict_proba([pipe_in])[0]
        pipe_idx = int(np.argmax(pipe_proba))
        pipe_label = normalize_label(str(pipe_model.classes_[pipe_idx]))
        pipe_score = float(pipe_proba[pipe_idx])

        # 5) Combine (ưu tiên an toàn nhưng tránh block bậy)
        final_label = "benign"
        final_action = "ALLOW"
        final_score = max(rf_score, pipe_score)

        # Adult/Gambling: chỉ block khi pipeline cực chắc
        if pipe_label in {"adult", "gambling"} and pipe_score >= ADULT_GAMBLING_BLOCK:
            final_label = pipe_label
            final_action = "BLOCK"
            final_score = pipe_score

        # Phishing/Malware: block khi đủ chắc (RF hoặc pipeline)
        elif (rf_label in {"phishing", "malware"} and rf_score >= PHISHING_BLOCK):
            final_label = rf_label
            final_action = "BLOCK"
            final_score = rf_score

        elif (pipe_label in {"phishing", "malware"} and pipe_score >= PHISHING_BLOCK):
            final_label = pipe_label
            final_action = "BLOCK"
            final_score = pipe_score

        # WARN: chỉ warn khi predicted label != benign và đủ score
        else:
            best_label = None
            best_score = 0.0

            if pipe_label != "benign" and pipe_score >= WARN_SCORE:
                best_label, best_score = pipe_label, pipe_score
            if rf_label != "benign" and rf_score >= WARN_SCORE and rf_score > best_score:
                best_label, best_score = rf_label, rf_score

            if best_label is not None:
                final_label = best_label
                final_score = best_score
                final_action = "WARN"
            else:
                final_label = "benign"
                final_score = max(rf_score, pipe_score)
                final_action = "ALLOW"

        risk_level, _ = policy(final_label)

        return PredictResponse(
            risk_level=risk_level,
            label=final_label,
            score=round(final_score, 4),
            action=final_action,
            explanation=[
                f"rf: {rf_label} ({rf_score:.2f})",
                f"pipe: {pipe_label} ({pipe_score:.2f})",
            ],
            meta={
                "host": host,
                "latency_ms": int((time.time() - t0) * 1000),
                "thresholds": {
                    "adult_gambling_block": ADULT_GAMBLING_BLOCK,
                    "phishing_block": PHISHING_BLOCK,
                    "warn": WARN_SCORE
                },
                "pipe_input": pipe_in,
            }
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Internal Server Error in /predict",
                "error_type": type(e).__name__,
                "error": str(e),
            },
        )