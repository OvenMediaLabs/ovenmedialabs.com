---
title: OpenMetrics
description: "Expose OvenMediaEngine Enterprise runtime metrics in OpenMetrics 1.0.0 format at /v2/metrics."
enterprise_only: true
sidebar_position: 126
---

OvenMediaEngine Enterprise exposes its runtime metrics at `/v2/metrics` in the [OpenMetrics](https://openmetrics.io/) 1.0.0 exposition format. It is a vendor-neutral, pull-based text format that any OpenMetrics-compatible monitoring system can read.

The response is rendered on demand from the live monitoring model and is read-only: scraping never changes collection state.

## Endpoint

`GET /v2/metrics` is served by the API server, on the same host and port as the REST API.

The path narrows what a scrape returns. Labels are always complete (`vhost`, `app`, `stream`, and so on) regardless of the path; the path only decides which series are emitted.

| Path                                                              | Covers                                        |
| ----------------------------------------------------------------- | --------------------------------------------- |
| `/v2/metrics`                                                     | Whole server                                  |
| `/v2/metrics/vhosts/{vhost}`                                      | One virtual host                              |
| `/v2/metrics/vhosts/{vhost}/apps/{app}`                           | One application                               |
| `/v2/metrics/vhosts/{vhost}/apps/{app}/streams/{stream}`          | One stream                                    |
| `/v2/metrics/vhosts/{vhost}/apps/{app}/streams/{stream}/sessions` | One stream, including its per-session metrics |

Only the `.../sessions` path includes per-session metrics by default; at any other path, request them explicitly with `?collect[]=session`. See [Selecting collectors](#selecting-collectors) below.

## Authentication

`/v2/metrics` uses the same HTTP Basic authentication as the rest of the API server, keyed on the configured `<AccessToken>`.

Set `<AccessToken>` to a `username:password` pair, then authenticate with that username and password from any standard Basic-auth client:

```bash
curl -u 'user:secret' http://<ome-host>:<api-port>/v2/metrics
```

The username and password are simply the two sides of the colon in `<AccessToken>`. A leading-colon token such as `:secret` means an empty username (`curl -u ':secret'`).

You can also use a single opaque token with no colon. In that case send it as the Base64-encoded Basic credential directly:

```bash
curl -H "Authorization: Basic $(printf '%s' 'mytoken' | base64)" http://<ome-host>:<api-port>/v2/metrics
```

## Configuration

The endpoint is available whenever the API manager is enabled. An optional `<OpenMetrics>` block tunes it:

```xml
<Server>
    <Managers>
        <API>
            <AccessToken>user:password</AccessToken>
            <OpenMetrics>
                <Cache>
                    <Enable>true</Enable>
                    <DurationMs>3000</DurationMs>
                </Cache>
            </OpenMetrics>
        </API>
    </Managers>
</Server>
```

- `<Cache>` (optional): scrape-response caching.
  - `<Enable>` (default `true`): set to `false` to render every request fresh and bypass the cache.
  - `<DurationMs>` (default `3000`): how long a cached response stays valid, in milliseconds. Keep it well under your scrape interval.

Keep caching on when several collectors scrape the same endpoint, or the scrape interval is short on a deployment with many streams and sessions: overlapping scrapes within `DurationMs` reuse one render instead of walking the whole model each time. Turn it off when you need exact point-in-time values on every request (for example, manual debugging with `curl`), or when a single, infrequent scraper makes caching pointless.

## Selecting collectors

Metrics are grouped into collectors. Select a subset with repeated query keys (the node_exporter convention). `collect[]` and `exclude[]` are mutually exclusive.

- `?collect[]=traffic&collect[]=stream`: emit only these collectors.
- `?exclude[]=queue`: emit everything except these.

Collector names are lowercase. An unknown name returns `400` with the list of valid names. A request with no selection emits all default collectors.

| Collector    | Emits                                                                              | In default scrape |
| ------------ | ---------------------------------------------------------------------------------- | ----------------- |
| `core`       | Build info, process start time                                                     | Always on         |
| `traffic`    | Received/transmitted byte counters                                                 | Yes               |
| `connection` | Current connection gauges                                                          | Yes               |
| `stream`     | Media/track characteristics, source timing, ingest RTT, and SRT ingest packet loss | Yes               |
| `queue`      | Managed-queue gauges and counters                                                  | Yes               |
| `push`       | Push/record byte counters and state                                                | Yes               |
| `session`    | Per-session byte counter, throughput, RTT, and SRT egress packet loss              | No (opt-in)       |

`core` is always emitted regardless of the selection.

`session` is **not** part of the default scrape: per-session series are high-cardinality and churn quickly. Request it explicitly with `?collect[]=session`, or scrape the `.../streams/{stream}/sessions` path.

Per-session series are populated for **WebRTC, LLHLS, and HLS** playback sessions, for **SRT** subscriber sessions, and for **OVT** relay sessions (the origin side of an origin-edge connection).
Other publishers (Thumbnail, File, and so on) are reflected at the stream level (via `traffic`/`connection`) but do not create per-session entries.

An OVT relay session reports RTT only when the OVT bind port is TCP, which is the default.
If it is bound as SRT, `ome_session_rtt_seconds` is not emitted for that session (no method applies).

## Metrics reference

Every metric emitted, grouped by collector. Each carries the entity labels of its scope (`vhost`/`app`/`stream`, plus `output_stream`, `provider`, `publisher`, `session`/`session_id`, `track`/`media`/`codec`, `method`, `protocol` where applicable). All values are raw (no timestamps).

### The `provider` and `publisher` labels

Direction is always explicit in the label name, never in the value.

- `provider` names the **ingest** side: the provider that brought the source input in (`srt`, `rtmp`, `mpegts`, `ovt`, `webrtc`, `rtsppull`, `multicast`, `scheduled`, `multiplex`). Every stream series carries it. An output rendition reports its input's provider, matching the `stream`/`stream_id` pair, which also names the source input.
- `publisher` names the **delivery** side: the publisher the bytes went out through (`webrtc`, `llhls`, `hlsv3`, `srt`, `ovt`, `thumbnail`, `push`, `file`). The stream-level egress families and every session series carry it.

A row that has both reads in one direction, so `ome_transmit_bytes_total{provider="rtmp", publisher="srt"}` is an RTMP input delivered over SRT.
To find everything about SRT, ask the direction you mean: `{provider="srt"}` for ingest and `{publisher="srt"}` for delivery.

Metrics that exist for one protocol only keep that protocol in the name (`ome_stream_srt_lost_packets_total`), because a family has to mean the same thing for every series in it.
They still carry `provider` (or `publisher`), so the selectors above find them.

The `push` families carry their own `protocol` label for the protocol of that push target (`rtmp`, `mpegts`, `srt`), which is a property of the target rather than of the stream.

### `core` (always on)

| Metric                       | Type  | Description                                                       |
| ---------------------------- | ----- | ----------------------------------------------------------------- |
| `ome_build_info`             | info  | Build/version identification (value is always 1; data in labels). |
| `process_start_time_seconds` | gauge | Process start time, in seconds since the Unix epoch.              |

### `traffic`

| Metric                     | Type    | Description                                                                                 |
| -------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `ome_receive_bytes_total`  | counter | Media bytes received from the provider for this stream (excludes protocol/socket overhead). |
| `ome_transmit_bytes_total` | counter | Media bytes transmitted to subscribers, by `publisher`.                                     |

### `connection`

| Metric                | Type  | Description                                           |
| --------------------- | ----- | ----------------------------------------------------- |
| `ome_connections`     | gauge | Current number of connected sessions, by `publisher`. |
| `ome_connections_max` | gauge | Peak concurrent connections observed for this stream. |

### `stream`

| Metric                                 | Type    | Description                                                                                                  |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `ome_stream_source_connect_seconds`    | gauge   | Time taken to connect to the origin (0 for non-pull streams).                                                |
| `ome_stream_rtt_seconds`               | gauge   | Ingest round-trip time, split by `method`. See [Round-trip time](#round-trip-time).                          |
| `ome_stream_srt_lost_packets_total`    | counter | SRT ingest: packets the receiver detected as lost. SRT inputs only. See [SRT packet loss](#srt-packet-loss). |
| `ome_stream_srt_dropped_packets_total` | counter | SRT ingest: packets dropped too-late-to-play (TLPKTDROP). SRT inputs only.                                   |
| `ome_track_bitrate_bps`                | gauge   | Measured track bitrate (video and audio), by `track`/`media`/`codec`.                                        |
| `ome_track_framerate_fps`              | gauge   | Measured video frame rate.                                                                                   |
| `ome_track_keyframe_interval_seconds`  | gauge   | Measured video keyframe interval.                                                                            |
| `ome_track_width`                      | gauge   | Video frame width, in pixels.                                                                                |
| `ome_track_height`                     | gauge   | Video frame height, in pixels.                                                                               |
| `ome_track_has_bframes`                | gauge   | 1 if the video track carries B-frames, 0 otherwise.                                                          |
| `ome_track_samplerate_hertz`           | gauge   | Audio sample rate, in hertz.                                                                                 |
| `ome_track_channels`                   | gauge   | Number of audio channels.                                                                                    |

### `queue`

| Metric                                 | Type    | Description                                      |
| -------------------------------------- | ------- | ------------------------------------------------ |
| `ome_queue_size`                       | gauge   | Current number of messages in the managed queue. |
| `ome_queue_peak`                       | gauge   | Peak number of messages observed.                |
| `ome_queue_threshold`                  | gauge   | Configured message-count threshold.              |
| `ome_queue_dropped_total`              | counter | Total messages dropped by the queue.             |
| `ome_queue_input_messages_per_second`  | gauge   | Messages enqueued per second.                    |
| `ome_queue_output_messages_per_second` | gauge   | Messages dequeued per second.                    |
| `ome_queue_waiting_seconds`            | gauge   | Average time a message waits in the queue.       |

### `push`

| Metric                          | Type     | Description                                                                         |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `ome_push_transmit_bytes_total` | counter  | Media bytes transmitted to the push/record target.                                  |
| `ome_push_state`                | stateset | Push lifecycle state: one series per candidate state, value 1 for the active state. |

### `session` (opt-in)

| Metric                                        | Type    | Description                                                                                                           |
| --------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `ome_session_transmit_bytes_total`            | counter | Media bytes transmitted to this subscriber session.                                                                   |
| `ome_session_transmit_bps`                    | gauge   | Current transmit throughput to the session, in bits per second.                                                       |
| `ome_session_rtt_seconds`                     | gauge   | Per-session round-trip time, split by `publisher` and `method`. See [Round-trip time](#round-trip-time).              |
| `ome_session_srt_lost_packets_total`          | counter | SRT egress: packets the subscriber reported lost via NAK. SRT sessions only. See [SRT packet loss](#srt-packet-loss). |
| `ome_session_srt_retransmitted_packets_total` | counter | SRT egress: packets retransmitted to the subscriber. SRT sessions only.                                               |
| `ome_session_srt_dropped_packets_total`       | counter | SRT egress: packets dropped too-late-to-send (TLPKTDROP). SRT sessions only.                                          |

### Round-trip time

Two RTT gauges are exposed in seconds, each carrying a `method` label that says how the value was measured:

- `ome_session_rtt_seconds` (in `session`): RTT to a playback subscriber. Per-session metrics are produced for **WebRTC, LLHLS, HLS, SRT, and OVT** sessions, and every session series also carries a `publisher` label (`webrtc`, `llhls`, `hlsv3`, `srt`, `ovt`, ...) so RTT can be split by delivery protocol as well as by method. The methods available depend on the protocol:
  - `method="rtcp"`: derived from RTCP Receiver Reports (the media path). WebRTC only.
  - `method="stun"`: derived from ICE STUN binding request/response timing. WebRTC only.
  - `method="tcp"`: the kernel's smoothed TCP round-trip time (`TCP_INFO.tcpi_rtt`, SRTT) of the session's socket. Produced for HLS/LLHLS sessions (the HTTP connection that most recently served the session), for OVT relay sessions, and for WebRTC sessions carried over ICE-over-TCP; WebRTC sessions on UDP (the common case) emit no `tcp` series.
  - `method="tcp_min"`: the kernel's minimum observed RTT (`TCP_INFO.tcpi_min_rtt`) of the same socket - the best-case path floor, filtering out the queuing/retransmit/delayed-ACK inflation carried by `tcp` (SRTT). Same TCP applicability as `tcp`.
  - `method="srt"`: libsrt's own RTT estimate (`msRTT` from `srt_bstats`) for the subscriber connection. SRT sessions only, which are UDP and therefore have no `TCP_INFO` RTT to report instead.
- `ome_stream_rtt_seconds` (in `stream`): ingest RTT of an input stream, by method:
  - `method="stun"`: from STUN binding request/response timing (WebRTC/WHIP input).
  - `method="tcp"`: the ingest socket's smoothed TCP round-trip time (`TCP_INFO.tcpi_rtt`, SRTT). Produced **only for TCP-based inputs** such as RTMP, RTSP-over-TCP, and an OVT pull from an origin; UDP-based inputs emit no `tcp` series.
  - `method="tcp_min"`: the ingest socket's minimum observed RTT (`TCP_INFO.tcpi_min_rtt`), the best-case path floor. Same TCP applicability as `tcp`.
  - `method="srt"`: libsrt's own RTT estimate (`msRTT` from `srt_bstats`) for the ingest connection. SRT inputs only.

Because these methods measure the same round-trip at different layers, they will not agree exactly: `rtcp` reflects the media path, `stun` the ICE application exchange, and `tcp` the kernel transport (with `tcp_min` its best-case floor).
Comparing them is useful - for example, a `stun`/`rtcp` value that spikes while `tcp` stays flat points to jitter or queuing above the transport rather than a network problem; a large `tcp` vs `tcp_min` gap points to queuing/retransmit within the TCP connection itself.

Do not expect `tcp`/`tcp_min` to match a raw `ping`. `TCP_INFO` derives RTT from the connection's own data/ACK timing, not from an echo probe. `tcp` (SRTT) is a _smoothed_ estimate, and delayed ACKs, retransmits, and send-buffer queuing under the media load push it well above the true path latency - so on even a fast LAN it can read milliseconds while `ping` shows microseconds. `tcp_min` (`tcpi_min_rtt`) strips that inflation out, so it is the closest of the TCP values to the raw path RTT, and the most directly comparable to `stun`/`rtcp` (which are lightweight single-packet probes). Use `tcp_min` when you want the path floor and `tcp` when you want what the connection is actually experiencing right now.

Only the methods that apply to a session's/stream's protocol are exported - there are no always-zero series for methods that do not apply (e.g. an HLS/LLHLS session emits only `tcp`/`tcp_min`, never `rtcp`/`stun`; an RTMP input emits only `tcp`/`tcp_min`, never `stun`). For a method that does apply, a value of `0` means it is supported but has not measured an RTT yet.

The `rtcp` and `stun` series are refreshed only when the peer drives new traffic: `rtcp` on each incoming RTCP Receiver Report, and `stun` on each STUN binding response (the peer's ICE connectivity/consent-freshness checks, typically every few seconds).
If the peer goes silent, these gauges hold their last value until the session or stream is torn down and the series disappears - they are not reset to `0`, so treat a non-zero value as "last measured RTT", not necessarily "current".
The `tcp`, `tcp_min`, and `srt` series are instead sampled at scrape time by reading the socket directly, so they always reflect the current transport state.
Each `stun` value (session, and the `stun` series of `ome_stream_rtt_seconds`) reflects the candidate pair that produced the most recent binding response, which is normally the nominated pair but may differ while the peer is still probing multiple pairs.

### SRT packet loss

For SRT connections, OvenMediaEngine exposes libsrt's packet-loss counters (from `srt_bstats`) split by whether the connection is an ingest (SRT provider) or an egress (SRT publisher).
Each is a counter reported as a cumulative total since the SRT connection was established; the value only grows, and the series disappears (resetting the count) when that connection reconnects.
The counters are sampled directly from the socket at scrape time, so they always reflect the current transport state.

Ingest side, on the `stream` collector (receiver statistics of the SRT input):

- `ome_stream_srt_lost_packets_total`: SRT data packets the receiver detected as lost, before retransmission recovery (`pktRcvLossTotal`).
- `ome_stream_srt_dropped_packets_total`: SRT data packets dropped too-late-to-play by the TLPKTDROP mechanism (`pktRcvDropTotal`).

Egress side, on the `session` collector (sender statistics towards one SRT subscriber):

- `ome_session_srt_lost_packets_total`: SRT data packets the subscriber reported lost via NAK (`pktSndLossTotal`).
- `ome_session_srt_retransmitted_packets_total`: SRT data packets retransmitted to the subscriber in response (`pktRetransTotal`).
- `ome_session_srt_dropped_packets_total`: SRT data packets dropped too-late-to-send by the TLPKTDROP mechanism (`pktSndDropTotal`).

These families are emitted only when at least one in-scope stream or session is carried over SRT; non-SRT streams and sessions produce no SRT series at all (rather than always-zero samples).
These counters are causally ordered: detected loss (`lost`) is what triggers a retransmission (`retransmitted`), and a packet is counted as `dropped` (`TLPKTDROP`) only when neither the original nor its retransmission arrives within the latency window.
So on a lossy path `lost` moves first, `retransmitted` tracks the recovery attempts it triggers, and `dropped` rises only for the packets that recovery could not deliver in time.

## Example queries

A few PromQL starting points (replace the label matchers with your own vhost/app/stream):

```promql
# Current viewers of a stream, by publisher
sum by (publisher) (ome_connections{stream="my_stream", output_stream=""})

# Ingest bitrate, bits per second
rate(ome_receive_bytes_total{stream="my_stream", output_stream=""}[1m]) * 8

# Egress bitrate by publisher, bits per second
sum by (publisher) (rate(ome_transmit_bytes_total{stream="my_stream", output_stream=""}[1m])) * 8

# Per-session RTT (all publishers/methods) for an application
ome_session_rtt_seconds{app="my_app"}

# Everything about SRT, asked one direction at a time
{provider="srt"}
{publisher="srt"}

# Transport-vs-media RTT divergence for WebRTC sessions
# (large positive = TCP transport is slower than the media-path RTT)
ome_session_rtt_seconds{method="tcp"} - ignoring(method) ome_session_rtt_seconds{method="rtcp"}
```

Stream-level series (`ome_connections`, `ome_receive_bytes_total`, `ome_transmit_bytes_total`, `ome_stream_rtt_seconds`) are emitted both for the input stream and for each output rendition. Match `output_stream=""` to select the input-side aggregate once and avoid double-counting across renditions.

## Compression

If the scraper sends `Accept-Encoding: gzip`, the response is gzip-compressed and returned with `Content-Encoding: gzip`.

## Format notes

The output conforms to OpenMetrics 1.0.0:

- One `# HELP` and `# TYPE` line per metric family.
- Counters end with `_total`; values use base units (`_bytes`, `_seconds`).
- No per-sample timestamps.
- The document is terminated by a single `# EOF` line.

A minimal scrape looks like:

```text
# HELP ome_build_info OvenMediaEngine build information.
# TYPE ome_build_info info
ome_build_info{version="...",git_version="..."} 1
# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds 1783445283.19
# EOF
```
