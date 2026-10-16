---
title: Feature Index
sidebar_position: 3
description: Every OvenMediaEngine Enterprise feature with its minimum version, version-gated options, and an Enterprise-exclusive marker.
---

export const Ent = () => (
  <span className="enterprise-only-icon" data-tip="Enterprise only" aria-label="Enterprise only">
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M3 7l4.5 3.5L12 4l4.5 6.5L21 7l-1.6 11H4.6L3 7zm1.9 13h14.2v2H4.9v-2z" />
    </svg>
  </span>
);

This page is the single index of every OvenMediaEngine Enterprise feature: its
**minimum Enterprise version**, any options or sub-capabilities added in later
versions, and whether the feature is exclusive to Enterprise.

Use it to check at a glance whether the Enterprise build you run (or plan
to upgrade to) supports the feature or option you need.

**How to read it**

- **Minimum Version**: the Enterprise version (4-part, e.g. `0.18.0.0`) in
  which the feature was first introduced.
- `0.16.4.0` is the earliest Enterprise version covered by the published
  [Release Notes](release-notes/); a feature shown at `0.16.4.0` has been
  available since at least that release.
- A **linked feature name** jumps to that feature's later-version options and
  sub-capabilities in [Version-gated capabilities](#version-gated-capabilities)
  below.
- The <Ent /> crown marks a feature exclusive to OvenMediaEngine Enterprise, matching the sidebar marker.

## Overview

| Feature | Category | Minimum Version | Guide |
|---|---|---|---|
| Pre-Built Package <Ent /> | Platform & Tooling | 0.16.4.0 | [View](../pre-built-package-installation/getting-started/README.md) |
| [Web Console](#web-console) <Ent /> | Platform & Tooling | 0.16.4.0 | [View](../exclusive/web-console/README.md) |
| AWS Marketplace <Ent /> | Platform & Tooling | 0.20.3.0 | [View](../exclusive/aws-marketplace/README.md) |
| [RTMP](#rtmp) | Live Source | 0.16.4.0 | [View](../features/live-source/rtmp.md) |
| [SRT](#srt-input) | Live Source | 0.16.4.0 | [View](../features/live-source/srt.md) |
| [WebRTC / WHIP](#webrtc-whip) | Live Source | 0.16.4.0 | [View](../features/live-source/webrtc-whip.md) |
| [RTSP Pull](#rtsp-pull) | Live Source | 0.16.4.0 | [View](../features/live-source/rtsp-pull.md) |
| [MPEG-2 TS](#mpeg-2-ts) | Live Source | 0.16.4.0 | [View](../features/live-source/mpeg-2-ts.md) |
| [Scheduled Channel](#scheduled-channel) | Live Source | 0.16.4.0 | [View](../features/live-source/scheduled-channel.md) |
| Multiplex Channel | Live Source | 0.16.5.0 | [View](../features/live-source/multiplex-channel.md) |
| Multicast <Ent /> | Live Source | 0.20.6.1 | [View](../features/live-source/multicast.md) |
| WebRTC Streaming | Streaming & Distribution | 0.16.4.0 | [View](../features/streaming-and-distribution/webrtc-streaming.md) |
| [Low-Latency HLS](#low-latency-hls) | Streaming & Distribution | 0.16.4.0 | [View](../features/streaming-and-distribution/low-latency-hls.md) |
| [Push Publishing](#push-publishing) | Streaming & Distribution | 0.16.4.0 | [View](../features/streaming-and-distribution/push-publishing.md) |
| Online Demo | Streaming & Distribution | 0.16.4.0 | [View](../features/streaming-and-distribution/online-demo.md) |
| [Recording](#recording) | Streaming & Distribution | 0.16.5.0 | [View](../features/streaming-and-distribution/recording.md) |
| [HLS (legacy v3 / TS)](#hls) | Streaming & Distribution | 0.16.6.0 | [View](../features/streaming-and-distribution/hls.md) |
| [SRT (Publisher)](#srt-publisher) | Streaming & Distribution | 0.18.0.0 | [View](../features/streaming-and-distribution/srt.md) |
| [Transcoding](#transcoding) | Transcoding | 0.16.4.0 | [View](../features/transcoding-and-processing/transcoding.md) |
| [ABR](#abr) | Transcoding | 0.16.4.0 | [View](../features/transcoding-and-processing/abr.md) |
| [Thumbnail](#thumbnail) | Transcoding | 0.16.4.0 | [View](../features/transcoding-and-processing/thumbnail.md) |
| [TranscodeWebhook](#transcodewebhook) | Transcoding | 0.16.4.0 | [View](../features/transcoding-and-processing/transcodewebhook.md) |
| [Hardware Acceleration](#hardware-acceleration) <Ent /> | Transcoding | 0.16.4.0 | [View](../features/transcoding-and-processing/hardware-acceleration.md) |
| Skip Frames <Ent /> | Transcoding | 0.16.4.0 | [View](../features/transcoding-and-processing/skip-frames.md) |
| Image Overlay <Ent /> | Transcoding | 0.19.1.0 | [View](../features/transcoding-and-processing/image-overlay.md) |
| [Realtime Speech-to-Text](#realtime-speech-to-text) | Transcoding | 0.20.0.0 | [View](../features/transcoding-and-processing/subtitles/realtime-speech-to-text.md) |
| [SignedPolicy](#signedpolicy) | Access Control | 0.16.4.0 | [View](../features/access-control-and-security/signedpolicy.md) |
| [AdmissionWebhooks](#admissionwebhooks) | Access Control | 0.16.4.0 | [View](../features/access-control-and-security/admissionwebhooks.md) |
| [DRM: OvenMediaEngine Configuration](#drm-ome-configuration) <Ent /> | Access Control | 0.16.4.0 | [View](../features/access-control-and-security/digital-rights-management-drm/ovenmediaengine-configuration-for-drm.md) |
| DRM: PallyCon Configuration <Ent /> | Access Control | 0.16.4.0 | [View](../features/access-control-and-security/digital-rights-management-drm/pallycon-drm-configuration.md) |
| RTMP Authentication <Ent /> | Access Control | 0.17.2.0 | [View](../features/access-control-and-security/rtmp-authentication.md) |
| SHA-2 Support <Ent /> | Access Control | 0.18.3.2 | [View](../features/access-control-and-security/sha-2-support.md) |
| Clustering | High Availability | 0.16.4.0 | [View](../features/high-availability/clustering.md) |
| [Origin Redundancy](#origin-redundancy) <Ent /> | High Availability | 0.18.3.0 | [View](../features/high-availability/origin-redundancy.md) |
| Logs and Statistics | Operations | 0.16.4.0 | [View](../features/operations-and-monitoring/logs-and-statistics.md) |
| Performance Tuning | Operations | 0.16.4.0 | [View](../features/operations-and-monitoring/performance-tuning.md) |
| Troubleshooting | Operations | 0.16.4.0 | [View](../features/operations-and-monitoring/troubleshooting.md) |
| [CrossDomains](#crossdomains) | Operations | 0.16.4.0 | [View](../features/operations-and-monitoring/crossdomains.md) |
| API Storage <Ent /> | Operations | 0.16.4.0 | [View](../features/operations-and-monitoring/api-storage.md) |
| [Recording Delivery](#recording-delivery) <Ent /> | Operations | 0.16.5.0 | [View](../features/operations-and-monitoring/recording-delivery.md) |
| [Enhanced Alert](#enhanced-alert) <Ent /> | Operations | 0.18.2.1 | [View](../features/operations-and-monitoring/enhanced-alert.md) |
| Persistent Pull Streams <Ent /> | Operations | 0.20.7.1 | [View](../features/operations-and-monitoring/persistent-pull-streams.md) |
| OpenMetrics <Ent /> | Operations | 0.20.9.0 | [View](../features/operations-and-monitoring/openmetrics.md) |
| [CDN Cache Control](#cdn-cache-control) <Ent /> | Workflow Integration | 0.16.4.0 | [View](../features/workflow-integration-and-external-system-connectivity/cdn-cache-control.md) |
| Delay Buffer <Ent /> | Workflow Integration | 0.16.4.0 | [View](../features/workflow-integration-and-external-system-connectivity/delay-buffer.md) |
| P2P Delivery (Experiment) | Workflow Integration | 0.16.4.0 | [View](../features/workflow-integration-and-external-system-connectivity/p2p-delivery-experiment.md) |
| Proxy Protocol <Ent /> | Workflow Integration | 0.16.6.2 | [View](../features/workflow-integration-and-external-system-connectivity/proxy-protocol.md) |
| [Default Playlist Creation](#default-playlist-creation) <Ent /> | Workflow Integration | 0.17.1.2 | [View](../features/workflow-integration-and-external-system-connectivity/default-playlist-creation.md) |
| [Query String Handling](#query-string-handling) <Ent /> | Workflow Integration | 0.16.5.0 | [View](../features/workflow-integration-and-external-system-connectivity/query-string-handling.md) |
| iOS Audio PTS <Ent /> | Workflow Integration | 0.17.2.3 | [View](../features/workflow-integration-and-external-system-connectivity/ios-audio-pts.md) |
| [AMF0 Message Insertion](#amf0-message-insertion) <Ent /> | Workflow Integration | 0.17.3.0 | [View](../features/workflow-integration-and-external-system-connectivity/amf0-message-insertion.md) |
| onCuePoint Message Insertion <Ent /> | Workflow Integration | 0.17.3.0 | [View](../features/workflow-integration-and-external-system-connectivity/oncuepoint-message-insertion.md) |
| [Ad Markers (SCTE-35 / CUE)](#ad-markers) <Ent /> | Workflow Integration | 0.17.3.0 | [View](../features/workflow-integration-and-external-system-connectivity/ad-markers.md) |
| [SEI Insertion](#sei-insertion) <Ent /> | Workflow Integration | 0.18.0.0 | [View](../features/workflow-integration-and-external-system-connectivity/sei-insertion.md) |
| Session Management (WebRTC) <Ent /> | Workflow Integration | 0.20.0.0 | [View](../features/workflow-integration-and-external-system-connectivity/session-management-webrtc-only.md) |
| [Event Forwarding Exclusions](#event-forwarding-exclusions) <Ent /> | Workflow Integration | 0.20.2.0 | [View](../features/workflow-integration-and-external-system-connectivity/event-forwarding-exclusions.md) |
| Upload Recordings to Bunny Stream <Ent /> | Workflow Integration | 0.20.5.1 | [View](../features/workflow-integration-and-external-system-connectivity/upload-recordings-to-bunny-stream.md) |
| Server-Side Ad Insertion (SSAI) <Ent /> | Workflow Integration | 0.21.1.0 | [View](../features/workflow-integration-and-external-system-connectivity/server-side-ad-insertion.md) |
| Scheduled Channel (Fade) <Ent /> | Workflow Integration | 0.21.2.0 | [View](../features/workflow-integration-and-external-system-connectivity/scheduled-channel-fade.md) |
| Fault Injection <Ent /> | Tests | 0.20.2.0 | [View](../features/tests/fault-injection.md) |
| [REST API v2 (Internals & Statistics)](#rest-api-v2) <Ent /> | REST API | 0.18.2.1 | [View](../features/rest-api/v2/README.md) |
| AdmissionFile <Ent /> | Access Control | 0.21.1.0 | TODO |

## Version-gated capabilities

Options and sub-capabilities added to a feature after its initial release. Each
entry is the Enterprise version that introduced that capability. Features not
listed here have no version-gated options beyond their minimum version above.

### Web Console

- **0.16.8.0**: Server information on the Settings page
- **0.16.8.0**: Edit `Server.xml` directly from the Settings page
- **0.17.0.0**: Restart an application from the Stream List and Server Settings
- **0.17.0.0**: API Storage controls in REST API Settings
- **0.18.1.0**: Event monitoring
- **0.18.1.2**: Anomaly-detection events for the ingress stream
- **0.18.1.2**: Stream publishing
- **0.18.3.1**: Detect and notify `Server.xml` changes that require an Enterprise restart
- **0.18.3.1**: Dynamically update Alert Rules without restarting Enterprise
- **0.20.0.1**: Configure `<Defaults>` in `Server.xml` from the settings page
- **0.20.4.0**: Validation when creating RTSP Pull streams
- **0.20.6.1**: Quick ABR Setup (configure ABR via predefined video encoding presets)
- **0.20.7.1**: Quick SSL Configuration
- **0.20.8.1**: Recording Files (Browse, Download, Delete)
- **0.21.1.0**: Metrics section with a real-time dashboard (service health, throughput, active streams) and per-stream Stream Quality views powered by the bundled Prometheus instance
- **0.21.1.0**: Download Logs dialog lists all rotated log files (current and past) per component, with individual or bulk download

### RTMP

- **0.17.2.3**: Precise audio timestamp generation (`GenerateAudioPTS`)
- **0.17.3.0**: `onTextData` / `onCuePoint` AMF0 event handling in RTMP Provider & RTMP Push Publisher
- **0.18.2.1**: Enhanced RTMP (E-RTMP) support
- **0.19.0.0**: Metadata processing in Enhanced RTMP (E-RTMP)
- **0.21.0.0**: AV1 codec ingest over Enhanced RTMP (E-RTMP), including `AV1CodecConfigurationRecord` parsing and in-band OBU fallback for FFmpeg libaom sources

### SRT Input

- **0.16.5.9**: Additional `streamid` formats (Blackmagic / Haivision `#!::` style)
- **0.16.6.0**: SRT access-control-style `streamid`
- **0.18.1.4**: Simple `streamid` format (`streamid=vhost/app/stream`)
- **0.20.2.0**: SCTE-35 (splice insert) event forwarding

### WebRTC WHIP

- **0.18.0.0**: Simulcast support in WebRTC Provider (WHIP)
- **0.18.1.2**: H.265 codec support
- **0.20.2.2**: `Oven-Capabilities` HTTP header (`max_width=`, `max_height=`) applied in WHIP
- **0.20.4.2**: `FIRInterval` setting
- **0.20.5.1**: Immediate WHIP playback without waiting for RTCP (option); Transport-cc bandwidth estimation; `max_fps` in `OvenCapabilities`
- **0.20.5.2**: `<ForceOvenCapabilitiesMaxValuesInStreamInfo>` option
- **0.20.8.0**: NACK + RTX packet loss recovery for video (`<Rtx>` with `Enable` / `MaxHoldMs`)

### RTSP Pull

- **0.19.1.0**: H.265 codec support in the RTSP Pull provider

### MPEG-2 TS

- **0.20.2.0**: SCTE-35 (splice insert) event forwarding

### Scheduled Channel

- **0.16.6.0**: MPEG-2 TS containers; AAC-in-TS and Opus-in-MP4 source files
- **0.18.0.0**: Multiple audio track support
- **0.18.1.0**: `ErrorToleranceDurationMs` option
- **0.20.5.1**: `forwardData` option on `<Item>` (forward live-input data)
- **0.21.1.0**: `MaxFallbackDurationMs` option to automatically remove the channel after extended fallback; `PreserveRemovedScheduleFile` to rename removed schedule files with a timestamp instead of deleting them
- **0.21.2.0**: Fade In / Fade Out per item (`fadeIn`, `fadeOut`, `fadeInColor`, `fadeOutColor`) to fade the video from or to black or white <Ent />

### Low-Latency HLS

- **0.16.5.0**: SAMPLE-AES-CTR encryption; PRIV frame in ID3 timed metadata; `<PropagateQueryString>`
- **0.17.1.2**: `<CreateDefaultPlaylist>` option
- **0.18.0.0**: `#EXT-X-CUE-OUT` / `#EXT-X-CUE-IN` tags; `CHARACTERISTICS` attribute in `#EXT-X-MEDIA`
- **0.18.1.0**: SCTE-35 event and `#EXT-X-DATERANGE` tag
- **0.20.0.0**: Subtitle support
- **0.21.0.0**: AV1 codec support in LL-HLS fMP4 packaging (`av01`/`av1C` ISOBMFF boxes); AV1 is not available in TS-based HLS
- **0.21.0.0**: Discontinuity signaling (`EXT-X-DISCONTINUITY`, `EXT-X-DISCONTINUITY-SEQUENCE`, versioned `EXT-X-MAP`) for mid-stream track configuration changes (e.g. Scheduled Channel item switches)

### Push Publishing

- **0.20.0.1**: `TimestampMode` option for RTMP / SRT / MPEG-TS push publishers
- **0.20.2.1**: `ConnectionTimeout` and `SendTimeout` options

### HLS

- **0.17.1.2**: `<PropagateQueryString>` and `<ServerTimeBasedSegmentNumbering>` options
- **0.17.2.1**: ID3 timed metadata
- **0.17.3.0**: Cue event
- **0.18.0.0**: `#EXT-X-PROGRAM-DATE-TIME` tag
- **0.19.1.1**: Dump feature for Legacy HLS
- **0.20.4.0**: HLS subtitles
- **0.21.0.0**: Discontinuity signaling (`EXT-X-DISCONTINUITY`, `EXT-X-DISCONTINUITY-SEQUENCE`) for mid-stream track configuration changes (e.g. Scheduled Channel item switches)

### SRT Publisher

- **0.18.1.4**: `<option>` in `Server.xml` overrides SRT socket options
- **0.20.0.0**: SCTE-35 event insertion during SRT push

### Transcoding

- **0.16.4.0**: Keyframe interval by time
- **0.17.2.2**: Thread-count setting for the software decoder; keyframe-only decoding when no video encoding
- **0.17.3.0**: Lookahead encoding option
- **0.21.0.0**: AV1 codec support (libaom software encoder/decoder)
- **0.21.2.0**: `ScaleMode` option (`fit` / `crop` / `stretch`)

### ABR

- **0.20.6.1**: Quick ABR Setup (Web Console; predefined video encoding presets)

### Recording

- **0.21.0.0**: AV1 recording to MP4

### Thumbnail

- **0.16.6.1**: Thumbnail Publisher supports HTTP/1.0
- **0.17.3.1**: WebP image codec
- **0.21.0.0**: AVIF image codec
- **0.21.2.0**: `ScaleMode` option (`fit` / `crop` / `stretch`)

### TranscodeWebhook

- **0.20.2.0**: Receive-timeout support

### Hardware Acceleration

- **0.19.2.0**: x264 (paid add-on) support
- **0.20.4.0**: `ExtraOptions` video encoding settings for the x264 encoder
- **0.21.0.0**: NETINT Quadra VPU support
- **0.21.0.0**: AV1 hardware encoding/decoding on NVIDIA; AV1 hardware encoding on NETINT Quadra
- **0.21.0.0**: Experimental `CUDAStreamPriority` option under `<Modules>` in Server.xml to set NVIDIA GPU CUDA stream scheduling priority (`lo` / `hi`)

### Realtime Speech-to-Text

- **0.20.6.1**: Whisper-engine performance/stability rework (significant settings changes)

### SignedPolicy

- **0.16.6.2**: HAProxy PROXY-protocol v1 and Nginx `X-Forwarded-For` / `X-Real-IP` client address
- **0.18.3.2**: SHA-2 support

### AdmissionWebhooks

- **0.16.6.2**: HAProxy PROXY-protocol v1 and Nginx `X-Forwarded-For` / `X-Real-IP` client address
- **0.18.3.2**: SHA-2 support

### DRM OME Configuration

- **0.16.5.0**: SAMPLE-AES-CTR mode encryption for LL-HLS DRM
- **0.21.0.0**: HEVC (H.265) subsample encryption for LL-HLS DRM
- **0.21.0.0**: Microsoft PlayReady DRM support for LL-HLS streams (alongside Widevine and FairPlay); provisioned via CPIX/SPEKE KMS (DoveRunner/PallyCon) or manual DRM Info file
- **0.21.0.0**: LLHLS DRM key rotation — content keys are fetched per period from a CPIX KMS and rotated automatically without inserting a discontinuity (`<KeyRotationIntervalSec>`)

### Origin Redundancy

- **0.18.3.0**: `TimestampMode` setting on `<provider>` (ZeroBased / SystemClock / Original)
- **0.18.3.0**: `PacketSilenceTimeoutMs` setting on the Push Provider

### CrossDomains

- **0.17.2.4**: API response shape changed to `{urls, headers}` (header propagation)

### Recording Delivery

- **0.17.0.0**: Delete recorded files after delivery; show version via the command line

### Enhanced Alert

- **0.18.3.1**: Dynamic alert-rules management; LL-HLS / HLS-ready detection
- **0.18.3.1**: `StreamStatus` split into separate ingress / egress events
- **0.18.3.2**: SHA-2 support
- **0.20.0.0**: Alert on transcoder creation failures
- **0.20.1.0**: Anomaly detection
- **0.20.2.0**: `TranscodeStatus` alert rule
- **0.20.8.0**: `TrackPrepareTimeout` anomaly rule
- **0.21.0.0**: Alert notification payloads include a `serverInfo` block (server ID, name, hostname, IP addresses) to identify the source server in multi-instance deployments
- **0.21.1.0**: Ingress stream alerts include a `connection` object reporting active transport, protocol, and local/remote addresses for WebRTC, RTMP, SRT, and MPEG-TS ingest streams

### CDN Cache Control

- **0.17.3.0**: `Etag` HTTP header
- **0.19.0.0**: Improved CDN integration (no forced TCP close on mismatched HLS URL requests)
- **0.19.1.1**: `Date` header on all HTTP responses

### Default Playlist Creation

- **0.18.1.4**: Default playlist named `master` (supports simulcast and singlecast)

### Query String Handling

- **0.16.5.0**: `<LLHLS><PropagateQueryString>`
- **0.17.1.2**: `<PropagateQueryString>` option for HLSv3

### AMF0 Message Insertion

- **0.17.3.0**: Insert `onTextData` via the Send Event API
- **0.18.2.0**: Insert `onTextData` via XML configuration
- **0.19.1.1**: Insert `onUserDataEvent` via the Send Event API and via XML configuration

### Ad Markers

- **0.18.0.0**: `#EXT-X-CUE-OUT` / `#EXT-X-CUE-IN` tags in LL-HLS
- **0.18.1.0**: SCTE-35 event and `#EXT-X-DATERANGE` tag in LL-HLS; AWS MediaTailor ad-insertion compatibility
- **0.20.0.0**: SCTE-35 (splice insert) event insertion during SRT push
- **0.21.1.0**: `KeyframeOnCue` `<MediaOptions>` option forces a keyframe at each CUE/SCTE-35 marker position for frame-accurate segment cuts

### SEI Insertion

- **0.18.2.0**: Insert SEI events only at keyframes (`<Values><KeyframeOnly>`)
- **0.21.1.0**: SEI type 1 (`pic_timing`) support — stamps a SMPTE timecode on every video picture, readable by any standard decoder without OvenMediaEngine-specific parsing

### Event Forwarding Exclusions

- **0.20.1.0**: Event forwarding policy configuration

### REST API v2

- **0.18.2.1**: `/v2/stats/*` statistics APIs
- **0.20.0.0**: Supported-codecs query API (`/v2` internals)
- **0.21.1.0**: Stream response (`input`) includes a `connection` object with transport, protocol, and address details for each ingest stream

### Image Overlay

- **0.21.0.0**: Image overlay composition support for the NETINT Quadra VPU hardware encoder (zero-copy RGBA alpha-blend on the 2D engine)

### Server-Side Ad Insertion (SSAI)

- **0.21.1.0**: `SsaiCompatibility` option for LL-HLS aligns segment boundaries across all tracks at ad marker positions for accurate ad stitching (e.g. AWS MediaTailor); `ForceAlignMarkerBoundary` sub-option also available independently

### Send Event API

- **0.21.1.0**: `startOffset` parameter on the `sendEvent` API schedules an event a fixed number of milliseconds ahead of the current stream position (max 300 000 ms); a request to a stream with no media yet answers 409
