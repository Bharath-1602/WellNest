# KGateway (Gateway API) — WellNest

This folder contains the **Gateway** and **HTTPRoute** resources for routing external traffic to WellNest services using the Kubernetes Gateway API with KGateway (Envoy-based).

---

## What is KGateway / Envoy Gateway?

KGateway is a Kubernetes-native API gateway built on **Envoy Proxy**. It implements the **Kubernetes Gateway API** specification, providing:

- Layer 7 (HTTP) routing based on hostnames and paths
- Traffic splitting and weighted routing
- TLS termination
- Modern replacement for the legacy Ingress API

---

## Gateway API vs Ingress — Why We Use Gateway API

| Feature | Ingress (legacy) | Gateway API (modern) |
|---------|-------------------|----------------------|
| API maturity | Stable but limited | GA since v1.0 |
| Role separation | Single resource | Gateway + Route separation |
| Multi-tenancy | Poor | Built-in namespace support |
| Protocol support | HTTP/HTTPS only | HTTP, gRPC, TCP, UDP |
| Extensibility | Annotations (vendor-specific) | Typed, structured API |
| Header/query routing | Not standard | Native support |

WellNest uses Gateway API because it is the **future standard** for Kubernetes ingress and provides clean separation between infrastructure (Gateway) and application routing (HTTPRoute).

---

## GatewayClass Verification

Before applying Gateway resources, verify the GatewayClass exists:

```bash
kubectl get gatewayclass
```

Expected output:
```
NAME       CONTROLLER                    ACCEPTED   AGE
kgateway   kgateway.dev/kgateway         True       ...
```

> **⚠️** If `ACCEPTED` is not `True`, the KGateway controller is not ready. Check its deployment:
> ```bash
> kubectl get pods -n kgateway-system
> ```

---

## Apply Order

Apply Gateway first, then HTTPRoute:

```bash
# DEV
kubectl apply -f kgateway-dev.yaml

# PROD
kubectl apply -f kgateway-prod.yaml
```

The Gateway must be `Accepted` before the HTTPRoute can attach to it.

---

## Verify Routes

```bash
# Check Gateway status
kubectl get gateway -n wellnest-dev
# Expected: PROGRAMMED = True

# Check HTTPRoute status
kubectl get httproute -n wellnest-dev
# Expected: ACCEPTED = True

# Detailed route info
kubectl describe httproute wellnest-routes -n wellnest-dev
```

For prod:
```bash
kubectl get gateway -n wellnest-prod
kubectl get httproute -n wellnest-prod
kubectl describe httproute wellnest-routes -n wellnest-prod
```

---

## Testing Routes

### From within the cluster:

```bash
# Test auth service
curl -H "Host: wellnest-dev.local" http://<NODE_IP>/api/auth/health

# Test assessment service
curl -H "Host: wellnest-dev.local" http://<NODE_IP>/api/assessment/health

# Test therapist service
curl -H "Host: wellnest-dev.local" http://<NODE_IP>/api/therapist/health

# Test frontend (catch-all)
curl -H "Host: wellnest-dev.local" http://<NODE_IP>/
```

### Find NODE_IP:

```bash
# Get the Gateway's assigned address
kubectl get gateway wellnest-gateway -n wellnest-dev \
  -o jsonpath='{.status.addresses[0].value}'

# Or use any node IP
kubectl get nodes -o wide
```

---

## Add to /etc/hosts for Browser Testing

Add these entries to your local machine's `/etc/hosts` file:

```
<NODE_IP>  wellnest-dev.local
<NODE_IP>  wellnest-prod.local
```

On Linux/Mac:
```bash
sudo sh -c 'echo "<NODE_IP>  wellnest-dev.local wellnest-prod.local" >> /etc/hosts'
```

Then open in your browser:
- **DEV:** http://wellnest-dev.local
- **PROD:** http://wellnest-prod.local

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Gateway not `Accepted` | Wrong `gatewayClassName` | Verify with `kubectl get gatewayclass` |
| HTTPRoute not `Accepted` | Gateway not ready or wrong `parentRef` | Check Gateway status first |
| 404 on all routes | HTTPRoute not attached | `kubectl describe httproute wellnest-routes -n wellnest-dev` |
| Routes work with curl but not browser | Missing `/etc/hosts` entry | Add hostname mapping |
| Connection refused | Gateway pod not running | Check KGateway controller pods |
