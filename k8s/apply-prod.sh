#!/bin/bash
# ─────────────────────────────────────────────────────────────
# WellNest — PROD Environment Deployment Script
# Environment: prod
# Namespace: wellnest-prod
# Phase: 2 — Kubernetes Manifests
# ─────────────────────────────────────────────────────────────
# Usage: chmod +x apply-prod.sh && ./apply-prod.sh
# ─────────────────────────────────────────────────────────────
set -e

NAMESPACE="wellnest-prod"
K8S_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_step() { echo -e "\n${BLUE}━━━ $1 ${NC}"; }
log_ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
log_warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
log_err()  { echo -e "${RED}  ✗ $1${NC}"; exit 1; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     WellNest — PROD Deployment Script    ║${NC}"
echo -e "${BLUE}║     Namespace: wellnest-prod             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"

log_step "Step 1: Prerequisites Check"

kubectl cluster-info --request-timeout=5s > /dev/null 2>&1 \
  && log_ok "Cluster reachable" \
  || log_err "Cannot reach cluster. Check kubectl config."

kubectl get crd sealedsecrets.bitnami.com > /dev/null 2>&1 \
  && log_ok "Sealed Secrets CRD found" \
  || log_err "Sealed Secrets not installed"

kubectl get crd rollouts.argoproj.io > /dev/null 2>&1 \
  && log_ok "Argo Rollouts CRD found" \
  || log_err "Argo Rollouts not installed"

kubectl get crd httproutes.gateway.networking.k8s.io > /dev/null 2>&1 \
  && log_ok "Gateway API CRDs found" \
  || log_err "Gateway API CRDs not installed"

kubectl get storageclass nfs-client > /dev/null 2>&1 \
  && log_ok "StorageClass nfs-client found" \
  || log_warn "nfs-client StorageClass not found — applying now..."

log_step "Step 2: Namespace"
kubectl apply -f "$K8S_DIR/namespace/namespace.yaml"
log_ok "Namespaces created"

log_step "Step 3: NFS StorageClass"
kubectl get storageclass nfs-client > /dev/null 2>&1 \
  && log_warn "nfs-client already exists — skipping" \
  || kubectl apply -f "$K8S_DIR/nfs/storageclass.yaml" \
  && log_ok "StorageClass applied"

log_step "Step 4: ConfigMap"
kubectl apply -f "$K8S_DIR/configmap/configmap-prod.yaml"
log_ok "ConfigMap applied"

log_step "Step 5: Sealed Secret"
log_warn "Ensure you have sealed the secrets first!"
log_warn "See k8s/secrets/README.md for instructions."
kubectl apply -f "$K8S_DIR/secrets/sealedsecret-prod.yaml"
log_ok "SealedSecret applied"

log_step "Step 6: MongoDB Keyfile Check"
kubectl get secret mongodb-keyfile -n $NAMESPACE > /dev/null 2>&1 \
  && log_ok "mongodb-keyfile secret found" \
  || log_err "mongodb-keyfile secret NOT found!\nRun:\n  openssl rand -base64 756 > /tmp/kf\n  kubectl create secret generic mongodb-keyfile --from-file=keyfile=/tmp/kf -n $NAMESPACE\n  rm /tmp/kf"

log_step "Step 7: MongoDB StatefulSet"
kubectl apply -f "$K8S_DIR/mongodb/statefulset-prod.yaml"
kubectl apply -f "$K8S_DIR/mongodb/service-prod.yaml"
log_ok "MongoDB StatefulSet and Services applied"
echo "  Waiting for MongoDB pods (timeout: 3 min)..."
kubectl rollout status statefulset/mongodb \
  -n $NAMESPACE --timeout=180s
log_ok "MongoDB StatefulSet ready"

log_step "Step 8: MongoDB Replica Set Init"
kubectl delete job mongodb-rs-init -n $NAMESPACE 2>/dev/null \
  && log_warn "Old init job deleted" || true
kubectl apply -f "$K8S_DIR/mongodb/rs-init-job-prod.yaml"
echo "  Waiting for init job (timeout: 2 min)..."
kubectl wait --for=condition=complete \
  job/mongodb-rs-init \
  -n $NAMESPACE \
  --timeout=120s
log_ok "Replica set initialized"

log_step "Step 9: Backend Services"
kubectl apply -f "$K8S_DIR/backend-services/auth-deployment-prod.yaml"
kubectl apply -f "$K8S_DIR/backend-services/assessment-deployment-prod.yaml"
kubectl apply -f "$K8S_DIR/backend-services/therapist-deployment-prod.yaml"
log_ok "Backend deployments applied"

log_step "Step 10: Frontend Rollout"
kubectl apply -f "$K8S_DIR/frontend/frontend-rollout-prod.yaml"
log_ok "Frontend Rollout applied"

log_step "Step 11: Services"
kubectl apply -f "$K8S_DIR/services/services-prod.yaml"
log_ok "Services applied"

log_step "Step 12: HPA"
kubectl apply -f "$K8S_DIR/hpa/frontend-hpa-prod.yaml"
log_ok "HPA applied"

log_step "Step 13: Network Policies"
kubectl apply -f "$K8S_DIR/network-policy/networkpolicy-prod.yaml"
log_ok "NetworkPolicies applied"

log_step "Step 14: KGateway"
kubectl apply -f "$K8S_DIR/gateway/kgateway-prod.yaml"
log_ok "Gateway and HTTPRoute applied"

log_step "Step 15: Wait for All Deployments"
kubectl rollout status deployment/auth-service \
  -n $NAMESPACE --timeout=120s
kubectl rollout status deployment/assessment-service \
  -n $NAMESPACE --timeout=120s
kubectl rollout status deployment/therapist-service \
  -n $NAMESPACE --timeout=120s
log_ok "All backend services ready"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     PROD Deployment Complete! ✓          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "Verify:"
echo "  kubectl get all -n $NAMESPACE"
echo "  kubectl get httproute -n $NAMESPACE"
echo "  kubectl get hpa -n $NAMESPACE"
echo "  kubectl argo rollouts get rollout frontend -n $NAMESPACE"
echo ""
echo "Access:"
echo "  Add to /etc/hosts: <NODE_IP>  wellnest-prod.local"
echo "  Open: http://wellnest-prod.local"
echo ""
