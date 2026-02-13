# Architecture

## High-level
Browser (Extension) / Web UI
  -> Childsafenet.Api (auth, settings, logs, dataset, train jobs)
     -> ai-service FastAPI (/predict)
     -> SQL Server (logs + dataset + users + settings)

## Train loop
Scan -> UrlDataset Pending
Admin review -> Approved
Scheduled job -> export snapshot
Train -> new model version + manifest
Deploy AI -> load active model
