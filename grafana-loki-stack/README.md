# grafana-loki-stack
An implementation of [grafana-loki-stack-example](https://github.com/GusAntoniassi/grafana-loki-stack-example) using Kubernetes.

```
minikube start
skaffold build -t latest
kubectl appy -f manifests/app/
```
