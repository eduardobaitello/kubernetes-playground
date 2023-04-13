# istio-mesh
A playground running Minikube + Istio and a demo application running on mesh.

## Requirements
- kubectl
- istioctl
- minikube

*All versions covererd in the `.tools-versions` file.*

## Environment
Use the following to start Minikube:
```bash
minikube start --kubernetes-version=v1.25.8 --service-cluster-ip-range=172.16.0.0/16 --memory="6g" --cpus="4"
```

## Installing Istio

## Istio Core
Install IstioD, ingress and egress gateways:
```bash
istioctl install --set profile=demo -y
```

Add a namespace label to instruct Istio to automatically inject Envoy sidecar proxies:
```bash
kubectl label namespace default istio-injection=enabled
```


## Addons
Install [Addons](https://github.com/istio/istio/tree/release-1.16/samples/addons): Grafana, Kiali, Jaeger and Prometheus
```bash
kubectl apply -f addons/
```

Check if everything is running and ready:
```text
$ kubectl get pods -n istio-system
NAME                                    READY   STATUS    RESTARTS        AGE
grafana-56bdf8bf85-zrvqp                1/1     Running   0               2m16s
istio-egressgateway-c58dd6466-wvz9p     1/1     Running   1 (6m13s ago)   64m
istio-ingressgateway-57c484dcb8-bj2d6   1/1     Running   1 (6m13s ago)   64m
istiod-85d7df6df7-kbfc9                 1/1     Running   1 (6m13s ago)   64m
jaeger-c4fdf6674-4fzhp                  1/1     Running   0               2m14s
kiali-849958788-jvpqk                   1/1     Running   0               2m11s
prometheus-85949fddb-qbfmd              2/2     Running   0               2m10s
```

### Addons access
```
istioctl dashboard <addon> -n istio-system
```

Addon may be: `grafana`, `prometheus`, `kiali` or `jaeger`.

See [Installation Configuration Profiles](https://istio.io/latest/docs/setup/additional-setup/config-profiles/).

## Deploying demo application

Demo application are adaptations from the the following project: https://github.com/DickChesterwood/istio-fleetman

### 01-no-istio-crds

Full working application, without VirtualServices and DestionationRules.

Go to http://$MINIKUBE_IP:30080

``` bash
kubectl apply -f istio-fleetman/01-no-istio-crds/01-manifests.yaml
```

- See traffic on Kiali.
- See tracings on Jaeger.

### 02-no-istio-crds-bodge-canary

Still no Istio CRDs, but with two staff-service deployments using different replicas counts.

```bash
kubectl apply -f istio-fleetman/02-no-istio-crds-bodge-canary/01-manifests.yaml
```

- See traffic balancing between 2 versions from staff-service. A bad canary based only on replicas count.
  - Note the `version` labels.
- Use Kiali to manipulatate traffic (i.e., create VirtualServices and DestionationRules).
  - Use Actions to suspend the staff-service traffic. See erros in the webpapp.
  - Use Kiali to create a weighted routing (only 10% place holders, for example).

You may want to use curl to test the weightig properly:
```bash
MINIKUBE_IP=$(minikube ip)
while true; do curl "http://${MINIKUBE_IP}:30080/api/vehicles/driver/City%20Truck"; sleep 0.5; echo; done
```

Try to understand: What are VirtualServices for?
