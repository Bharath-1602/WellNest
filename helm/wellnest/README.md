# WellNest Helm Chart

Umbrella Helm chart for the WellNest mental health platform. Deploys all services, MongoDB, NFS provisioner, gateway, and network policies from a single chart with environment-specific overrides.

## Chart Structure

| Path | Purpose |
|------|---------|
| `Chart.yaml` | Umbrella chart metadata |
| `values.yaml` | Base defaults — all keys defined here |
| `values-dev.yaml` | Dev overrides (1 replica, dev tags, 2Gi storage) |
| `values-prod.yaml` | Prod overrides (2 replicas, latest tags, 5Gi storage) |
| `templates/_helpers.tpl` | Shared helpers (namespace, labels, URLs, image) |
| `templates/namespace.yaml` | Namespace creation |
| `templates/configmap.yaml` | Non-secret configuration |
| `templates/sealedsecret.yaml` | Encrypted secrets template |
| `templates/gateway.yaml` | KGateway + HTTPRoute |
| `templates/network-policies/` | MongoDB ingress + frontend egress policies |
| `charts/auth/` | Auth service deployment + service |
| `charts/assessment/` | Assessment service deployment + service |
| `charts/therapist/` | Therapist service deployment + service |
| `charts/frontend/` | Argo Rollout + HPA + services + analysis |
| `charts/mongo/` | MongoDB StatefulSet + services + RS init job |
| `charts/nfs/` | NFS provisioner (StorageClass, RBAC, deployment) |

## Values Files

| File | Purpose |
|------|---------|
| `values.yaml` | Base defaults — all keys defined here |
| `values-dev.yaml` | Dev overrides — `wellnest-dev` namespace, `:dev` tags |
| `values-prod.yaml` | Prod overrides — `wellnest-prod` namespace, `:latest` tags |

## Pre-Install Checklist

### 1. Replace DOCKER_USERNAME in values.yaml

```bash
sed -i 's/DOCKER_USERNAME/your-dockerhub-username/g' helm/wellnest/values.yaml
```

### 2. Replace NFS_SERVER_IP in values.yaml

```bash
sed -i 's/NFS_SERVER_IP/172.31.90.107/g' helm/wellnest/values.yaml
```

### 3. Create namespaces (needed for keyfile secrets)

```bash
kubectl create namespace wellnest-dev 2>/dev/null || true
kubectl create namespace wellnest-prod 2>/dev/null || true
```

### 4. Create MongoDB keyfile secret

```bash
openssl rand -base64 756 > /tmp/mongodb-keyfile
chmod 400 /tmp/mongodb-keyfile
kubectl create secret generic mongodb-keyfile \
  --from-file=keyfile=/tmp/mongodb-keyfile -n wellnest-dev
kubectl create secret generic mongodb-keyfile \
  --from-file=keyfile=/tmp/mongodb-keyfile -n wellnest-prod
rm /tmp/mongodb-keyfile
```

### 5. Generate sealed secrets

