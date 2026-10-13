---
title: Speech-to-Text on NVIDIA GPUs
description: "Run real-time speech-to-text on NVIDIA GPUs with OvenMediaEngine Enterprise, alongside or instead of CPU transcription."
enterprise_only: true
sidebar_position: 97
---

OvenMediaEngine Enterprise runs [Realtime Speech-to-Text](./realtime-speech-to-text.md) on NVIDIA GPUs as well as on the CPU. This page describes which device a rendition runs on and what changes when it is a GPU. The Realtime Speech-to-Text page describes a build without GPU support, so where it calls a rendition's `<Modules>` deprecated and a preload's `<Devices>` ignored, this page replaces it; everything else on that page applies as it is.

Transcription on a GPU is much faster than on the CPU, so one GPU can keep up with several streams using a large model (`ggml-medium.bin`, `ggml-large-v3.bin`) where the CPU would fall behind. The device is chosen per rendition, so CPU and GPU renditions can be mixed on one server.

## Which Device a Rendition Runs On

| `<STT><Rendition><Modules>` | Device |
| --- | --- |
| not set | NVIDIA device 0 when the server has one, otherwise the CPU |
| `nv:0`, `nv:1`, ... | that NVIDIA device |
| `nv` | the first available NVIDIA device |
| `default` | the CPU (`default` is the module name OvenMediaEngine uses for its software codecs) |

A rendition without `<Modules>` uses the GPU whenever the server has one, and the same configuration runs on the CPU on a server that has none, so one `Server.xml` works on both. This default does not consult `<HWAccels>`: a rendition with no `<Modules>` uses the GPU even on a server where hardware acceleration is turned off for video. To keep a rendition on the CPU of a server that has a GPU, give it `<Modules>default</Modules>`.

Several NVIDIA entries can be listed and are tried in order, as on a video encode: `nv:1,nv:0` uses device 1 and falls back to device 0 when device 1 is not available. A list that mixes NVIDIA entries with `default` is rejected; choose one kind per rendition.

`nv:N` and `nv` are honoured only while hardware acceleration is enabled (`<HWAccels><Encoder><Enable>true</Enable>` in `<OutputProfiles>`), exactly like `<Modules>` on a video encode, and unlike the no-`<Modules>` default above. An explicit NVIDIA device that is not available (HWAccels disabled, or no such device) is an error: the rendition is not created and the reason is logged. It does not fall back to the CPU or to another GPU on its own; only the default (no `<Modules>`) falls back to the CPU, and only when the server has no NVIDIA device at all.

```xml
<OutputProfiles>
    <HWAccels>
        <Encoder>
            <Enable>true</Enable>
            <Modules>nv</Modules>
        </Encoder>
    </HWAccels>
    <MediaOptions>
        <STT>
            <Enable>true</Enable>
            <!-- Korean STT: GPU 0 on a GPU server, the CPU elsewhere -->
            <Rendition>
                <Engine>whisper</Engine>
                <Model>whisper_model/ggml-medium.bin</Model>
                <InputAudioIndex>0</InputAudioIndex>
                <OutputSubtitleLabel>Korean</OutputSubtitleLabel>
                <SourceLanguage>ko</SourceLanguage>
            </Rendition>
            <!-- Japanese STT on GPU 1 -->
            <Rendition>
                <Engine>whisper</Engine>
                <Model>whisper_model/ggml-large-v3.bin</Model>
                <InputAudioIndex>0</InputAudioIndex>
                <OutputSubtitleLabel>Japanese</OutputSubtitleLabel>
                <SourceLanguage>ja</SourceLanguage>
                <Modules>nv:1</Modules>
            </Rendition>
            <!-- English translation on the CPU -->
            <Rendition>
                <Engine>whisper</Engine>
                <Model>whisper_model/ggml-small.bin</Model>
                <InputAudioIndex>0</InputAudioIndex>
                <OutputSubtitleLabel>English</OutputSubtitleLabel>
                <SourceLanguage>ko</SourceLanguage>
                <Translation>true</Translation>
                <ThreadCount>4</ThreadCount>
                <Modules>default</Modules>
            </Rendition>
        </STT>
    </MediaOptions>
    ...
</OutputProfiles>
```

