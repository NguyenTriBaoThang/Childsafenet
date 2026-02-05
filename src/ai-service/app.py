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
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import joblib


# =============================
# Utils
# =============================
def safe_str(x: Optional[str]) -> str:
    return (x or "").strip()


def has_ip(host: str) -> bool:
    # IPv4 đơn giản
    return bool(re.fullmatch(r"(\d{1,3}\.){3}\d{1,3}", host))


def count_subdomains(host: str) -> int:
    # vd: a.b.c.com -> subdomains=3 (a,b,c) + tld part
    parts = [p for p in host.split(".") if p]
    return max(0, len(parts) - 2)  # trừ domain + tld


def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    ent = 0.0
    n = len(s)
    for c in freq.values():
        p = c / n
        ent -= p * math.log2(p)
    return float(ent)


# =============================
# 58 URL-based features
# =============================
def extract_url_features(url: str) -> np.ndarray:
    """
    Trả về numpy array shape (1, 58)
    Feature set theo kiểu phổ biến trong bài toán phishing/malicious URL detection.
    Quan trọng: số feature = 58 để khớp RF model của bạn.
    """
    url = safe_str(url)

    parsed = urlparse(url if "://" in url else "http://" + url)

    scheme = safe_str(parsed.scheme).lower()
    host = safe_str(parsed.netloc).lower()
    path = safe_str(parsed.path)
    query = safe_str(parsed.query)
    fragment = safe_str(parsed.fragment)

    # normalize host (loại bỏ port)
    if ":" in host:
        host_no_port = host.split(":")[0]
        port_part = host.split(":")[1]
    else:
        host_no_port = host
        port_part = ""

    # tokens
    full = url
    host_tokens = [t for t in re.split(r"[.\-]", host_no_port) if t]
    path_tokens = [t for t in re.split(r"[\/\-_.]", path) if t]
    query_tokens = [t for t in re.split(r"[=&\-_.]", query) if t]

    digits_in_url = sum(ch.isdigit() for ch in full)
    digits_in_host = sum(ch.isdigit() for ch in host_no_port)
    letters_in_url = sum(ch.isalpha() for ch in full)

    special_chars = r"@?=&%#:/\._-\+"
    special_count = sum(full.count(ch) for ch in special_chars)

    # Boolean helpers
    is_https = 1 if scheme == "https" else 0
    has_www = 1 if "www" in host_tokens else 0
    has_at = 1 if "@" in full else 0
    has_dash = 1 if "-" in full else 0
    has_underscore = 1 if "_" in full else 0
    has_tilde = 1 if "~" in full else 0
    has_percent = 1 if "%" in full else 0
    has_dot = 1 if "." in full else 0
    has_hash = 1 if "#" in full else 0
    has_query = 1 if "?" in full else 0
    has_equal = 1 if "=" in full else 0
    has_double_slash = 1 if full.count("//") > 1 else 0  # ngoài scheme
    has_ip_host = 1 if has_ip(host_no_port) else 0
    has_port = 1 if port_part else 0

    # counts
    dot_count = full.count(".")
    slash_count = full.count("/")
    dash_count = full.count("-")
    at_count = full.count("@")
    ques_count = full.count("?")
    amp_count = full.count("&")
    eq_count = full.count("=")
    perc_count = full.count("%")
    hash_count = full.count("#")
    digit_count = digits_in_url

    # lengths
    url_len = len(full)
    host_len = len(host_no_port)
    path_len = len(path)
    query_len = len(query)

    # token stats
    host_token_count = len(host_tokens)
    path_token_count = len(path_tokens)
    query_token_count = len(query_tokens)

    avg_host_tok_len = (sum(len(t) for t in host_tokens) / host_token_count) if host_token_count else 0.0
    avg_path_tok_len = (sum(len(t) for t in path_tokens) / path_token_count) if path_token_count else 0.0
    avg_query_tok_len = (sum(len(t) for t in query_tokens) / query_token_count) if query_token_count else 0.0

    max_host_tok_len = max([len(t) for t in host_tokens], default=0)
    max_path_tok_len = max([len(t) for t in path_tokens], default=0)
    max_query_tok_len = max([len(t) for t in query_tokens], default=0)

    min_host_tok_len = min([len(t) for t in host_tokens], default=0)
    min_path_tok_len = min([len(t) for t in path_tokens], default=0)
    min_query_tok_len = min([len(t) for t in query_tokens], default=0)

    # subdomain count
    subdomain_count = count_subdomains(host_no_port)

    # entropy
    url_entropy = shannon_entropy(full)
    host_entropy = shannon_entropy(host_no_port)
    path_entropy = shannon_entropy(path)

    # ratios (avoid divide by zero)
    digit_ratio = digits_in_url / url_len if url_len else 0.0
    letter_ratio = letters_in_url / url_len if url_len else 0.0
    special_ratio = special_count / url_len if url_len else 0.0

    # suspicious keywords (basic)
    suspicious_words = [
        "login", "verify", "update", "free", "bonus", "account",
        "bank", "secure", "confirm", "signin", "password", "reward"
    ]
    lower_full = full.lower()
    susp_word_count = sum(1 for w in suspicious_words if w in lower_full)

    # Feature vector (58)
    feats = [
        # 1-10 length basic
        url_len, host_len, path_len, query_len,
        letters_in_url, digits_in_url, special_count,
        dot_count, slash_count, dash_count,

        # 11-20 special char counts
        at_count, ques_count, amp_count, eq_count, perc_count,
        hash_count, digit_count, subdomain_count,
        max_host_tok_len, avg_host_tok_len,

        # 21-30 token stats
        min_host_tok_len, host_token_count,
        max_path_tok_len, avg_path_tok_len, min_path_tok_len, path_token_count,
        max_query_tok_len, avg_query_tok_len, min_query_tok_len, query_token_count,

        # 31-40 booleans
        is_https, has_www, has_at, has_dash, has_underscore,
        has_tilde, has_percent, has_dot, has_hash, has_query,

        # 41-50 more booleans / patterns
        has_equal, has_double_slash, has_ip_host, has_port,
        1 if host_no_port.startswith("xn--") else 0,     # punycode
        1 if ".." in full else 0,                        # double dots
        1 if "//" in path else 0,                        # weird path
        digits_in_host,                                  # digits in host
        (digits_in_host / host_len) if host_len else 0.0,# digits ratio host
        susp_word_count,

        # 51-58 entropy + ratios
        url_entropy, host_entropy, path_entropy,
        digit_ratio, letter_ratio, special_ratio,
        1 if len(host_no_port.split(".")) >= 4 else 0,   # many levels
        1 if url_len >= 75 else 0                        # very long url
    ]

    X = np.array(feats, dtype=float).reshape(1, -1)

    # Bảo vệ: nếu không đủ/ dư feature thì fail rõ ràng
    if X.shape[1] != 58:
        raise ValueError(f"Feature mismatch: extracted {X.shape[1]} features, expected 58.")
    return X


