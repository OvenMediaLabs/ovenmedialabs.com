---
title: Hardware Acceleration
description: "Enable hardware-accelerated video encoding in OvenMediaEngine Enterprise automatically with the RPM/DEB packages."
enterprise_only: true
sidebar_position: 93
---

When you install OvenMediaEngine Enterprise with the distributed RPM/DEB package, hardware-accelerated video encoding is enabled automatically if a **hardware-acceleration-capable device** and its driver are present. Drivers can be reinstalled, updated, or removed after installation without affecting program execution. This section describes the supported versions and codecs, along with the methods for installing and verifying the drivers.

## Supported OS, Drivers, and Codecs

| Device | Support OS | Driver Version | Decoder | Encoder |
| --- | --- | --- | --- | --- |
| NVIDIA | Ubuntu 22.04 / 24.04 / 26.04, Rocky 9 | Driver 535+ | H.264, H.265, AV1 (Ampere+) | H.264, H.265, AV1 (Ada Lovelace+) |
| Xilinx Alveo U30MA | Ubuntu 22.04 / 24.04 | Video SDK 3.0 | H.264, H.265 | H.264, H.265 |
| NETINT Quadra VPU | Ubuntu 22.04 / 24.04 / 26.04, Rocky 9 | libxcoder V5.7.0+ (Quadra Release SW) | H.264, H.265 | H.264, H.265, AV1 |

:::note
On NVIDIA, AV1 support depends on the GPU generation: **decoding requires Ampere or newer** (except A100/A30) and **encoding requires Ada Lovelace or newer**. So an Ampere GPU can decode AV1 but cannot encode it.

On NETINT Quadra, AV1 is **encode-only** — there is no AV1 hardware decoding.

When a device cannot handle AV1, it falls back to the software codec.
:::

## Driver Installation

### NVIDIA Graphics Driver

