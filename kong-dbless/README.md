# kong-dbless
A playground that uses Kong in DBLess mode.

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

## Build the app image
```
export IMAGE_VERSION="latest"
make build-image-linux
minikube image load eduardobaitello/hello-kubernetes:latest --overwrite
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

Clone the hello-kubernetes project:
```
git clone git@github.com:eduardobaitello/hello-kubernetes.git
```

Create the namespaces, and deploy the apps using helm:
```
helm install --create-namespace --namespace hot-dog hot-dog ./hello-kubernetes/deploy/helm/hello-kubernetes \
  --set ingress.enabled=true \
  --set ingress.pathPrefix="/hot-dog/" \
  --set service.type="ClusterIP"

helm install --create-namespace --namespace pizza-cheese pizza-cheese ./hello-kubernetes/deploy/helm/hello-kubernetes \
  --set ingress.enabled=true \
  --set ingress.pathPrefix="/pizza-cheese/" \
  --set service.type="ClusterIP"


helm install --create-namespace --namespace pizza-pepperoni pizza-pepperoni ./hello-kubernetes/deploy/helm/hello-kubernetes \
  --set ingress.enabled=true \
  --set ingress.pathPrefix="/pizza-pepperoni/" \
  --set service.type="ClusterIP"

```

Use `minikube tunnel` to access `kong-kong-proxy` service!
