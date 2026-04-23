# WellNest — Phase 2: Kubernetes Manifests

Production-grade Kubernetes deployment for the WellNest mental health platform, organized into concept-based folders for a DevSecOps capstone project.

---

## Phase 2 Overview

This phase transforms the Docker-based application (Phase 1) into a fully orchestrated Kubernetes deployment featuring:

- **Multi-environment isolation** — Separate `wellnest-dev` and `wellnest-prod` namespaces
- **MongoDB HA** — 3-member replica set via StatefulSet with NFS persistent storage
- **Sealed Secrets** — Encrypted secrets safe for Git (Bitnami Sealed Secrets)
- **Blue-Green Deployments** — Frontend uses Argo Rollouts for zero-downtime updates
- **Auto-scaling** — HPA scales frontend based on CPU/memory utilization
- **Network Security** — NetworkPolicies prevent frontend from accessing MongoDB directly
- **Gateway API** — KGateway (Envoy) provides path-based routing to all services

---

## Folder Structure

```
k8s/
├── namespace/           # Namespace definitions (dev + prod)
│   └── namespace.yaml
├── nfs/                 # NFS dynamic storage provisioner
│   ├── rbac.yaml
│   ├── storageclass.yaml
│   ├── nfs-provisioner-deployment.yaml
│   └── README.md
├── mongodb/             # MongoDB 7.0 StatefulSet (3-replica)
│   ├── statefulset-dev.yaml
│   ├── statefulset-prod.yaml
│   ├── service-dev.yaml
│   ├── service-prod.yaml
│   ├── rs-init-job-dev.yaml
│   ├── rs-init-job-prod.yaml
│   └── README.md
├── secrets/             # Bitnami Sealed Secrets
│   ├── sealedsecret-dev.yaml
│   ├── sealedsecret-prod.yaml
│   └── README.md
├── configmap/           # Non-secret configuration
│   ├── configmap-dev.yaml
│   └── configmap-prod.yaml
├── backend-services/    # Auth, Assessment, Therapist deployments
│   ├── auth-deployment-dev.yaml
│   ├── auth-deployment-prod.yaml
│   ├── assessment-deployment-dev.yaml
│   ├── assessment-deployment-prod.yaml
│   ├── therapist-deployment-dev.yaml
│   └── therapist-deployment-prod.yaml
├── frontend/            # Frontend Argo Rollout (Blue-Green)
│   ├── frontend-rollout-dev.yaml
│   └── frontend-rollout-prod.yaml
├── services/            # ClusterIP service definitions
│   ├── services-dev.yaml
│   └── services-prod.yaml
├── hpa/                 # Horizontal Pod Autoscaler
│   ├── frontend-hpa-dev.yaml
│   └── frontend-hpa-prod.yaml
├── network-policy/      # NetworkPolicy for MongoDB access control
│   ├── networkpolicy-dev.yaml
│   └── networkpolicy-prod.yaml
├── gateway/             # KGateway + HTTPRoute
│   ├── kgateway-dev.yaml
│   ├── kgateway-prod.yaml
│   └── README.md
├── apply-dev.sh         # One-click DEV deployment script
├── apply-prod.sh        # One-click PROD deployment script
└── README.md            # This file
```

| Folder | Contents | Purpose |
|--------|----------|---------|
| `namespace/` | `namespace.yaml` | Creates both namespaces |
| `nfs/` | storageclass, rbac, deployment | NFS provisioner setup |
| `mongodb/` | statefulset, service, init-job | MongoDB HA replica set |
| `secrets/` | sealedsecret-dev/prod | Encrypted secrets |
| `configmap/` | configmap-dev/prod | Non-secret config |
| `backend-services/` | auth/assessment/therapist deployments | Application services |
| `frontend/` | frontend-rollout | Blue-Green frontend |
| `services/` | services-dev/prod | K8s ClusterIP services |
| `hpa/` | frontend-hpa | Auto-scaling |
| `network-policy/` | networkpolicy | MongoDB access control |
| `gateway/` | kgateway, httproute | Ingress routing |

---

## Prerequisites Checklist

Run these commands to verify your cluster is ready:

```bash
# Cluster is reachable
kubectl cluster-info

# Sealed Secrets controller is running
kubectl get pods -n kube-system | grep sealed-secrets

# Argo Rollouts controller is running
kubectl get pods -n argo-rollouts

# Gateway API CRDs are installed
kubectl get crd httproutes.gateway.networking.k8s.io

# KGateway GatewayClass exists and is accepted
kubectl get gatewayclass

# Metrics Server is running (required for HPA)
kubectl get deployment metrics-server -n kube-system

# NFS StorageClass exists
kubectl get storageclass nfs-client

# NFS Provisioner pod is running
kubectl get pods -n kube-system | grep nfs
```

