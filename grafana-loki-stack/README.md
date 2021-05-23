# grafana-loki-stack
An implementation of [grafana-loki-stack-example](https://github.com/GusAntoniassi/grafana-loki-stack-example) using Kubernetes.

```
minikube start --kubernetes-version=v1.21.1
minikube addons enable ingress
skaffold build -t latest
kubectl create ns clock
kubectl apply -f manifests/app/ -n clock
kubectl create ns monitoring
kubectl apply -f manifests/monitoring/ -n monitoring
```