`<Modules><Whisper><MaxThreads>` is the thread budget of the renditions that run on the CPU; they share it among themselves. A GPU rendition is outside that budget, the way a video encode on a GPU is: it neither takes a share nor shrinks anybody else's, and the short CPU work around its inference (audio conversion, tokenizer) is bounded by the rendition's own `<ThreadCount>` only.

## Requirements for the GPU

* An NVIDIA GPU with its driver installed, as described in [Hardware Acceleration](../hardware-acceleration.md). The driver requirements are the same as for hardware-accelerated video encoding; no CUDA Toolkit needs to be installed on the server, the Enterprise package carries what it needs.
* With the Docker image, start the container with `--gpus all` (or the devices you want to expose) as described in [Getting Started with Docker](../../../pre-built-package-installation/getting-started/getting-started-with-docker.md).

## Preloading Models

A model is loaded once per device. The first stream that uses a device loads the model onto it, which takes a few seconds for a large model on a GPU. To avoid that delay, preload the model with `<Modules><Whisper><PreloadModel>`; `<Devices>` picks the devices with the same rules as a rendition's `<Modules>`:

| `<PreloadModel><Devices>` | Device |
| --- | --- |
| not set | NVIDIA device 0 when the server has one, otherwise the CPU |
| `0`, `0,1`, ... | those NVIDIA devices, in the same numbering as `<Modules>nv:N</Modules>` |
| `all` | every NVIDIA device; use it on its own, not combined with other values |
| `cpu` | the CPU; it can be combined with device indices (`0,cpu`) |

```xml
<Modules>
    <Whisper>
        <Enable>true</Enable>
        <MaxThreads>8</MaxThreads>
        <!-- GPU 0 on a GPU server, the CPU elsewhere -->
        <PreloadModel>
            <Path>whisper_model/ggml-medium.bin</Path>
        </PreloadModel>
        <!-- GPU 0 and GPU 1 -->
        <PreloadModel>
            <Path>whisper_model/ggml-large-v3.bin</Path>
            <Devices>0,1</Devices>
        </PreloadModel>
        <!-- every NVIDIA device -->
        <PreloadModel>
            <Path>whisper_model/ggml-small.bin</Path>
            <Devices>all</Devices>
        </PreloadModel>
        <!-- the CPU, for renditions with <Modules>default</Modules> -->
        <PreloadModel>
            <Path>whisper_model/ggml-small.bin</Path>
            <Devices>cpu</Devices>
        </PreloadModel>
    </Whisper>
</Modules>
```

A model that is used both on a GPU and on the CPU needs one entry for each, as `ggml-small.bin` above. A device index that does not exist is skipped with a warning; if none of the listed devices exist, the model is preloaded for the CPU instead. A rendition whose device has no preloaded context loads the model on demand.

The device numbers are the ones OvenMediaEngine assigns to the NVIDIA devices at start-up and writes to the log. When a device fails to initialize, `<Devices>` can still preload the devices after it while `<Modules>nv:N</Modules>` cannot select them, so check the start-up log and preload only the devices your renditions can reach.

## GPU Memory

A GPU context holds the model weights plus the working buffers of every stream using it. Before a model is loaded onto a GPU, OvenMediaEngine checks that the device has free memory of at least twice the model file size, and before each stream is added it checks that the memory one stream was measured to need is still free. Memory claimed by a load in progress or by a stream that has not run its first inference yet counts as taken, so concurrent streams cannot be admitted against the same free memory. When a check fails, the stream's subtitle rendition is not created and the reason is logged.

What one stream costs depends on the model; the measured figure is logged once when the model is loaded onto a GPU (`Whisper state memory cost on GPU 0: ... MiB per instance`). Use it, together with the model file size, to decide how many streams a GPU can take.

The figure is measured from how much of the device's memory one stream takes during a warmup, so it is reliable only while nothing else on that GPU allocates or releases memory at the same moment. When another user of the device (video encoding on the same card, or another process) moves the free memory during the warmup, the measurement is discarded and the model is not loaded, because admitting streams against a guess could over-commit the GPU:

```
Could not measure the Whisper state memory cost on GPU 0 (...); not loading the model, the next stream retries.
```

The streams that needed the model at that moment get no subtitles; the next stream that needs it on that device loads and measures again. Preloading the models (above) does the measurement at server start, before any stream is running, so it is the way to avoid this altogether.

`nvidia-smi` shows the memory in use by the OvenMediaEngine process; it includes the model weights and the buffers of every stream that currently uses the GPU.