---

## Pre-Deployment Steps (MUST DO BEFORE RUNNING SCRIPTS)

### A. Replace Placeholders in Deployment Files

Replace `DOCKER_USERNAME` with your actual DockerHub username in these files:

```bash
# Find all files containing the placeholder
grep -rl "DOCKER_USERNAME" k8s/

# Files to update:
#   backend-services/auth-deployment-dev.yaml
#   backend-services/auth-deployment-prod.yaml
#   backend-services/assessment-deployment-dev.yaml
#   backend-services/assessment-deployment-prod.yaml
#   backend-services/therapist-deployment-dev.yaml
#   backend-services/therapist-deployment-prod.yaml
#   frontend/frontend-rollout-dev.yaml
#   frontend/frontend-rollout-prod.yaml

# Quick replace (Linux/Mac):
find k8s/ -name "*.yaml" -exec sed -i 's/DOCKER_USERNAME/your-username/g' {} +
```

### B. MongoDB Keyfile Creation

```bash
# Generate keyfile
openssl rand -base64 756 > /tmp/mongodb-keyfile
chmod 400 /tmp/mongodb-keyfile

# Create secret in DEV namespace
kubectl create secret generic mongodb-keyfile \
  --from-file=keyfile=/tmp/mongodb-keyfile \
  --namespace=wellnest-dev

# Create secret in PROD namespace
kubectl create secret generic mongodb-keyfile \
  --from-file=keyfile=/tmp/mongodb-keyfile \
  --namespace=wellnest-prod

# Delete the raw keyfile
rm /tmp/mongodb-keyfile
```

> **Note:** You must create the namespaces first: `kubectl apply -f k8s/namespace/namespace.yaml`

### C. Sealed Secrets Generation

#### DEV:
```bash
kubectl create secret generic wellnest-secrets \
  --namespace=wellnest-dev \
  --from-literal=MONGODB_ROOT_USER=admin \
  --from-literal=MONGODB_ROOT_PASS=WellNestSecure2024! \
  --from-literal=MONGODB_URI="mongodb://admin:WellNestSecure2024!@mongodb-0.mongodb-headless.wellnest-dev.svc.cluster.local:27017,mongodb-1.mongodb-headless.wellnest-dev.svc.cluster.local:27017,mongodb-2.mongodb-headless.wellnest-dev.svc.cluster.local:27017/wellnest?authSource=admin&replicaSet=rs0" \
  --from-literal=JWT_SECRET=wellnest-super-secret-jwt-key-change-this-in-prod \
  --dry-run=client -o yaml > /tmp/wellnest-secrets-dev-raw.yaml

kubeseal \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  --format yaml \
  < /tmp/wellnest-secrets-dev-raw.yaml \
  > k8s/secrets/sealedsecret-dev.yaml

rm /tmp/wellnest-secrets-dev-raw.yaml
```

#### PROD:
```bash
kubectl create secret generic wellnest-secrets \
  --namespace=wellnest-prod \
  --from-literal=MONGODB_ROOT_USER=admin \
  --from-literal=MONGODB_ROOT_PASS=WellNestSecure2024! \
  --from-literal=MONGODB_URI="mongodb://admin:WellNestSecure2024!@mongodb-0.mongodb-headless.wellnest-prod.svc.cluster.local:27017,mongodb-1.mongodb-headless.wellnest-prod.svc.cluster.local:27017,mongodb-2.mongodb-headless.wellnest-prod.svc.cluster.local:27017/wellnest?authSource=admin&replicaSet=rs0" \
  --from-literal=JWT_SECRET=wellnest-prod-jwt-secret-replace-with-strong-key \
  --dry-run=client -o yaml > /tmp/wellnest-secrets-prod-raw.yaml

kubeseal \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  --format yaml \
  < /tmp/wellnest-secrets-prod-raw.yaml \
  > k8s/secrets/sealedsecret-prod.yaml

rm /tmp/wellnest-secrets-prod-raw.yaml
```

### D. NFS Provisioner Check

```bash
kubectl get storageclass nfs-client
kubectl get pods -n kube-system | grep nfs
```

If not running, apply the NFS manifests (see `k8s/nfs/README.md`).

---

## Deploy to DEV

```bash
# Make script executable
chmod +x k8s/apply-dev.sh

# Run the deployment
./k8s/apply-dev.sh

# Verify everything is running
kubectl get all -n wellnest-dev
kubectl get pvc -n wellnest-dev
kubectl get hpa -n wellnest-dev
kubectl get httproute -n wellnest-dev
```

