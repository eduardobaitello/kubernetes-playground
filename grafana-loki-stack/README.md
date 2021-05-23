# grafana-loki-stack
An implementation of [grafana-loki-stack-example](https://github.com/GusAntoniassi/grafana-loki-stack-example) using Kubernetes.

No Helm, no Operators. Only manually created kubernetes manifests.

## Requirements
- kubectl
- minikube
- skaffold

*All versions covererd in the `.tools-versions` file.*
## Environment
Use the following to start Minikube:
```
minikube start --kubernetes-version=v1.21.1
```
Then, enable the ingress addon:
```
minikube addons enable ingress
```

## Build the app images
Skaffold uses heuristics to detect [local clusters](https://skaffold.dev/docs/environment/local-cluster/#auto-detection) based on the Kubernetes context name.

Just run the following, and the images will be built in the Minikube cluster:
```
skaffold build -t latest
```

## Deploying the Clock app
Create the namespace, and deploy the manisfests:
```
kubectl create ns clock
kubectl apply -f manifests/app/ -n clock
```

## Deploying the monitoring stack
This should deploy the following stack:
- Prometheus
- Grafana
- Loki
- Prometheus
```
kubectl create ns monitoring
kubectl apply -f manifests/monitoring/ -n monitoring
```

## Endpoints
Ingress resources are created to the following endpoints:
```
http://$(minikube ip)/clock
http://$(minikube ip)/prometheus
http://$(minikube ip)/grafana
```
Promtail can be accessed by using `port-forward` for debugging purposes:
```
kubectl port-forward daemonset/promtail 3101:3101

```
