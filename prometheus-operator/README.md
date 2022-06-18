# prometheus-operator
Prometheus Operator adapted for running on Minikube

## Requirements
- kubectl
- minikube
- helm

*All versions covererd in the `.tools-versions` file.*

## Environment
Use the following to start Minikube:
```
minikube start --kubernetes-version=v1.23.7 \
--nodes=2 \
--service-cluster-ip-range="172.16.0.0/16" \
--extra-config=scheduler.bind-address="0.0.0.0" \
--extra-config=controller-manager.bind-address="0.0.0.0" \
--extra-config=etcd.listen-metrics-urls="http://0.0.0.0:2381"
```

Notice that the _extra-configs_ exposes this services on all interfaces. It's **not safe for production environments**. See [kubeadm-pre-requisites](https://github.com/prometheus-operator/kube-prometheus/blob/main/docs/kube-prometheus-on-kubeadm.md#kubeadm-pre-requisites) for more information.

## Installing Prometheus Operator Release
This playground uses the official [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) helm chart.

Run the following commands to install:
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install --create-namespace prometheus-operator prometheus-community/kube-prometheus-stack -n prometheus-operator --values values.yaml --version 36.0.2
```

To upgrade the existing release:
```
helm upgrade prometheus-operator prometheus-community/kube-prometheus-stack -n prometheus-operator --values values.yaml
```