See [Sealing Secrets](#sealing-secrets) below.

## Sealing Secrets

### DEV

```bash
kubectl create secret generic wellnest-secrets \
  --namespace=wellnest-dev \
  --from-literal=MONGODB_ROOT_USER=admin \
  --from-literal=MONGODB_ROOT_PASS=WellNestSecure2024! \
  --from-literal=MONGODB_URI="mongodb://admin:WellNestSecure2024!@mongodb-0.mongodb-headless.wellnest-dev.svc.cluster.local:27017,mongodb-1.mongodb-headless.wellnest-dev.svc.cluster.local:27017,mongodb-2.mongodb-headless.wellnest-dev.svc.cluster.local:27017/wellnest?authSource=admin&replicaSet=rs0" \
  --from-literal=JWT_SECRET=wellnest-super-secret-jwt-key-dev \
  --dry-run=client -o yaml > /tmp/raw-dev.yaml

kubeseal \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  --format yaml < /tmp/raw-dev.yaml > /tmp/sealed-dev.yaml

rm /tmp/raw-dev.yaml
```

Copy the `encryptedData` values from `/tmp/sealed-dev.yaml` into `templates/sealedsecret.yaml` replacing the `REPLACE_WITH_SEALED_VALUE` placeholders. Then delete `/tmp/sealed-dev.yaml`.

### PROD

```bash
kubectl create secret generic wellnest-secrets \
  --namespace=wellnest-prod \
  --from-literal=MONGODB_ROOT_USER=admin \
  --from-literal=MONGODB_ROOT_PASS=WellNestSecure2024! \
  --from-literal=MONGODB_URI="mongodb://admin:WellNestSecure2024!@mongodb-0.mongodb-headless.wellnest-prod.svc.cluster.local:27017,mongodb-1.mongodb-headless.wellnest-prod.svc.cluster.local:27017,mongodb-2.mongodb-headless.wellnest-prod.svc.cluster.local:27017/wellnest?authSource=admin&replicaSet=rs0" \
  --from-literal=JWT_SECRET=wellnest-prod-jwt-secret-strong-key \
  --dry-run=client -o yaml > /tmp/raw-prod.yaml

kubeseal \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  --format yaml < /tmp/raw-prod.yaml > /tmp/sealed-prod.yaml

rm /tmp/raw-prod.yaml
```

> **Note:** Since `sealedsecret.yaml` uses a single template, you need to seal per-environment and apply separately, or manage two sealed secret files.

## Install

```bash
# DEV
helm install wellnest ./helm/wellnest \
  -f ./helm/wellnest/values-dev.yaml \
  --namespace wellnest-dev \
  --create-namespace

# PROD
helm install wellnest-prod ./helm/wellnest \
  -f ./helm/wellnest/values-prod.yaml \
  --namespace wellnest-prod \
  --create-namespace
```

## Upgrade

```bash
helm upgrade wellnest ./helm/wellnest \
  -f ./helm/wellnest/values-dev.yaml \
  --namespace wellnest-dev

helm upgrade wellnest-prod ./helm/wellnest \
  -f ./helm/wellnest/values-prod.yaml \
  --namespace wellnest-prod
```

## Lint and Dry-Run

```bash
# Lint
helm lint helm/wellnest -f helm/wellnest/values-dev.yaml
helm lint helm/wellnest -f helm/wellnest/values-prod.yaml

# Template render (dry-run)
helm template wellnest helm/wellnest -f helm/wellnest/values-dev.yaml
helm template wellnest helm/wellnest -f helm/wellnest/values-prod.yaml
```

## Verify

```bash
helm list -n wellnest-dev
kubectl get all -n wellnest-dev
kubectl get pvc -n wellnest-dev
kubectl get hpa -n wellnest-dev
kubectl get httproute -n wellnest-dev
kubectl argo rollouts get rollout frontend -n wellnest-dev
```

## Blue-Green Promotion

```bash
# Check rollout status
kubectl argo rollouts get rollout frontend -n wellnest-dev

# Promote new version to live
kubectl argo rollouts promote frontend -n wellnest-dev

# Abort if issues
kubectl argo rollouts abort frontend -n wellnest-dev
```

## Uninstall

```bash
helm uninstall wellnest -n wellnest-dev
helm uninstall wellnest-prod -n wellnest-prod
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `helm lint` fails | Check YAML indentation in templates |
| Pods stuck `Pending` | Verify NFS StorageClass: `kubectl get sc nfs-client` |
| SealedSecret not decrypting | Re-seal with correct namespace and cluster key |
| HPA shows `<unknown>` | Check metrics-server: `kubectl get pods -n kube-system \| grep metrics` |
| RS init job fails | Delete and re-run: `kubectl delete job mongodb-rs-init -n wellnest-dev` then `helm upgrade` |
| Gateway not routing | Check gatewayclass: `kubectl get gatewayclass` |
| Image pull error | Verify DOCKER_USERNAME was replaced in values.yaml |
