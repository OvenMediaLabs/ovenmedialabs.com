---
title: Getting Started with Linux
description: "Get started with OvenMediaEngine Enterprise on Linux — prerequisites and installation."
sidebar_position: 27
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To get started with OvenMediaEngine Enterprise on Linux, check the [Prerequisites](getting-started-with-linux.md#prerequisites) below and then follow the [Installation](getting-started-with-linux.md#installation).

## Prerequisites

### OS requirements

To install OvenMediaEngine Enterprise, you need one of the following Linux versions:

* Ubuntu 26.04 LTS
* Ubuntu 24.04 LTS
* Ubuntu 22.04 LTS
* RHEL 9
* RHEL 8

### Disk space

Installing takes about **3.2GB** of free space: roughly 1.6GB under `/usr`, 750MB under `/opt`, and 800MB for the downloaded package, which the package manager caches under `/var`. On most systems these share one filesystem, so plan for the total.

Upgrades need the same amount. The new files are unpacked before the old ones are removed, so the peak is close to a fresh install even though little is added.

Set aside additional space for the metrics history collected by the [bundled Prometheus](../../features/operations-and-monitoring/bundled-prometheus.md) — up to 5GB by default, and adjustable.

The installation script checks all of this before it starts and stops with a clear message if any filesystem is short.

## Location

By default, OvenMediaEngine Enterprise is installed in the following locations:

* **Binary\&Config**: `/usr/share/ovenmediaengine`
* **Dependencies**: `/opt/ovenmediaengine`
* **Log**: `/var/log/ovenmediaengine`
* **Metrics data**: `/usr/share/ovenmediaengine/prometheus/data`

## Installation

### Automatic download and installation

OvenMediaEngine Enterprise can be easily installed with a single command using the installation script.

#### Download the installation script


```bash
curl -fsSL https://packages.ovenmediaengine.cloud/scripts/install-ovenmediaengine-enterprise.sh -o install-ovenmediaengine-enterprise.sh && chmod +x install-ovenmediaengine-enterprise.sh
```


#### Install or upgrade OvenMediaEngine Enterprise


<Tabs>
<TabItem value="latest" label="Latest">

#### \[Install]

For the initial installation, run the installation script with a valid license key provided as a parameter.


```bash
sudo ./install-ovenmediaengine-enterprise.sh -k 'Your.License.Key'
```


#### \[Upgrade]

To upgrade to the latest version, simply run the installation script without providing a license key.


```bash
sudo ./install-ovenmediaengine-enterprise.sh
```


</TabItem>
<TabItem value="specific-version" label="Specific version">

To install a specific version of OvenMediaEngine Enterprise, start by listing the available versions in the repository:

```sh
sudo ./install-ovenmediaengine-enterprise.sh --list
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   OvenMediaEngine Enterprise — Installer  v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✔  Detected OS: ubuntu 24.04 (family: debian)

▶ Available versions
  ℹ  Fetching available versions from apt repository...

    1  0.20.5.1-2
    2  0.20.4.3-1
    3  0.20.4.2-1
    4  0.20.4.1-1
    5  0.20.4.0-1
    6  0.20.3.0-1

  ℹ  Install a specific version with: -v <VERSION>
```

Select the desired version and install:

```sh
VERSION=0.20.4.3-1
sudo ./install-ovenmediaengine-enterprise.sh -k 'Your.License.Key' -v $VERSION
```

</TabItem>
</Tabs>


#### Uninstall OvenMediaEngine Enterprise

To uninstall, use the following command:

```bash
sudo ./install-ovenmediaengine-enterprise.sh --uninstall
```

### Install from a package

#### Package Download

OvenMediaEngine Enterprise is also provided as packages in `.deb` and `.rpm` formats. If you have received a download link for the package files from the OME Enterprise team, please download the files and follow the instructions below to install and run them.

#### Download the installation script


```bash
curl -fsSL https://packages.ovenmediaengine.cloud/scripts/install-ovenmediaengine-enterprise.sh -o install-ovenmediaengine-enterprise.sh && chmod +x install-ovenmediaengine-enterprise.sh
```


#### Install from a package

Move to the directory where the package was downloaded, and then install OvenMediaEngine Enterprise:


```bash
sudo ./install-ovenmediaengine-enterprise.sh -k 'Your.License.Key' -f <ovenmediaengine-enterprise-package-file>
```


#### Uninstall OvenMediaEngine Enterprise

To uninstall, use the following command:

```bash
sudo ./install-ovenmediaengine-enterprise.sh --uninstall
```

### Start/Stop OvenMediaEngine Enterprise

You can start or stop the services by running the following command:

```bash
# Start OvenMediaEngine
sudo systemctl stop ovenmediaengine
sudo systemctl start ovenmediaengine

# Start Web Console (OvenStudio)
sudo systemctl stop ovenstudio
sudo systemctl start ovenstudio

# Start OvenMediaEngine Delivery Module
sudo systemctl stop ovenmediaengine-delivery
sudo systemctl start ovenmediaengine-delivery

# Start the metrics collector (Prometheus)
sudo systemctl stop ovenmediaengine-prometheus
sudo systemctl start ovenmediaengine-prometheus
```

## Post-installation Configuration

### Changing the License Key

If the license key was entered incorrectly or needs to be changed, you can update it using the command below.


```bash
sudo ./install-ovenmediaengine-enterprise.sh -c -k 'Your.License.Key'
```


### Changing the Host Address

The host address can be changed if you need to update the value automatically configured during installation, or if a domain configuration is required to enable TLS.


```bash
sudo ./install-ovenmediaengine-enterprise.sh -c -H 'Your.Host.Address'
```

:::info

In private network or VPN environments, setting the Host Address explicitly ensures that the Web Console displays accurate ingest and playback URLs.

:::

### Metrics History

The Web Console charts how your server has behaved over time using the [bundled Prometheus](../../features/operations-and-monitoring/bundled-prometheus.md), which starts with the other services and needs no setup — it reads the API port and access token from your `Server.xml`.

Two defaults are worth reviewing: it keeps **30 days** of history and stops at **5GB** of disk, whichever comes first. On a busy server the size limit is reached first, which shortens the window you can chart. Adjust both in `/usr/share/ovenmediaengine/prometheus/system.env`:

```bash
OME_PROMETHEUS_RETENTION_TIME=30d
OME_PROMETHEUS_RETENTION_SIZE=20GB
```

These are start-up flags, so restart the service to apply them:

```bash
sudo systemctl restart ovenmediaengine-prometheus
```

See [Bundled Prometheus](../../features/operations-and-monitoring/bundled-prometheus.md) for disk sizing per server size and the full list of settings.

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