# =============================
# Request/Response schema
# =============================
class PredictRequest(BaseModel):
    url: str = Field(..., examples=["https://example.com"])
    title: Optional[str] = Field("", examples=["Some page title"])
    text: Optional[str] = Field("", examples=["Body content..."])
    child_age: Optional[int] = Field(10, ge=1, le=18)


class PredictResponse(BaseModel):
    risk_level: str
    label: str
    score: float
    action: str
    explanation: List[str]
    meta: Dict[str, Any]


# =============================
# Load model artifacts
# =============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

MODEL_PATH = os.path.join(MODEL_DIR, "childsafenet_rf.pkl")
LE_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Missing model file: {MODEL_PATH}")

model = joblib.load(MODEL_PATH)

label_encoder = None
if os.path.exists(LE_PATH):
    try:
        label_encoder = joblib.load(LE_PATH)
    except Exception:
        label_encoder = None


# =============================
# Risk mapping
# =============================
DEFAULT_POLICY: Dict[str, Tuple[str, str]] = {
    "benign": ("LOW", "ALLOW"),
    "safe": ("LOW", "ALLOW"),

    "phishing": ("HIGH", "BLOCK"),
    "malware": ("HIGH", "BLOCK"),
    "defacement": ("MEDIUM", "WARN"),
    "spam": ("MEDIUM", "WARN"),

    "adult": ("HIGH", "BLOCK"),
    "porn": ("HIGH", "BLOCK"),
    "gambling": ("HIGH", "BLOCK"),
    "drugs": ("HIGH", "BLOCK"),
    "violence": ("MEDIUM", "WARN"),
}


def policy_for_label(label: str) -> Tuple[str, str]:
    key = (label or "").strip().lower()
    if key in DEFAULT_POLICY:
        return DEFAULT_POLICY[key]
    return ("MEDIUM", "WARN")


def decode_label(pred_class) -> str:
    # Nếu model trả ra int class thì decode bằng label_encoder
    if label_encoder is not None and isinstance(pred_class, (int, np.integer)):
        try:
            return str(label_encoder.inverse_transform([int(pred_class)])[0])
        except Exception:
            return str(pred_class)
    return str(pred_class)


# =============================
# FastAPI app
# =============================
app = FastAPI(title="ChildSafeNet API", version="2.0-url-features")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEB_DIR = os.path.join(BASE_DIR, "web")
os.makedirs(WEB_DIR, exist_ok=True)
app.mount("/web", StaticFiles(directory=WEB_DIR, html=True), name="web")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "expected_features": int(getattr(model, "n_features_in_", 58))
    }


@app.get("/debug")
def debug():
    return {
        "model_type": type(model).__name__,
        "expected_features": int(getattr(model, "n_features_in_", -1)),
        "has_predict_proba": hasattr(model, "predict_proba"),
        "label_encoder_loaded": label_encoder is not None,
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    t0 = time.time()

    try:
        # Model của bạn dùng URL features, title/text chỉ để demo UI thôi
        X = extract_url_features(req.url)

        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X)[0]
            idx = int(np.argmax(proba))
            score = float(np.max(proba))
            pred_class = model.classes_[idx] if hasattr(model, "classes_") else idx
        else:
            pred_class = model.predict(X)[0]
            score = 0.75

        label = decode_label(pred_class)
        risk_level, action = policy_for_label(label)

        # Explanation nhẹ dựa trên vài signal chính
        # (không SHAP để demo gọn)
        explain = []
        explain.append(f"url_len={len(req.url)}")
        explain.append(f"has_https={'https' in req.url.lower()}")
        explain.append(f"has_at={'@' in req.url}")
        explain.append(f"has_ip={has_ip(urlparse(req.url if '://' in req.url else 'http://' + req.url).netloc.split(':')[0])}")
        explain.append("Policy action: " + action)

        latency_ms = int((time.time() - t0) * 1000)

        return PredictResponse(
            risk_level=risk_level,
            label=str(label),
            score=float(round(score, 4)),
            action=action,
            explanation=explain[:6],
            meta={
                "latency_ms": latency_ms,
                "child_age": req.child_age,
                "features_used": 58
            },
        )

    except Exception as e:
        print("🔥 /predict error")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Internal Server Error in /predict",
                "error_type": type(e).__name__,
                "error": str(e),
            },
        )