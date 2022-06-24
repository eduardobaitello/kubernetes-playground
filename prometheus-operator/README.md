# prometheus-operator
Prometheus Operator adapted for running on Minikube

## Requirements
- kubectl
- minikube
- helm

*All versions covererd in the `.tools-versions` file.*

## Environment
Use the following to start Minikube:
```bash
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
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install --create-namespace prometheus-operator prometheus-community/kube-prometheus-stack -n prometheus-operator --values values.yaml --version 36.0.2
```

### Upgrade Prometheus Operator Release

To upgrade the existing release:
```bash
helm upgrade prometheus-operator prometheus-community/kube-prometheus-stack -n prometheus-operator --values values.yaml
```

### Uninstall Prometheus Operator Release

When unninstalling this release, make sure to remove the respective webhooks, otherwise new installations will fail:
```
kubectl delete validatingwebhookconfiguration prometheus-operator-kube-p-admission

kubectl delete mutatingwebhookconfiguration prometheus-operator-kube-p-admission
```

## Installing sample application

The [hello-kubernetes](https://github.com/eduardobaitello/hello-kubernetes) is instrumented, and has a `serviceMonitor` that can be deployed with:
```bash
git clone git@github.com:eduardobaitello/hello-kubernetes.git

helm install --create-namespace --namespace hello-kubernetes hello-kubernetes ./hello-kubernetes/deploy/helm/hello-kubernetes \
  --set serviceMonitor.enabled=true
```

### Endpoints

You can use `minikube tunnel` to access to `LoadBalancer` service. If sucessufl, an `EXTERNAL-IP` should be avaliable:
```
main(minikube:hello-kubernetes)$ kubectl get service
NAME                                TYPE           CLUSTER-IP       EXTERNAL-IP      PORT(S)        AGE
hello-kubernetes-hello-kubernetes   LoadBalancer   172.16.247.186   172.16.247.186   80:32156/TCP   5m48s
```

The supported endpoints from this application are [documented here](https://github.com/eduardobaitello/hello-kubernetes/tree/main/src/app#paths).

### Metrics

The aplication is instrumented with default NodeJS metrics provided by `prom-client` library.

Also, there is a `Histogram` metric defined with the following bucket lenghts:
```javascript
const httpRequestTimer = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});
```

The following metrics are expected to be exported o `/metrics` endpoint:
```
http_request_duration_seconds_bucket
http_request_duration_seconds_sum
http_request_duration_seconds_count
```

### Querying

You can access the Prometheus UI by port-forwarding its service:
```
kubectl port-forward  -n prometheus-operator svc/prometheus-operated 9090
```

Then go to http://localhost:9090/graph

Here are some PromQL examples:

- `topk(5, http_request_duration_seconds_sum)`
  - Top 5 largest HTTP requests
- `sum (http_request_duration_seconds_count)`
  - Sum of all HTTP requests
- `sum by (pod) (http_request_duration_seconds_count)`
  - Sum of HTTP requestes, aggregated by `pod`
- `sum by (method,path) (http_request_duration_seconds_count)`
  - Sum of HTTP requestes, aggregated by `method` and `path`
- `(100 * sum (http_request_duration_seconds_count{code=~"^5.."})) / sum (http_request_duration_seconds_count)`
  - Percentage of requests with `5xx` status code
- `rate(http_request_duration_seconds_count[2m])`
  - Per-second rate of HTTP requests (2 minutes)
- `rate(http_request_duration_seconds_count{code="200"}[2m])`
  - Per-second rate of HTTP requests (2 minutes)
  - Only for requests with `200` status code.
- `rate(http_request_duration_seconds_count[2m])`
  - Per-second rate of HTTP requests (2 minutes)
- `increase(http_request_duration_seconds_count[2m])`
  - Number of HTTP requests as measured over the last 2 minutes
- `sum(rate(http_request_duration_seconds_count[2m]))`
  - Per-second rate of HTTP requests (2 minutes)
  - Aggreates everything
- `sum by (pod) (rate(http_request_duration_seconds_count[2m]))`
  - Per-second rate of HTTP requests (2 minutes)
  - Aggregated by `pod`
- `histogram_quantile(0.9, rate(http_request_duration_seconds_bucket[10m]))`
  - 90th percentile of request durations over the last 10 minutes
- `histogram_quantile(0.9, sum by (method, le) (rate(http_request_duration_seconds_bucket[10m])))`
  - 90th percentile of request durations over the last 10 minutes
  - Aggregated by `method`
- `histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[10m])))`
  - 99th percentile of request durations over the last 10 minutes
  - Aggregates everything
