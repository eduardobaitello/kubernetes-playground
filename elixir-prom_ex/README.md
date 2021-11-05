```
minikube start --kubernetes-version=v1.21.1
helm dependency update monitoring/
helm install monitoring monitoring/ --namespace=monitoring --create-namespace
kubectl get secret --namespace monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

helm upgrade monitoring monitoring/ --namespace=monitoring
```
