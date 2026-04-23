# Sealed Secrets — WellNest

This folder contains **SealedSecret** templates for encrypting sensitive configuration data (database credentials, JWT keys) using Bitnami Sealed Secrets.

---

## Why Sealed Secrets?

In a DevSecOps pipeline, secrets must **never** be committed to Git in plain text. Sealed Secrets solves this by:

1. Encrypting secrets with the cluster's **public key**
2. Only the Sealed Secrets controller (running in-cluster) can decrypt them
3. The encrypted `SealedSecret` YAML is **safe to commit** to Git
4. The controller automatically creates a standard `Secret` from the `SealedSecret`

---

## How Sealed Secrets Work

```
┌─────────────────┐     kubeseal      ┌──────────────────┐
│  Raw Secret     │ ──────────────►   │  SealedSecret    │
│  (plain text)   │   encrypts with   │  (encrypted)     │
│  DO NOT COMMIT  │   cluster pubkey  │  SAFE TO COMMIT  │
└─────────────────┘                   └──────────────────┘
                                             │
                                             │ kubectl apply
                                             ▼
                                      ┌──────────────────┐
                                      │  Controller      │
                                      │  decrypts →      │
                                      │  creates Secret  │
                                      └──────────────────┘
```

---

## Complete Step-by-Step for DEV Environment

### Step 1: Verify Sealed Secrets controller is running

```bash
kubectl get pods -n kube-system | grep sealed-secrets
# Should show: sealed-secrets-controller-xxxxx  1/1  Running
```

### Step 2: Create the raw secret (DO NOT COMMIT)

```bash
kubectl create secret generic wellnest-secrets \
  --namespace=wellnest-dev \
  --from-literal=MONGODB_ROOT_USER=admin \
  --from-literal=MONGODB_ROOT_PASS=WellNestSecure2024! \
  --from-literal=MONGODB_URI="mongodb://admin:WellNestSecure2024!@mongodb-0.mongodb-headless.wellnest-dev.svc.cluster.local:27017,mongodb-1.mongodb-headless.wellnest-dev.svc.cluster.local:27017,mongodb-2.mongodb-headless.wellnest-dev.svc.cluster.local:27017/wellnest?authSource=admin&replicaSet=rs0" \
  --from-literal=JWT_SECRET=wellnest-super-secret-jwt-key-change-this-in-prod \
  --dry-run=client \
  -o yaml > /tmp/wellnest-secrets-dev-raw.yaml
```

### Step 3: Seal the secret

```bash
kubeseal \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  --format yaml \
  < /tmp/wellnest-secrets-dev-raw.yaml \
  > k8s/secrets/sealedsecret-dev.yaml
```

### Step 4: Delete the raw secret immediately

```bash
rm /tmp/wellnest-secrets-dev-raw.yaml
```

### Step 5: Apply the sealed secret

```bash
kubectl apply -f k8s/secrets/sealedsecret-dev.yaml
```

### Step 6: Verify the real Secret was created

```bash
kubectl get secret wellnest-secrets -n wellnest-dev
# Should show: wellnest-secrets  Opaque  4  <age>
```

---

## Complete Step-by-Step for PROD Environment

### Step 1: Create the raw secret

```bash
kubectl create secret generic wellnest-secrets \
  --namespace=wellnest-prod \
  --from-literal=MONGODB_ROOT_USER=admin \
  --from-literal=MONGODB_ROOT_PASS=WellNestSecure2024! \
  --from-literal=MONGODB_URI="mongodb://admin:WellNestSecure2024!@mongodb-0.mongodb-headless.wellnest-prod.svc.cluster.local:27017,mongodb-1.mongodb-headless.wellnest-prod.svc.cluster.local:27017,mongodb-2.mongodb-headless.wellnest-prod.svc.cluster.local:27017/wellnest?authSource=admin&replicaSet=rs0" \
  --from-literal=JWT_SECRET=wellnest-prod-jwt-secret-replace-with-strong-key \
  --dry-run=client \
  -o yaml > /tmp/wellnest-secrets-prod-raw.yaml
```

### Step 2: Seal the secret

```bash
kubeseal \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  --format yaml \
  < /tmp/wellnest-secrets-prod-raw.yaml \
  > k8s/secrets/sealedsecret-prod.yaml
```

### Step 3: Delete raw file and apply

```bash
rm /tmp/wellnest-secrets-prod-raw.yaml
kubectl apply -f k8s/secrets/sealedsecret-prod.yaml
```

### Step 4: Verify

```bash
kubectl get secret wellnest-secrets -n wellnest-prod
```

---

## Important: Never Commit Raw Secrets

> **⚠️ WARNING:** The raw YAML files (`/tmp/wellnest-secrets-*-raw.yaml`) contain **plain-text credentials**. Always delete them immediately after sealing. Only the `sealedsecret-*.yaml` files are safe to commit to Git.

The `.gitignore` should already exclude `/tmp/` paths, but always double-check.

---

## Verify Decryption Worked

```bash
# Check that the controller created the Secret
kubectl get secret wellnest-secrets -n wellnest-dev -o jsonpath='{.data}' | jq .

# Decode a specific value to verify
kubectl get secret wellnest-secrets -n wellnest-dev \
  -o jsonpath='{.data.MONGODB_ROOT_USER}' | base64 -d
# Should output: admin
```

---

## Troubleshooting: Sealed Secret Fails to Decrypt

| Issue | Cause | Fix |
|-------|-------|-----|
| `no key could decrypt secret` | Sealed with a different cluster's key | Re-seal using the current cluster's kubeseal |
| `namespace mismatch` | SealedSecret namespace != target namespace | Ensure `--namespace` in raw secret matches the SealedSecret metadata |
| Controller not running | Pod crashed or not installed | `kubectl get pods -n kube-system \| grep sealed-secrets` |
| Secret not created after apply | Controller logs show error | `kubectl logs -n kube-system -l app.kubernetes.io/name=sealed-secrets` |

To re-seal for a new cluster:
```bash
# Fetch the new cluster's public key
kubeseal --fetch-cert \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  > /tmp/sealed-secrets-pub.pem

# Re-seal with the new key
kubeseal --cert /tmp/sealed-secrets-pub.pem \
  --format yaml \
  < /tmp/wellnest-secrets-dev-raw.yaml \
  > k8s/secrets/sealedsecret-dev.yaml
```
