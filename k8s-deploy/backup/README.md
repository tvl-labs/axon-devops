The backup process is based on the instructions here: https://github.com/vmware-tanzu/velero-plugin-for-aws/blob/15e6f1061b5c2685338a15ac7d6d0b6c4c58fb7d/README.md

## Preparations

1. Install: AWS CLI, kubectl, eksctl and login to the Kubernetes cluster.

2. Install Velero CLI
```
wget https://github.com/vmware-tanzu/velero/releases/download/v1.9.5/velero-v1.9.5-linux-amd64.tar.gz
tar -xvf velero-v1.9.5-linux-amd64.tar.gz -C /tmp
sudo mv /tmp/velero-v1.9.5-linux-amd64/velero /usr/local/bin
```

3. Create `credentials-velero` file in "k8s-deploy/backup" directory with following content:
```
[default]
aws_access_key_id=<AWS_ACCESS_KEY_ID>
aws_secret_access_key=<AWS_SECRET_ACCESS_KEY>
```

The credentials are secret key for the "velero" AWS user. If you don't have credentials ask someone in the team to help you.

## Backup

1. Perform actual backup

```
velero backup create axon-backup
```

Check if backup is in phase "Completed":
```
velero backup describe axon-backup
```

## Restore

1. Go to tvl-labs/infrastructure repository and eks-axon-recovery directory and follow the instructions there to create a cluster.
2. Switch to Recovery cluster config in Kubernetes
3. Install Velero in the Recovery cluster 
```
velero install \
    --provider aws \
    --plugins velero/velero-plugin-for-aws:v1.6.0 \
    --bucket axon-eks-velero \
    --backup-location-config region=us-east-1 \
    --snapshot-location-config region=us-east-1 \
    --secret-file ./credentials-velero
```

4. Restore backup:
```
velero restore create axon-restore \
    --from-backup axon-backup \
    --include-namespaces axon
```

Run `velero restore describe axon-restore` or `velero restore logs axon-restore` for more details.