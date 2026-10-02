---
title: Getting Started with Docker
description: "Get started with OvenMediaEngine Enterprise using a Docker image."
sidebar_position: 28
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To get started with OvenMediaEngine Enterprise using a Docker image, follow the [installation](getting-started-with-docker.md#installation) steps.

## Installation

### Path

OvenMediaEngine Enterprise is installed in the following path within the Docker container.

<table><thead><tr><th>Type</th><th>Path / Description</th><th data-hidden=""></th></tr></thead><tbody><tr><td>OvenMediaEngine</td><td>/opt/ovenmediaengine/bin</td><td></td></tr><tr><td>Web Console (OvenStudio)</td><td>/opt/ovenmediaengine/ovenstudio</td><td></td></tr><tr><td>Record Delivery</td><td>/opt/ovenmediaengine/delivery</td><td></td></tr><tr><td>Metrics (Prometheus)</td><td>/opt/ovenmediaengine/prometheus<br/>Metrics history is stored under <code>data</code>. Its log goes to container output rather than a file.</td><td></td></tr><tr><td>Logs</td><td>/var/log/ovenmediaengine</td><td></td></tr></tbody></table>

### Install the OvenMediaEngine Enterprise


<Tabs>
<TabItem value="latest-version" label="Latest version">

To install the latest version, run:


```bash
docker pull ovenmedialabs/ovenmediaengine-enterprise
docker tag ovenmedialabs/ovenmediaengine-enterprise ovenmediaengine-enterprise
```


</TabItem>
<TabItem value="latest-gpu-version" label="Latest GPU version">

To install the latest gpu version, run:


```bash
docker pull ovenmedialabs/ovenmediaengine-enterprise:latest-gpu
docker tag ovenmedialabs/ovenmediaengine-enterprise:latest-gpu ovenmediaengine-enterprise
```


</TabItem>
<TabItem value="specific-version" label="Specific version">

To install a specific version of OvenMediaEngine Enterprise, start by listing the available versions in the repository:

```bash
curl -s https://hub.docker.com/v2/repositories/ovenmedialabs/ovenmediaengine-enterprise/tags | grep -oP '"name":\s*"\K[^"]+'

latest
0.20.4.3-1
0.20.4.2-1
0.20.4.1-1
0.20.4.0-1
0.20.3.0-1
```

Select the desired version and install:


```bash
VERSION=0.20.4.3-1
docker pull ovenmedialabs/ovenmediaengine-enterprise:$VERSION
docker tag ovenmedialabs/ovenmediaengine-enterprise ovenmediaengine-enterprise:$VERSION ovenmediaengine-enterprise:$VERSION
```


</TabItem>
</Tabs>


## Run OvenMediaEngine Enterprise via Docker CLI

After the [installation](getting-started-with-docker.md#installation) is complete, you can run OvenMediaEngine Enterprise using the following command:


```sh
docker run -d --name=ovenmediaengine \
-e OME_LICENSE_KEY=<Your.License.Key> \
-e OME_HOST_IP=<Your.HOST.IP.Address> \
-p 1935:1935 -p 8080:8080 -p 9999:9999/udp -p 9000:9000 -p 80:80 -p 3478:3478 -p 10000:10000/udp -p 10000:10000/tcp \
ovenmediaengine-enterprise
```


When running OvenMediaEngine Enterprise, you need to set the following two environment variables:

* `OME_LICENSE_KEY`: If an invalid License Key is entered, the container will not run.
* `OME_HOST_IP`: Setting the IP of the host server ensures smooth streaming and Web Console usage.

How much metrics history the Web Console can chart is set by `OME_PROMETHEUS_RETENTION_TIME` and `OME_PROMETHEUS_RETENTION_SIZE`, 30 days and 5GB by default, whichever is reached first. That history lives inside the container, so mount a volume for it as shown in *Save configurations and data* below — otherwise it is discarded whenever the container is recreated. See [Bundled Prometheus](../../features/operations-and-monitoring/bundled-prometheus.md) for sizing guidance.

### Enabling GPU access

To use an NVIDIA GPU inside the container, you must first install the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) on the host (this requires the NVIDIA driver to already be installed on the host). Then, use the GPU-enabled image (`ovenmedialabs/ovenmediaengine-enterprise:latest-gpu`) and run OvenMediaEngine Enterprise with the `--gpus all` option as shown below. For more detailed configuration instructions, please refer to the [official documentation](https://docs.docker.com/engine/containers/gpu/).

:::note[GPU image requirements]
The GPU image is built with CUDA 13. The host needs an NVIDIA driver from the R580 branch or newer and a Turing (sm_75) or newer GPU; the container runtime refuses to start the image on an older driver. Pascal and Volta GPUs are not supported by CUDA 13. For those GPUs, or for hosts that must stay on an older driver, install the deb or rpm package instead, which is built against CUDA 12 and follows the requirements in [Hardware Acceleration](../../features/transcoding-and-processing/hardware-acceleration.md).
:::


```sh
docker run -d --name=ovenmediaengine \
--gpus all \
-e OME_LICENSE_KEY=<Your.License.Key> \
-e OME_HOST_IP=<Your.HOST.IP.Address> \
-p 1935:1935 -p 8080:8080 -p 9999:9999/udp -p 9000:9000 -p 80:80 -p 3478:3478 -p 10000:10000/udp -p 10000:10000/tcp \
ovenmediaengine-enterprise
```


### Stop and remove the container

```sh
docker ps
CONTAINER ID   IMAGE                        COMMAND                  CREATED         STATUS         PORTS                                                                                                                                                                                                                                                                                                                                                 NAMES
2269946c053e   ovenmediaengine-enterprise   "/opt/ovenmediaengin…"   5 minutes ago   Up 5 minutes   0.0.0.0:1935->1935/tcp, [::]:1935->1935/tcp, 0.0.0.0:80->80/tcp, [::]:80->80/tcp, 443/tcp, 0.0.0.0:3478->3478/tcp, [::]:3478->3478/tcp, 5000/tcp, 0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp, 4000-4005/udp, 8090/tcp, 0.0.0.0:9000->9000/tcp, [::]:9000->9000/tcp, 0.0.0.0:10000->10000/tcp, [::]:10000->10000/tcp, 0.0.0.0:9999->9999/udp, [::]:9999->9999/udp, 0.0.0.0:10000->10000/udp, [::]:10000->10000/udp   ovenmediaengine

docker stop ovenmediaengine
docker rm ovenmediaengine
```

### Save configurations and data

Any changes to the configurations within a running container, log data being recorded, or metrics history collected by the bundled Prometheus will be deleted when the container is stopped and removed. You can use [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/) to persistently save the configurations and data inside the container.

#### Create a host directory


```sh
export OME_DOCKER_HOME=/opt/ovenmediaengine
sudo mkdir -p $OME_DOCKER_HOME/conf
sudo mkdir -p $OME_DOCKER_HOME/logs
sudo mkdir -p $OME_DOCKER_HOME/ovenstudio/data
sudo mkdir -p $OME_DOCKER_HOME/delivery/conf
sudo mkdir -p $OME_DOCKER_HOME/prometheus/data

# Set permissions for the created directory if necessary.
sudo chgrp -R docker $OME_DOCKER_HOME
sudo chmod -R 775 $OME_DOCKER_HOME

# If you want to use OME_DOCKER_HOME permanently, add the following line to the ~/.profile file for bash, for other shells, you can do it accordingly.
echo -e 'export OME_DOCKER_HOME=/opt/ovenmediaengine' >> ~/.profile
source ~/.profile
```


#### Copy the default configurations from the Docker container

After [running](getting-started-with-docker.md#run-ovenmediaengine-enterprise-via-docker-cli) the Docker container, copy the default configurations of OvenMediaEngine Enterprise using the following command:


```sh
# OvenMediaEngine files
docker cp ovenmediaengine:/opt/ovenmediaengine/bin/origin_conf $OME_DOCKER_HOME/

# Web Console(OvenStudio) files
docker cp ovenmediaengine:/opt/ovenmediaengine/ovenstudio/system.env $OME_DOCKER_HOME/ovenstudio/
docker cp ovenmediaengine:/opt/ovenmediaengine/ovenstudio/data $OME_DOCKER_HOME/ovenstudio/

# Delivery files
docker cp ovenmediaengine:/opt/ovenmediaengine/delivery/delivery.db $OME_DOCKER_HOME/delivery/
docker cp ovenmediaengine:/opt/ovenmediaengine/delivery/conf $OME_DOCKER_HOME/delivery/
```

Prometheus has nothing to copy — its scrape configuration is generated at every start from your `Server.xml`, so only the `data` directory created above needs mounting, to keep the metrics history.


### Run using Bind mount

```sh
docker run -d --name=ovenmediaengine \
-e OME_LICENSE_KEY=<Your.License.Key> \
-e OME_HOST_IP=<Your.HOST.IP.Address> \
-v $OME_DOCKER_HOME/origin_conf:/opt/ovenmediaengine/bin/origin_conf \
-v $OME_DOCKER_HOME/logs:/var/log/ovenmediaengine \
-v $OME_DOCKER_HOME/ovenstudio/system.env:/opt/ovenmediaengine/ovenstudio/system.env \
-v $OME_DOCKER_HOME/ovenstudio/data:/opt/ovenmediaengine/ovenstudio/data \
-v $OME_DOCKER_HOME/delivery/delivery.db:/opt/ovenmediaengine/delivery/delivery.db \
-v $OME_DOCKER_HOME/delivery/conf:/opt/ovenmediaengine/delivery/conf \
-v $OME_DOCKER_HOME/prometheus/data:/opt/ovenmediaengine/prometheus/data \
-p 1935:1935 -p 8080:8080 -p 9999:9999/udp -p 9000:9000 -p 80:80 -p 3478:3478 -p 10000:10000/udp -p 10000:10000/tcp \
ovenmediaengine-enterprise
```

## Run OvenMediaEngine Enterprise via Docker Compose

You can utilize Docker Compose to easily define and efficiently deploy containers. For detailed instructions on how to use Docker Compose, refer to this [link](https://docs.docker.com/compose/).

### Create a `docker-compose.yaml` file

```yaml title="docker-compose.yaml"
services:
  ovenmediaengine:
    image: ovenmediaengine-enterprise
    container_name: ovenmediaengine
    restart: unless-stopped
    environment:
      - OME_LICENSE_KEY=<Your.License.Key>
      - OME_HOST_IP=<Your.HOST.IP.Address>
    ports:
      - 1935:1935
      - 8080:8080
      - 9999:9999/udp
      - 9000:9000
      - 80:80
      - 3478:3478
      - 10000:10000/udp
      - 10000:10000/tcp
```

After the [installation](getting-started-with-docker.md#installation) is complete, you can run OvenMediaEngine Enterprise using the following command:

```sh
docker compose up -d

[+] Running 2/2
 ✔ Network root_default       Created              0.1s
 ✔ Container ovenmediaengine  Started              0.8s
```

When running OvenMediaEngine Enterprise, you need to set the following two environment variables:

* `OME_LICENSE_KEY`: If an invalid License Key is entered, the container will not run.
* `OME_HOST_IP`: Setting the IP of the host server ensures smooth streaming and Web Console usage.

How much metrics history the Web Console can chart is set by `OME_PROMETHEUS_RETENTION_TIME` and `OME_PROMETHEUS_RETENTION_SIZE`, 30 days and 5GB by default, whichever is reached first. That history lives inside the container, so mount a volume for it as shown in *Save configurations and data* below — otherwise it is discarded whenever the container is recreated. See [Bundled Prometheus](../../features/operations-and-monitoring/bundled-prometheus.md) for sizing guidance.

### Enabling GPU access

To use an NVIDIA GPU inside the container, you must first install the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) on the host (this requires the NVIDIA driver to already be installed on the host). Then, use the GPU-enabled image (`ovenmedialabs/ovenmediaengine-enterprise:latest-gpu`) and add a `deploy` section to the `docker-compose.yaml` file as shown below. For more detailed configuration instructions, please refer to the [official documentation](https://docs.docker.com/compose/how-tos/gpu-support/).

:::note[GPU image requirements]
The GPU image is built with CUDA 13. The host needs an NVIDIA driver from the R580 branch or newer and a Turing (sm_75) or newer GPU; the container runtime refuses to start the image on an older driver. Pascal and Volta GPUs are not supported by CUDA 13. For those GPUs, or for hosts that must stay on an older driver, install the deb or rpm package instead, which is built against CUDA 12 and follows the requirements in [Hardware Acceleration](../../features/transcoding-and-processing/hardware-acceleration.md).
:::

```yaml title="docker-compose.yaml"
services:
  ovenmediaengine:
    image: ovenmediaengine-enterprise
    container_name: ovenmediaengine
    restart: unless-stopped
    environment:
      - OME_LICENSE_KEY=<Your.License.Key>
      - OME_HOST_IP=<Your.HOST.IP.Address>
    ports:
      - 1935:1935
      - 8080:8080
      - 9999:9999/udp
      - 9000:9000
      - 80:80
      - 3478:3478
      - 10000:10000/udp
      - 10000:10000/tcp
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

### Stop and remove the container

```sh
docker compose down

[+] Running 2/2
 ✔ Container ovenmediaengine  Removed              1.4s
 ✔ Network root_default       Removed              0.2s
```

### Save configurations and data

Any changes to the configurations within a running container, log data being recorded, or metrics history collected by the bundled Prometheus will be deleted when the container is stopped and removed. You can use [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/) to persistently save the configurations and data inside the container.

#### Create a host directory


```sh
export OME_DOCKER_HOME=/opt/ovenmediaengine
sudo mkdir -p $OME_DOCKER_HOME/conf
sudo mkdir -p $OME_DOCKER_HOME/logs
sudo mkdir -p $OME_DOCKER_HOME/ovenstudio/data
sudo mkdir -p $OME_DOCKER_HOME/delivery/conf
sudo mkdir -p $OME_DOCKER_HOME/prometheus/data

# Set permissions for the created directory if necessary.
sudo chgrp -R docker $OME_DOCKER_HOME
sudo chmod -R 775 $OME_DOCKER_HOME

# If you want to use OME_DOCKER_HOME permanently, add the following line to the ~/.profile file for bash, for other shells, you can do it accordingly.
echo -e 'export OME_DOCKER_HOME=/opt/ovenmediaengine' >> ~/.profile
source ~/.profile
```


#### Copy the default configurations from the Docker container

After [running](getting-started-with-docker.md#run-ovenmediaengine-enterprise-via-docker-compose) the Docker container, copy the default configurations of OvenMediaEngine Enterprise using the following command:


```sh
# OvenMediaEngine files
docker cp ovenmediaengine:/opt/ovenmediaengine/bin/origin_conf $OME_DOCKER_HOME/

# Web Console(OvenStudio) files
docker cp ovenmediaengine:/opt/ovenmediaengine/ovenstudio/system.env $OME_DOCKER_HOME/ovenstudio/
docker cp ovenmediaengine:/opt/ovenmediaengine/ovenstudio/data $OME_DOCKER_HOME/ovenstudio/

# Delivery files
docker cp ovenmediaengine:/opt/ovenmediaengine/delivery/delivery.db $OME_DOCKER_HOME/delivery/
docker cp ovenmediaengine:/opt/ovenmediaengine/delivery/conf $OME_DOCKER_HOME/delivery/
```

Prometheus has nothing to copy — its scrape configuration is generated at every start from your `Server.xml`, so only the `data` directory created above needs mounting, to keep the metrics history.


### Run Docker Compose using bind mounts

```yaml title="docker-compose.yaml"
services:
  ovenmediaengine:
    image: ovenmediaengine-enterprise
    container_name: ovenmediaengine
    restart: unless-stopped
    environment:
      - OME_LICENSE_KEY=<Your.License.Key>
      - OME_HOST_IP=<Your.HOST.IP.Address>
    ports:
      - 1935:1935
      - 8080:8080
      - 9999:9999/udp
      - 9000:9000
      - 80:80
      - 3478:3478
      - 10000:10000/udp
      - 10000:10000/tcp
    volumes:
      - $OME_DOCKER_HOME/origin_conf:/opt/ovenmediaengine/bin/origin_conf
      - $OME_DOCKER_HOME/logs:/var/log/ovenmediaengine
      - $OME_DOCKER_HOME/ovenstudio/system.env:/opt/ovenmediaengine/ovenstudio/system.env
      - $OME_DOCKER_HOME/ovenstudio/data:/opt/ovenmediaengine/ovenstudio/data
      - $OME_DOCKER_HOME/delivery/delivery.db:/opt/ovenmediaengine/delivery/delivery.db
      - $OME_DOCKER_HOME/delivery/conf:/opt/ovenmediaengine/delivery/conf
      - $OME_DOCKER_HOME/prometheus/data:/opt/ovenmediaengine/prometheus/data
```

```sh
docker compose up -d

[+] Running 2/2
 ✔ Network root_default       Created              0.1s
 ✔ Container ovenmediaengine  Started              0.8s
```

## Ports used by default

The default configuration uses the following ports, so you need to open it in your firewall settings:

### OvenMediaEngine

<table><thead><tr><th width="200">Port</th><th>Purpose</th></tr></thead><tbody><tr><td>1935/TCP</td><td>RTMP Input</td></tr><tr><td>9999/UDP</td><td>SRT Input</td></tr><tr><td>4000/UDP</td><td>MPEG-2 TS Input</td></tr><tr><td>9000/TCP</td><td>Origin Server (OVT)</td></tr><tr><td><p>80/TCP</p><p>443/TLS</p></td><td><p>Low Latency HLS (LLHLS) Streaming</p><p><em>* Streaming over non-TLS is not allowed with modern browsers.</em></p></td></tr><tr><td><p>80/TCP</p><p>443/TLS</p></td><td>WebRTC Signaling (both ingest and streaming)</td></tr><tr><td>3478/TCP</td><td>WebRTC TCP relay (TURN Server, both ingest and streaming)</td></tr><tr><td><p>10000/UDP</p><p>10000/TCP</p></td><td>WebRTC Ice candidate (both ingest and streaming)</td></tr><tr><td><p>80/TCP</p><p>443/TLS</p></td><td>Thumbnail Extraction</td></tr></tbody></table>

### Web Console (OvenStudio)

<table><thead><tr><th width="200">Port</th><th>Purpose</th></tr></thead><tbody><tr><td>8080/TCP</td><td>Web Console (HTTP)</td></tr><tr><td>8443/TCP</td><td>Web Console (HTTPS)</td></tr></tbody></table>

## Next Steps

OvenMediaEngine Enterprise is now running. Here are the suggested next steps:

- [Your First Streaming](./getting-started-first-streaming.md): Publish a live stream and verify playback.
- [Going Secure with TLS](./getting-started-tls-configuration.md): Enable HTTPS for secure WebRTC and HLS playback in browsers.
- [Adaptive Bitrate Streaming](./getting-started-abr.md): Configure adaptive bitrate streaming for multiple quality renditions.
