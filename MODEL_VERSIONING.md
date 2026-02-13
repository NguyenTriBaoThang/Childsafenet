# Model Versioning — ChildSafeNet

Mục tiêu: quản lý model/dataset theo phiên bản, dễ demo, dễ rollback.

## Quy ước thư mục
```
artifacts/
  models/
    v2026.02.14-001/
      model_type.txt
      model.joblib
      label_encoder.joblib (optional)
      metrics.json
      train_config.json
      model_manifest.json
```

## model_manifest.json
- `model_version`: string (vd: `v2026.02.14-001`)
- `artifact_sha256`: checksum file model
- `trained_at_utc`
- `dataset_snapshot`: path hoặc id (vd `data/snapshots/approved_2026-02-14.csv`)
- `metrics`: accuracy/f1/roc_auc...
- `notes`: ghi chú

## Quy trình Option B (train định kỳ)
1. Scan tạo `UrlDataset` status = Pending
2. Admin duyệt -> status = Approved/Rejected
3. Job định kỳ export Approved -> snapshot CSV
4. Train -> tạo model version mới, update manifest
5. Deploy AI service đọc `ACTIVE_MODEL_VERSION` hoặc `active_model.json` để load model hiện hành

## Khuyến nghị
- Không commit artifact model lớn vào git (dùng release asset / object storage)
- Nhưng với demo cuộc thi: có thể commit model nhỏ hoặc dùng Git LFS.
