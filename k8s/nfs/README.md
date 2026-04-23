# NFS Storage Provisioner — WellNest

This folder contains the Kubernetes manifests for the **NFS Subdir External Provisioner**, which enables dynamic persistent volume provisioning for WellNest's MongoDB StatefulSet.

---

## What This Folder Contains

| File | Purpose |
|------|---------|
| `rbac.yaml` | ServiceAccount, ClusterRole, ClusterRoleBinding, Role, RoleBinding |
| `storageclass.yaml` | `nfs-client` StorageClass for dynamic PV provisioning |
| `nfs-provisioner-deployment.yaml` | Provisioner Deployment in `kube-system` |

---

## Prerequisites — NFS Server Setup on Host

Before using these manifests, you must have an NFS server running on your host (or a dedicated NFS node):

```bash
# Install NFS server
sudo apt install nfs-kernel-server -y

# Create the export directory
sudo mkdir -p /srv/nfs/kubedata
sudo chmod 777 /srv/nfs/kubedata

# Add the export
echo "/srv/nfs/kubedata *(rw,sync,no_subtree_check,no_root_squash)" \
  | sudo tee -a /etc/exports

# Apply the export and restart NFS
sudo exportfs -ra
sudo systemctl restart nfs-kernel-server
```

> **Note:** Replace `*` with your subnet (e.g., `192.168.1.0/24`) for better security.

---

## If Already Installed — Skip These Files

If the NFS provisioner is already running on your cluster, you can skip this folder entirely:

```bash
# Check if StorageClass exists
kubectl get storageclass nfs-client

# Check if provisioner pod is running
kubectl get deployment nfs-client-provisioner -n kube-system
kubectl get pods -n kube-system | grep nfs
```

If both return valid results, **skip to the `mongodb/` folder**.

---

## Fresh Install — Apply Order

If the NFS provisioner is **not** installed, apply in this order:

```bash
# 1. RBAC (ServiceAccount, Roles, Bindings)
kubectl apply -f rbac.yaml

# 2. StorageClass
kubectl apply -f storageclass.yaml

# 3. Provisioner Deployment
#    ⚠️  Replace NFS_SERVER_IP first!
kubectl apply -f nfs-provisioner-deployment.yaml
```

---

## Verify

```bash
# Provisioner pod should be Running
kubectl get pods -n kube-system | grep nfs

# StorageClass should exist
kubectl get storageclass nfs-client

# Test dynamic provisioning (optional)
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: test-nfs-claim
  namespace: default
spec:
  storageClassName: nfs-client
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 100Mi
EOF

# Check PVC is Bound
kubectl get pvc test-nfs-claim

# Cleanup test
kubectl delete pvc test-nfs-claim
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PVC stuck in `Pending` | Check provisioner pod logs: `kubectl logs -n kube-system -l app=nfs-client-provisioner` |
| Mount failed | Verify NFS server is accessible from worker nodes: `showmount -e NFS_SERVER_IP` |
| Permission denied | Ensure `/srv/nfs/kubedata` has `chmod 777` and `no_root_squash` in exports |
