"""Minimal drift check placeholder.

Bạn sẽ thay bằng drift thật sau (Evidently / custom PSI).
Ý tưởng:
- Lấy sample URLs/logs gần đây (export từ DB)
- So sánh phân phối features/labels với baseline snapshot
- Nếu drift cao -> tạo issue / alert

Hiện tại script chỉ in hướng dẫn để CI chạy OK.
"""

import argparse

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--baseline", default="data/baseline.csv")
    ap.add_argument("--recent", default="data/recent.csv")
    ap.add_argument("--out", default="reports/drift.json")
    args = ap.parse_args()
    print("Drift check stub. Provide:", args)

if __name__ == "__main__":
    main()
