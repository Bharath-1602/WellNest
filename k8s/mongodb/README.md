# MongoDB — WellNest

This folder contains the Kubernetes manifests for deploying a **3-member MongoDB replica set** using a StatefulSet with NFS-backed persistent storage.

---

## Overview

| File | Purpose |
|------|---------|
| `statefulset-dev.yaml` | MongoDB StatefulSet for `wellnest-dev` (2Gi storage) |
| `statefulset-prod.yaml` | MongoDB StatefulSet for `wellnest-prod` (5Gi storage) |
| `service-dev.yaml` | Headless + ClusterIP services for dev |
| `service-prod.yaml` | Headless + ClusterIP services for prod |
| `rs-init-job-dev.yaml` | One-time Job to initialize replica set (dev) |
| `rs-init-job-prod.yaml` | One-time Job to initialize replica set (prod) |

---

## MongoDB Keyfile Setup (MUST DO FIRST)

MongoDB requires a shared keyfile for internal authentication between replica set members. You **must** create this secret before applying the StatefulSet.

### For DEV namespace:

```bash
# Generate keyfile
openssl rand -base64 756 > /tmp/mongodb-keyfile
chmod 400 /tmp/mongodb-keyfile

# Create Kubernetes secret
kubectl create secret generic mongodb-keyfile \
  --from-file=keyfile=/tmp/mongodb-keyfile \
  --namespace=wellnest-dev

# Delete the raw keyfile immediately
rm /tmp/mongodb-keyfile
```

### For PROD namespace:

```bash
# Generate keyfile (use the SAME keyfile or generate a new one)
openssl rand -base64 756 > /tmp/mongodb-keyfile
chmod 400 /tmp/mongodb-keyfile

# Create Kubernetes secret
kubectl create secret generic mongodb-keyfile \
  --from-file=keyfile=/tmp/mongodb-keyfile \
  --namespace=wellnest-prod

# Delete the raw keyfile
rm /tmp/mongodb-keyfile
```

### Verify keyfile secret exists:

```bash
kubectl get secret mongodb-keyfile -n wellnest-dev
kubectl get secret mongodb-keyfile -n wellnest-prod
```

---

## Apply Order

Apply in this exact order for each environment:

### DEV:

```bash
# 1. StatefulSet (creates 3 MongoDB pods)
kubectl apply -f statefulset-dev.yaml

# 2. Services (headless + ClusterIP)
kubectl apply -f service-dev.yaml

# 3. Wait for ALL 3 pods to be Running
kubectl get pods -n wellnest-dev -l app=mongodb -w

# 4. Initialize replica set (run AFTER all pods are Running)
kubectl apply -f rs-init-job-dev.yaml
```

### PROD:

```bash
kubectl apply -f statefulset-prod.yaml
kubectl apply -f service-prod.yaml
kubectl get pods -n wellnest-prod -l app=mongodb -w
kubectl apply -f rs-init-job-prod.yaml
```

---

## Verify Replica Set

```bash
# Check replica set status (replace PASSWORD with your actual root password)
kubectl exec -it mongodb-0 -n wellnest-dev -- \
  mongosh -u admin -p PASSWORD \
  --authenticationDatabase admin \
  --eval "rs.status()"

# Quick check — should show PRIMARY and 2 SECONDARY
kubectl exec -it mongodb-0 -n wellnest-dev -- \
  mongosh -u admin -p PASSWORD \
  --authenticationDatabase admin \
  --eval "rs.status().members.forEach(m => print(m.name, m.stateStr))"
```

Expected output:
```
mongodb-0.mongodb-headless.wellnest-dev.svc.cluster.local:27017 PRIMARY
mongodb-1.mongodb-headless.wellnest-dev.svc.cluster.local:27017 SECONDARY
mongodb-2.mongodb-headless.wellnest-dev.svc.cluster.local:27017 SECONDARY
```

---

## Verify NFS PVCs

```bash
# All 3 PVCs should show STATUS: Bound
kubectl get pvc -n wellnest-dev

# Expected:
# mongodb-data-mongodb-0   Bound   2Gi   nfs-client
# mongodb-data-mongodb-1   Bound   2Gi   nfs-client
# mongodb-data-mongodb-2   Bound   2Gi   nfs-client
```

---

## Common Issues and Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Pods stuck in `Pending` | NFS StorageClass not found or NFS server unreachable | Check `kubectl get storageclass nfs-client` and NFS server connectivity |
| Pods in `CrashLoopBackOff` | Missing keyfile secret | Create keyfile secret (see above) |
| Init job fails | Pods not fully ready when job runs | Delete job and re-apply: `kubectl delete job mongodb-rs-init -n wellnest-dev && kubectl apply -f rs-init-job-dev.yaml` |
| `MongoServerError: not authorized` | Replica set already initialized with different credentials | Connect without auth and check: `kubectl exec -it mongodb-0 -n wellnest-dev -- mongosh --eval "rs.status()"` |
| Permission denied on `/data/db` | initContainer didn't run or NFS mount issue | Check init container logs: `kubectl logs mongodb-0 -n wellnest-dev -c init-permissions` |