The contents of this section are based on the `misc/install_nvidia_driver.sh` script provided by OvenMediaEngine as Open-Source. The minimum required version is **NVIDIA Driver 535**. The CUDA Toolkit does not need to be installed separately, as OvenMediaEngine includes the CUDA runtime it requires. If installation issues arise, please refer to the [Official NVIDIA Documentation](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#package-manager-installation).

#### Ubuntu Linux 22.04 / 24.04 / 26.04

```bash
# Install prerequisites
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
    apt-utils ca-certificates curl gnupg2 lshw \
    software-properties-common ubuntu-drivers-common

# Uninstall any previously installed NVIDIA driver and CUDA Toolkit packages
sudo apt-get remove -y --purge 'nvidia-*' 'cuda-*' 'libnvidia-*' 'nsight-*'
sudo apt-get autoremove -y

# Disable the nouveau driver if it is loaded (a reboot is required afterwards)
if lsmod | awk '{print $1}' | grep -qx nouveau; then
    sudo tee /etc/modprobe.d/blacklist-nouveau.conf > /dev/null <<EOF
blacklist nouveau
blacklist lbm-nouveau
options nouveau modeset=0
alias nouveau off
alias lbm-nouveau off
EOF
    sudo update-initramfs -u
    echo "nouveau disabled. Reboot and re-run this script to continue."
    exit 0
fi

# Register the official NVIDIA CUDA repository
# Replace 'ubuntu2204' with 'ubuntu2404' or 'ubuntu2604' to match your release.
# cuda-keyring installs the signing key, the repository entry and the apt pin at
# once. Ubuntu 26.04 requires it: apt 3.x no longer ships apt-key, and NVIDIA
# does not publish the legacy 3bf863cc.pub key under repos/ubuntu2604.
REPO_DIST=ubuntu2204
REPO_BASE=https://developer.download.nvidia.com/compute/cuda/repos/${REPO_DIST}/x86_64
curl -fsSLo cuda-keyring.deb ${REPO_BASE}/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring.deb
rm -f cuda-keyring.deb
sudo apt-get update

# Install the NVIDIA driver
sudo apt-get install -y --no-install-recommends nvidia-driver-535
```

:::note

On Ubuntu 26.04 `nvidia-driver-535` is a transitional package that installs the 580 series. That is fine: the requirement is driver 535 or newer, and the CUDA runtime OvenMediaEngine needs is bundled in the package.

:::

#### Rocky Linux 9

```bash
# Install prerequisites
sudo dnf update -y
sudo dnf install -y epel-release dnf-plugins-core lshw

# Uninstall any previously installed NVIDIA driver and CUDA Toolkit packages
sudo dnf remove -y 'nvidia-driver*' 'cuda*' 'libnvidia*' 'nsight*'
sudo dnf module reset -y nvidia-driver
sudo dnf clean all

# Disable the nouveau driver if it is loaded (a reboot is required afterwards)
if lsmod | awk '{print $1}' | grep -qx nouveau; then
    sudo tee /etc/modprobe.d/blacklist-nouveau.conf > /dev/null <<EOF
blacklist nouveau
options nouveau modeset=0
EOF
    sudo dracut --force
    echo "nouveau disabled. Reboot and re-run this script to continue."
    exit 0
fi

# Register the official NVIDIA CUDA repository
OS_MAJOR=9
REPO_BASE=https://developer.download.nvidia.com/compute/cuda/repos/rhel${OS_MAJOR}/x86_64
sudo dnf config-manager --add-repo=${REPO_BASE}/cuda-rhel${OS_MAJOR}.repo
sudo dnf clean all

# Install the NVIDIA driver
sudo dnf module install -y nvidia-driver:535
```

#### Install and Check the Driver

```
# nvidia-smi 
Wed Jul  3 23:30:00 2024       
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.183.01   Driver Version: 535.183.01   CUDA Version: 12.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ...  Off  | 00000000:0A:00.0 Off |                  N/A |
| 55%   33C    P8    10W / 120W |      2MiB /  3018MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+                                                                  
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
```

### XILINX Video SDK Driver

The Xilinx Video SDK 3.0 driver officially supports Ubuntu, Red Hat Linux 7.8, and Amazon Linux 2. For detailed information, please refer to the [Official Xilinx Documentation](https://xilinx.github.io/video-sdk/v3.0/getting_started_on_prem.html#install-the-sdk).

### NETINT Quadra Driver

NETINT Quadra VPU support is built on NETINT's native `libxcoder` library from the official **Quadra Release SW** package. Unlike the NVIDIA driver, OvenMediaEngine does **not** bundle or install the NETINT driver — the Quadra kernel driver and `libxcoder` (**V5.7.0 or later**) must be installed beforehand, following the NETINT Quadra Release SW documentation for your OS.

OvenMediaEngine loads `libxcoder.so` at runtime via `dlopen()` rather than linking it at build time. As a result, the same OvenMediaEngine Enterprise package runs on hosts with or without a Quadra card: when `libxcoder.so` or a card is absent, the NETINT backend simply reports zero devices and OvenMediaEngine falls back to another accelerator or the software codec.

After installing the Quadra Release SW, verify the card and driver with the tools that ship with `libxcoder` (installed under `/usr/local/bin`):

```bash
# List detected Quadra cards (GUID / model / firmware revision / device path)
$ ni_rsrc_list

# Real-time per-card view: LOAD / running instances / memory / temperature / power
$ ni_rsrc_mon
```



## Verify Hardware Acceleration

Once the RPM/DEB package and driver installation are complete, you need to verify that the drivers are correctly loaded and the Hardware-Accelerated Video Encoding is activated in OvenMediaEngine. This can be checked through the OvenMediaEngine's Log files.

```bash
$ cd /var/log/ovenmediaengine
$ cat ovenmediaengine.log | grep transcoder_gpu

[OvenMediaEngine:1234] TAG| transcoder_gpu.cpp:55   | Trying to check available hardware accelerators
[OvenMediaEngine:1234] TAG| transcoder_gpu.cpp:278  | NVIDIA. DeviceId(0), Name(NVIDIA GeForce GTX 1060 3GB), BusId(10), CudaId(0)
[OvenMediaEngine:1234] TAG| transcoder_gpu.cpp:60   | Supported NVIDIA accelerator. Number of devices(1)
[OvenMediaEngine:1234] TAG| transcoder_gpu.cpp:70   | No supported Xilinx Media accelerator
[OvenMediaEngine:1234] TAG| transcoder_gpu.cpp:490  | NETINT(QUADRA). DeviceId(0), GUID(0), Model(Quadra T1A), FwRev(590A)
[OvenMediaEngine:1234] TAG| transcoder_gpu.cpp:81   | Supported Netint VPU accelerator. Number of devices(1)
```

## Configuration

:::info[Enterprise-only configuration]
The `<HWAccels>` configuration is an **OvenMediaEngine Enterprise** feature. In the Open-Source edition this option is **deprecated** and has been removed from the sample configuration files (`Server.xml`, `Origin.xml`) and the Transcode WebHook (`hwaccels`) schema. Use the `<HWAccels>` block shown below with OvenMediaEngine Enterprise (`EnterpriseServer.xml`).
:::

To use hardware acceleration, add the `<HWAccels>` section under `<OutputProfiles>` and set `<Enable>` to `true` for the `<Decoder>` and/or `<Encoder>`. If a hardware codec is unavailable due to insufficient resources, it automatically falls back to a software codec.

```markup
<OutputProfiles>
    <HWAccels>
        <!-- 
        Setting for Hardware Modules.
            - nv : Nvidia Video Codec SDK
            - xma : Xilinx Media Accelerator
            - ni : Netint Quadra VPU

        You can use multiple modules by separating them with commas.
        For example, if you want to use xma and nv, you can set it as follows.

        <Modules>[ModuleName]:[DeviceId],[ModuleName]:[DeviceId],...</Modules>
        <Modules>nv:0,nv:1,xma:0</Modules>
        -->
        <Decoder>
                <Enable>true</Enable>
                <Modules>nv</Modules>
        </Decoder>
        <Encoder>
                <Enable>true</Enable>
                <Modules>nv</Modules>
        </Encoder>
    </HWAccels>
    
    <OutputProfile>
        ...
    </OutputProfile>
</OutputProfiles>
```

### Set Modules per Encode

The `<Modules>` in `<HWAccels>` applies to every encode. To use a different module or device for a specific encode, add `<Modules>` inside that `<Video>`. This value overrides the one in `<HWAccels>`.

Use the `[ModuleName]:[DeviceId]` format, and separate multiple modules with commas. They are tried in order, and the software codec is used if none are available.

```markup
<OutputProfile>
    <Encodes>
        <!-- Encode on NVIDIA device 0 -->
        <Video>
            <Modules>nv:0</Modules>
            ...
        </Video>
        <!-- Encode on NVIDIA device 1 -->
        <Video>
            <Modules>nv:1</Modules>
            ...
        </Video>
        <!-- Encode on NETINT Quadra card 0 -->
        <Video>
            <Modules>ni:0</Modules>
            ...
        </Video>
    </Encodes>
</OutputProfile>
```

## Experiments

:::warning[Experimental]
The options in this section are experimental. They may change or be removed in a future release, so use them with care in production.
:::

### CUDA Stream Priority

`<CUDAStreamPriority>` raises or lowers the scheduling priority of the CUDA stream that OvenMediaEngine's transcoding pipeline (decoding, scaling, overlay) runs on, so its GPU work can be scheduled ahead of other work on the same device. The value is resolved against each GPU's own priority range and applies to all NVIDIA GPUs.

| Value | Meaning |
| --- | --- |
| *(unset)* | Keep the driver default. |
| `lo` | Each device's lowest priority. |
| `hi` | Each device's highest priority. |

Add it under `<Server>` → `<Modules>`:

```markup
<Modules>
    <CUDAStreamPriority>hi</CUDAStreamPriority>
</Modules>
```

On startup, the applied priority is logged per device:

```
[experimental] Set CUDA stream priority: 0 -> -5 (range low=0, high=-5)
```

## Reference

* NVIDIA Driver Installation Guide : [https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#package-manager-installation](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#package-manager-installation)
* NVIDIA Video Encode and Decode GPU Support Matrix (per-model codec support) : [https://developer.nvidia.com/video-encode-and-decode-gpu-support-matrix-new](https://developer.nvidia.com/video-encode-and-decode-gpu-support-matrix-new)
* Xilinx Video SDK Installation Guide : [https://xilinx.github.io/video-sdk/v3.0/getting_started_on_prem.html#install-the-sdk](https://xilinx.github.io/video-sdk/v3.0/getting_started_on_prem.html#install-the-sdk)
* NVIDIA Container Toolkit Installation Guide : [https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)
* NETINT SDK Installation Guide : [https://docs.netint.com/vpu/quadra/installation/ffmpeg/ffmpeg-scripted-installation](https://docs.netint.com/vpu/quadra/installation/ffmpeg/ffmpeg-scripted-installation)
