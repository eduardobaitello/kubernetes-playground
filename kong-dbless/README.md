# kong-dbless
A playground that uses Kong in DBLess mode + Nginx Ingress Controllers.

## Requirements
- kubectl
- minikube
- helm

*All versions covererd in the `.tools-versions` file.*

## Environment
Use the following to start Minikube:
```
minikube start --kubernetes-version=v1.22.4 --service-cluster-ip-range=172.16.0.0/16 --nodes=2
```
Then, enable the ingress addon:
```
minikube addons enable ingress
```

## Installing Kong Release
This playground uses the official Kong helm chart.

Run the following commands to install the Kong release:
```
helm repo add kong https://charts.konghq.com
helm repo update
helm install --create-namespace kong kong/kong -n kong --set-file dblessConfig.config=./dbless-config.yaml --values values-kong.yaml --version 2.6.1
```

To upgrade the existing release:
```
helm upgrade kong kong/kong -n kong --set-file dblessConfig.config=./dbless-config.yaml --values values-kong.yaml
```

## Deploying test applications
Create the namespace, and deploy the apps using helm:
```
helm install --create-namespace --values ./values-hello-kubernetes --namespace hot-dog hot-dog ./hello-kubernetes
```