---

## Deploy to PROD

```bash
# Make script executable
chmod +x k8s/apply-prod.sh

# Run the deployment
./k8s/apply-prod.sh

# Verify everything is running
kubectl get all -n wellnest-prod
kubectl get pvc -n wellnest-prod
kubectl get hpa -n wellnest-prod
kubectl get httproute -n wellnest-prod
```

---

## Verification Commands

### All Resources

```bash
kubectl get all -n wellnest-dev
kubectl get all -n wellnest-prod
```

### Secrets Decrypted

```bash
kubectl get secret wellnest-secrets -n wellnest-dev -o yaml
```

### MongoDB Replica Set Status

```bash
kubectl exec -it mongodb-0 -n wellnest-dev -- \
  mongosh -u admin -p PASS \
  --authenticationDatabase admin \
  --eval "rs.status()"
```

### HPA Status

```bash
kubectl get hpa -n wellnest-dev
kubectl top pods -n wellnest-dev
```

### Network Policy Test (Frontend Blocked from MongoDB)

```bash
# This should TIMEOUT — proving the policy blocks frontend→MongoDB
kubectl run nettest \
  --image=busybox \
  --labels="app=frontend" \
  --rm -it \
  -n wellnest-dev \
  -- sh -c "nc -zv mongodb.wellnest-dev.svc.cluster.local 27017"

# Expected: connection timeout — policy is working ✓
```

### Rollout Status

```bash
kubectl argo rollouts get rollout frontend -n wellnest-dev
```

### Gateway Status

```bash
kubectl get gateway -n wellnest-dev
kubectl get httproute -n wellnest-dev
```

---

## Blue-Green Deployment Guide

### Update Frontend Image

```bash
# Update the image in the rollout
kubectl argo rollouts set image frontend \
  frontend=docker.io/DOCKER_USERNAME/wellnest-frontend:v2 \
  -n wellnest-dev
```

### Check Rollout Progress

```bash
kubectl argo rollouts get rollout frontend -n wellnest-dev --watch
```

### Promote (Go Live)

```bash
# After verifying the preview looks good:
kubectl argo rollouts promote frontend -n wellnest-dev
```

### Abort (Rollback)

```bash
# If something is wrong with the new version:
kubectl argo rollouts abort frontend -n wellnest-dev
```

---

## Access the Application

### Add `/etc/hosts` Entries

```bash
# Replace <NODE_IP> with your cluster node IP
sudo sh -c 'echo "<NODE_IP>  wellnest-dev.local wellnest-prod.local" >> /etc/hosts'
```

### Browser URLs

| Environment | URL |
|-------------|-----|
| DEV | http://wellnest-dev.local |
| PROD | http://wellnest-prod.local |

### API Health Checks

```bash
curl http://wellnest-dev.local/api/auth/health
curl http://wellnest-dev.local/api/assessment/health
curl http://wellnest-dev.local/api/therapist/health
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| MongoDB pods stuck in `Pending` | NFS StorageClass not found or NFS server unreachable | `kubectl get storageclass nfs-client` and check NFS server |
| SealedSecret not decrypting | Namespace mismatch or wrong cluster key | Re-seal with correct namespace; check `kubectl logs -n kube-system -l app.kubernetes.io/name=sealed-secrets` |
| HPA showing `<unknown>` targets | Metrics Server not installed or not ready | `kubectl get deployment metrics-server -n kube-system` |
| Gateway not routing traffic | Wrong `gatewayClassName` or GatewayClass not accepted | `kubectl get gatewayclass` and verify `ACCEPTED=True` |
| Rollout `Degraded` | Pod crash or image pull failure | `kubectl argo rollouts get rollout frontend -n wellnest-dev` and `kubectl describe pod -n wellnest-dev -l app=frontend` |
| Backend pods `CrashLoopBackOff` | MongoDB not ready or wrong MONGODB_URI | Check pod logs: `kubectl logs -n wellnest-dev -l app=auth-service` |
| Image pull `ErrImagePull` | Wrong DOCKER_USERNAME or private repo | Verify image exists: `docker pull DOCKER_USERNAME/wellnest-auth:dev` |

---

## Cleanup Commands

```bash
# Delete DEV environment
kubectl delete namespace wellnest-dev

# Delete PROD environment
kubectl delete namespace wellnest-prod

# Delete both (removes ALL WellNest resources)
kubectl delete namespace wellnest-dev wellnest-prod
```

> **Warning:** Deleting a namespace removes ALL resources within it, including PVCs. Data on NFS will be retained due to `reclaimPolicy: Retain`.
