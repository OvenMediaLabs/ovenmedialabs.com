---
title: OpenMetrics
description: "Expose OvenMediaEngine Enterprise runtime metrics in OpenMetrics 1.0.0 format at /v2/metrics."
enterprise_only: true
sidebar_position: 126
---

OvenMediaEngine Enterprise exposes its runtime metrics at `/v2/metrics` in the [OpenMetrics](https://openmetrics.io/) 1.0.0 exposition format. It is a vendor-neutral, pull-based text format that any OpenMetrics-compatible monitoring system can read.

The response is rendered on demand from the live monitoring model.
Scraping never changes collection state, except that each scrape is itself counted as an HTTP request (`handler="api"`, `kind="metrics"`) when [HTTP request timing](#http-request-timing) is enabled.

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

| Collector         | Emits                                                                                      | In default scrape |
| ----------------- | ------------------------------------------------------------------------------------------ | ----------------- |
| `core`            | Build info, process start time                                                             | Always on         |
| `traffic`         | Received/transmitted byte counters                                                         | Yes               |
| `connection`      | Current connection gauges                                                                  | Yes               |
| `stream`          | Media/track characteristics, source timing, ingest RTT, and SRT ingest packet loss         | Yes               |
| `queue`           | Managed-queue gauges and counters                                                          | Yes               |
| `push`            | Push/record byte counters and state                                                        | Yes               |
| `session`         | Per-session byte counter, throughput, RTT, SRT egress packet loss, and HTTP request timing | No (opt-in)       |
| `frame_latency`   | Per-track frame latency histograms                                                         | Yes               |
| `session_latency` | Per-session WebRTC egress latency (count and sum)                                          | No (opt-in)       |
| `http`            | HTTP request timing, unanswered requests, and requests in progress                         | Yes               |

`core` is always emitted regardless of the selection.

`session` is **not** part of the default scrape: per-session series are high-cardinality and churn quickly. Request it explicitly with `?collect[]=session`, or scrape the `.../streams/{stream}/sessions` path.

Per-session series are populated for **WebRTC, LLHLS, and HLS** playback sessions, for **SRT** subscriber sessions, and for **OVT** relay sessions (the origin side of an origin-edge connection).
Other publishers (Thumbnail, File, and so on) are reflected at the stream level (via `traffic`/`connection`) but do not create per-session entries.

An OVT relay session reports RTT only when the OVT bind port is TCP, which is the default.
If it is bound as SRT, `ome_session_rtt_seconds` is not emitted for that session (no method applies).

`session_latency` is opt-in for the same reason as `session`, and covers WebRTC viewer sessions only.
The `.../streams/{stream}/sessions` path includes it unless the request names it in `exclude[]`, so a request with `collect[]` on that path gets it too.
To get the default collectors together with an opt-in one, list every collector in `collect[]`.

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

| Metric                     | Type    | Description                                                                                                                                                                                                                        |
| -------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ome_receive_bytes_total`  | counter | Media bytes received from the provider for this stream (excludes protocol/socket overhead).                                                                                                                                        |
| `ome_transmit_bytes_total` | counter | Bytes transmitted to subscribers, by `publisher`. Each publisher counts at its own layer, some with protocol headers (whole HTTP responses for LL-HLS, whole RTP packets for WebRTC), so compare values only within one publisher. |

### `connection`

| Metric                | Type  | Description                                           |
| --------------------- | ----- | ----------------------------------------------------- |
| `ome_connections`     | gauge | Current number of connected sessions, by `publisher`. |
| `ome_connections_max` | gauge | Peak concurrent connections observed for this stream. |

### `stream`

| Metric                                 | Type    | Description                                                                                                                                                                                                                                                                             |
| -------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ome_stream_source_connect_seconds`    | gauge   | Time taken to connect to the origin. OVT and RTSP pull inputs only. While a pull input is reconnecting, the previous connection's value is kept.                                                                                                                                        |
| `ome_stream_rtt_seconds`               | gauge   | Ingest round-trip time, split by `method`. See [Round-trip time](#round-trip-time).                                                                                                                                                                                                     |
| `ome_stream_srt_lost_packets_total`    | counter | SRT ingest: packets the receiver detected as lost. SRT inputs only. See [SRT packet loss](#srt-packet-loss).                                                                                                                                                                            |
| `ome_stream_srt_dropped_packets_total` | counter | SRT ingest: packets dropped too-late-to-play (TLPKTDROP). SRT inputs only.                                                                                                                                                                                                              |
| `ome_track_bitrate_bps`                | gauge   | Measured track bitrate (video and audio), by `track`/`media`/`codec`.                                                                                                                                                                                                                   |
| `ome_track_framerate_fps`              | gauge   | Measured video frame rate.                                                                                                                                                                                                                                                              |
| `ome_track_keyframe_interval_seconds`  | gauge   | Measured video keyframe interval from timestamps: the last keyframe-to-keyframe time, or the span from the last keyframe to the latest frame once that is longer (it holds while no frames arrive). Absent until a frame follows the first keyframe, and while a pull input reconnects. |
| `ome_track_width`                      | gauge   | Video frame width, in pixels.                                                                                                                                                                                                                                                           |
| `ome_track_height`                     | gauge   | Video frame height, in pixels.                                                                                                                                                                                                                                                          |
| `ome_track_has_bframes`                | gauge   | 1 if the video track carries B-frames, 0 otherwise.                                                                                                                                                                                                                                     |
| `ome_track_samplerate_hertz`           | gauge   | Audio sample rate, in hertz.                                                                                                                                                                                                                                                            |
| `ome_track_channels`                   | gauge   | Number of audio channels.                                                                                                                                                                                                                                                               |

### `queue`

| Metric                                 | Type    | Description                                                                                                                                                 |
| -------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ome_queue_size`                       | gauge   | Current number of messages in the managed queue.                                                                                                            |
| `ome_queue_peak`                       | gauge   | Peak number of messages observed.                                                                                                                           |
| `ome_queue_threshold`                  | gauge   | Message-count threshold. A time-based threshold and a buffering delay are converted to counts from the current input rate, so the value can change with it. |
| `ome_queue_dropped_total`              | counter | Total messages dropped by the queue.                                                                                                                        |
| `ome_queue_input_messages_per_second`  | gauge   | Messages enqueued per second.                                                                                                                               |
| `ome_queue_output_messages_per_second` | gauge   | Messages dequeued per second.                                                                                                                               |
| `ome_queue_waiting_seconds`            | gauge   | Exponentially weighted moving average of the time a dequeued message waited in the queue.                                                                   |

### `push`

| Metric                          | Type     | Description                                                                         |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `ome_push_transmit_bytes_total` | counter  | Media bytes transmitted to the push/record target.                                  |
| `ome_push_state`                | stateset | Push lifecycle state: one series per candidate state, value 1 for the active state. |

### `session` (opt-in)

| Metric                                        | Type    | Description                                                                                                                                                                                                |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ome_session_transmit_bytes_total`            | counter | Bytes transmitted to this subscriber session, counted as for `ome_transmit_bytes_total`.                                                                                                                   |
| `ome_session_transmit_bps`                    | gauge   | Current transmit throughput to the session, in bits per second.                                                                                                                                            |
| `ome_session_rtt_seconds`                     | gauge   | Per-session round-trip time, split by `publisher` and `method`. See [Round-trip time](#round-trip-time).                                                                                                   |
| `ome_session_srt_lost_packets_total`          | counter | SRT egress: packets the subscriber reported lost via NAK. SRT sessions only. See [SRT packet loss](#srt-packet-loss).                                                                                      |
| `ome_session_srt_retransmitted_packets_total` | counter | SRT egress: packets retransmitted to the subscriber. SRT sessions only.                                                                                                                                    |
| `ome_session_srt_dropped_packets_total`       | counter | SRT egress: packets dropped too-late-to-send (TLPKTDROP). SRT sessions only.                                                                                                                               |
| `ome_session_http_request_duration_seconds`   | summary | LL-HLS and HLS sessions: count and sum of `ome_http_request_duration_seconds` for the requests this session served, by `kind`, `held`, and `status_code`. See [HTTP request timing](#http-request-timing). |
| `ome_session_http_request_processing_seconds` | summary | LL-HLS sessions: count and sum of `ome_http_request_processing_seconds` for the requests this session served.                                                                                              |

### Frame latency

When `Modules > Measurements > FrameLatency` is enabled, OvenMediaEngine records when each frame passes four points and reports the time between them.

| Point | Where                                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `[1]` | The origin receives the frame from its input, whatever the ingest protocol.                                                                                                                      |
| `[2]` | The origin writes the frame to the OVT connection of an edge.                                                                                                                                    |
| `[3]` | The edge receives the first fragment of the frame. On a server that does not pull from an origin, this is when the frame arrives from its input.                                                 |
| `[4]` | The server hands the last RTP packet of the frame to the send path of a WebRTC viewer. A frame the send path refuses, such as one before the viewer's DTLS handshake completes, is not measured. |

| Span         | Points      | Notes                                                                                                                                              |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ingest`     | `[2] - [1]` | Time the frame spends in the origin before it is written to this edge's connection. Each edge has its own value, so do not add it up across edges. |
| `relay`      | `[3] - [2]` | Subtracts the origin's clock from the edge's: any offset between the two clocks is in the value.                                                   |
| `egress`     | `[4] - [3]` | Measured once per frame per WebRTC viewer. Does not include socket or kernel queueing, which can be significant over TCP or TURN.                  |
| `end_to_end` | `[4] - [1]` | Subtracts two servers' clocks, like `relay`. Measured once per frame per WebRTC viewer.                                                            |

Every span is measured on every frame.

Where each span is reported:

- An edge reports all four spans for the streams it pulls from an origin.
- Any server with WebRTC viewers, the origin included, reports `egress` for them.
- The origin reports no `ingest`, `relay`, or `end_to_end`.
  It sends `[1]` and `[2]` to the edges with every frame, and the edges measure.
- The spans are reported on the output stream tracks, with the same labels as the other `ome_track_*` series.
- In a chain such as origin > edge > edge, an edge receives `[1]` and `[2]` from the server it pulls from.
  On the last edge, `ingest` and `end_to_end` therefore start when the middle edge received the frame.

`ingest`, `relay`, and `end_to_end` need all of the following:

1. `Modules > Measurements > FrameLatency` is enabled on the origin, so that it sends `[1]` and `[2]`, and on every edge, so that it records the spans.
   With only the edge enabled, the edge reports only `egress`.
   With only the origin enabled, the edge reports nothing.
2. The edge is connected to the origin over OVT2.
   An edge connected over OVT1 (for example, to an origin of an older version) receives no `[1]` and `[2]` and reports only `egress`.
3. The clocks of the origin and the edges are synchronized, for example with NTP, because `relay` and `end_to_end` compare them.

If a span has no series:

- A span's series appear with its first measured frame.
  `egress` and `end_to_end` need a WebRTC viewer, so an origin with no WebRTC viewers reports only `ome_frame_latency_buckets_info`.
- Check the first two requirements above: the feature on both sides, and OVT2.
- A track this server transcodes has no series at all, because the encoder produces a new frame that carries no arrival time.
  A track the origin transcodes has `egress` on the edge, but no `ingest`, `relay`, or `end_to_end`.
- Scheduled and multiplex streams report no frame latency.

#### Configuration

```xml
<Server>
    <Modules>
        <Measurements>
            <FrameLatency>
                <Enable>true</Enable>
                <!-- Optional. Testing and diagnostics only -->
                <Buckets>0.001,0.005,0.01,0.02,0.03,0.05,0.07,0.1,0.15,0.2,0.3,0.5,1,3</Buckets>
            </FrameLatency>
        </Measurements>
    </Modules>
</Server>
```

- `<Enable>` (default `false`): turns the measurement on for the whole server.
  It is read at startup, so a change takes effect after a restart.
- `<Buckets>` (optional, for testing and diagnostics): histogram upper bounds in seconds, comma-separated and strictly increasing.
  Each bound is between `0.0001` and `3600` with at most 6 decimal places, and the list holds at most 30 bounds.
  The default is the list above.
  An invalid list is a configuration error, and the server does not start.

`<Modules><FrameLatency>` from earlier releases still works and logs a deprecation warning at startup.
Setting it there and under `<Measurements>` at the same time is a configuration error, and the server does not start.

To stop an origin from sending `[1]` and `[2]` for one application, set `<OVT><FrameLatency><Enable>false</Enable></FrameLatency></OVT>` under that application's `<Publishers>`.
It defaults to `true`, so there is nothing to set otherwise.

If you change `<Buckets>`:

- Use the same list on every server whose histograms you sum together.
  `ome_frame_latency_buckets_info` shows each server's list in its `bounds` label.
  This query finds servers that disagree, where `job` stands for the label your monitoring system attaches to group servers: `count by (job) (count by (job, bounds) (ome_frame_latency_buckets_info)) > 1`.
- Query ranges that cover the restart mix the old and the new buckets, so quantiles over those ranges are wrong.
- A query or alert that names a specific `le`, such as the 200 ms and 500 ms examples in [Example queries](#example-queries), returns nothing once that bound is removed.
  The server logs a warning at startup whenever `<Buckets>` differs from the default, and names `0.2` or `0.5` when the list lacks them.

#### Reading the histograms

- The frame count (`_count`), the summed latency (`_sum`), and the mean (`rate(..._sum[5m]) / rate(..._count[5m])`) are exact.
- The share of frames above a bound is exact when the bound is one of the buckets.
- `le` values are written in their shortest decimal form, with `.0` for whole seconds: `le="0.2"`, `le="1.0"`.
- A quantile, such as the 95th percentile, is interpolated within the bucket it falls in, so its error is up to the width of that bucket.
  A quantile above the highest bound (3 seconds by default) cannot be resolved; read it as "at least that much".
- The histograms keep a count per bucket, not individual values.
  For the largest value in a period and when it happened, use the `FrameLatency` log below.
- `_count` plus the `..._excluded_observations_total` series is every observation of the span.
  For `ingest`, `relay`, and `end_to_end`, counting starts at the first frame that carries the times of the server this edge pulls from; frames before it are in neither.
  An observation is left out of the histogram for one of two reasons:
  - `reason="negative"`: the span came out negative, which happens when the servers' clocks disagree or a clock is stepped back.
    If it keeps rising, synchronize the clocks; `relay` and `end_to_end` are not reliable until then.
  - `reason="unmeasured"`: this frame arrived without the times of the server this edge pulls from, although earlier frames of the track had them.

For the exact value and time of an outlier, enable the `FrameLatency` log tag at `debug` level in `Logger.xml`.
It writes one line per track per second, starting with the stream and the track, then the second it covers as `sec=<Unix seconds>` and the time since the previous line as `w=<milliseconds>`, and then these fields for each span the track has measured:

| Field        | Meaning                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `n`          | Frames measured in that second                                                                                                                   |
| `max`        | The largest value in that second, in microseconds, with the `pts` of that frame and, for `egress` and `end_to_end`, the `session` id that saw it |
| `count`      | The span's histogram `_count` when the line was written                                                                                          |
| `d`          | What `_count` added since the previous line                                                                                                      |
| `mean`       | The mean of the values added since the previous line, in microseconds                                                                            |
| `neg`, `unm` | Observations left out since the previous line, as `reason="negative"` and `reason="unmeasured"` (only when not zero)                             |
| `b`          | The buckets filled since the previous line, as `<upper bound in seconds>:<frames>` (only the ones that are not zero)                             |

```text
#default#app/stream track 0 (Video) sec=1792479271 w=1001ms: ... end_to_end n=30 max=133764us(session 100, pts 30421) count=617 d=31 mean=68066us b=0.02:1,0.03:2,0.05:2,0.07:19,0.1:4,0.15:3
```

`d`, `mean`, `neg`, `unm`, and `b` come from the same counters a scrape reads.
A span's first line covers everything since the span started, so the `d` of all its lines add up to its `_count`, and the lines between two scrapes add up to the increase the scrapes show, within one line at either end.
The very first line after the server starts writing these lines has no `w`.
To find the lines behind an increase, take `_count` from the two scrapes and pick the lines of the same track whose `count` falls between them; no clock is involved.
Use `count` rather than `sec` to place a line: after the wall clock is stepped back, the same `sec` can appear twice.
`w` is measured on a clock that wall-clock adjustments do not move, and it shows how long the increments of a line cover.
It is about one second, but a line is written up to half a second after its second ends, so `d` can differ from `n` by up to about half a second of frames, and `max` can fall outside the frames `b` counts.
While the log tag is off nothing is written, and the first line after it is turned back on covers the whole time it was off, as its `w` shows.

The `pts` is the one the origin gave the frame, on the origin and on an edge that pulls from it and passes the track through without transcoding, so both name the frame alike.
On a track an edge transcodes, or on an edge further down a chain of edges, it is not the origin's pts and does not match the origin's log.
A `pts` written as `pts ~<pts>` is approximate: it is usually the largest frame's own pts, and otherwise that of a frame that raised the maximum at about the same moment.
`pts n/a` means no pts was found for the maximum: its frame had none, or none could be read for it.
In the rare second whose frames left no maximum that could be read, `max` is written as `max=n/a`.

### `frame_latency`

Empty unless `Modules > Measurements > FrameLatency` is enabled. See [Frame latency](#frame-latency) for the points and spans.

| Metric                                                 | Type      | Description                                                                                                                                                                             |
| ------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ome_track_ingest_latency_seconds`                     | histogram | `ingest`: the server this edge pulls from receiving the frame to writing it to this edge. One observation per frame.                                                                    |
| `ome_track_relay_latency_seconds`                      | histogram | `relay`: the server this edge pulls from writing the frame to this edge receiving its first fragment. One observation per frame.                                                        |
| `ome_track_egress_latency_seconds`                     | histogram | `egress`: this server receiving the frame to handing its last RTP packet to the send path of a WebRTC viewer. One observation per frame per viewer.                                     |
| `ome_track_end_to_end_latency_seconds`                 | histogram | `end_to_end`: the server this edge pulls from receiving the frame to this server handing its last RTP packet to the send path of a WebRTC viewer. One observation per frame per viewer. |
| `ome_track_<span>_latency_excluded_observations_total` | counter   | Observations of a span left out of its histogram, by `reason`: `negative` or `unmeasured` (`egress` has only `negative`).                                                               |
| `ome_frame_latency_buckets_info`                       | info      | The histogram bounds this server uses, in the `bounds` label. Emitted only while at least one stream is in scope.                                                                       |

### `session_latency` (opt-in)

Empty unless `Modules > Measurements > FrameLatency` is enabled. Covers WebRTC viewer sessions only.

| Metric                               | Type    | Description                                                                                                                                                     |
| ------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ome_session_egress_latency_seconds` | summary | This WebRTC viewer's own `egress` span, per track, as `_count` and `_sum` (no quantiles). Negative spans are left out. Up to 32 tracks per session are counted. |

### HTTP request timing

OvenMediaEngine times every HTTP request it serves on its HTTP ports (LL-HLS, HLS, thumbnails, WHIP, the REST API, and `/v2/metrics` itself), from the moment the request arrives to the moment OvenMediaEngine starts sending the response.
WebSocket connections, such as WebRTC signalling, are not timed.
A request is counted once its headers are complete, so a connection that closes before that is not counted.
Each request, and each stream of an HTTP/2 connection, is recorded once: as answered, as unanswered with a reason, or, until then, as in progress.

- Timing starts when the HTTP layer has the first data of the request: for HTTP/1.1 the first piece it reads, and for HTTP/2 the first complete frame of the stream, usually its HEADERS frame.
- Included: receiving the rest of the request, waiting in a stream worker queue, and anything OvenMediaEngine waits for while handling the request, such as an admission webhook or an edge pulling the stream from its origin.
- Not included: connection setup, receiving and decrypting that first data, sending the response (header serialization, TLS encryption, the network, and the client's download), and the idle time between requests on a keep-alive connection.

So the value is a lower bound of the time to first byte a player sees.

LL-HLS defers a request for a playlist or part that does not exist yet until it does (blocking playlist reload and preload hints).
Such a request has `held="true"`, and its wait is normal.
For LL-HLS, `ome_http_request_processing_seconds` starts when the request became due, which for a held request is when the playlist update that woke it was made, so it shows how long OvenMediaEngine took to answer once it could, including the wait for a worker to pick that update up.
For a request that was not held, the processing time equals the duration.

| Label         | Values                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handler`     | The handler that took the request: `llhls`, `hlsv3`, `thumbnail`, `whip`, `api`, or `none` when no handler matched and the server answered `404`. `unknown` is not expected and means a handler that is not tagged.                                                                                                                                                                                      |
| `kind`        | `llhls`: `master_playlist`, `media_playlist`, `partial_segment`, `segment`, `init_segment`. `hlsv3`: `master_playlist`, `media_playlist`, `segment`. `thumbnail`: `image`. `whip`: `offer` (POST), `ice` (PATCH), `teardown` (DELETE). `api`: `rest`, or `metrics` for any `/v2/metrics` path. Any handler: `preflight` (OPTIONS). `other` for a request the rules above do not match (never for `api`). |
| `held`        | `true` when LL-HLS deferred the request until its media existed.                                                                                                                                                                                                                                                                                                                                         |
| `status_code` | The status code sent, or `other` for a code OvenMediaEngine does not define. Answered requests only.                                                                                                                                                                                                                                                                                                     |
| `reason`      | `ome_http_requests_unanswered_total` only: `cancelled` (HTTP/2 `RST_STREAM`), `connection_closed`, `send_failed`, or `dropped` (OvenMediaEngine discarded the request, for example because the stream stopped while the request was held).                                                                                                                                                               |

- The histograms, `ome_http_requests_unanswered_total`, and `ome_http_requests_in_progress` cover the whole server and appear only on the root path, `/v2/metrics`, so scraping several paths does not count them twice.
- The per-stream summaries count only the requests matched to a stream.
  The other requests are in the histograms only, such as a CORS preflight, a request that a signed policy or an admission webhook rejected, a request for a stream that does not exist, a failed WHIP offer, a WHIP teardown (which deletes its stream), and API requests (`handler="api"`).
- `ome_http_requests_unanswered_total` has no stream labels, so a request dropped because its stream stopped is still counted after the stream is gone.
- A stream's series disappear when the stream is deleted, so apply `rate()` before `sum()`.
- The histogram bounds are fixed: `0.0001`, `0.00025`, `0.0005`, `0.001`, `0.0025`, `0.005`, `0.01`, `0.025`, `0.05`, `0.1`, `0.25`, `0.5`, `1.0`, `2.5`, `5.0`, `10.0`, `30.0`, `60.0` seconds.
- The server-wide families start with the usual series of each enabled handler, such as `kind="partial_segment"` with `status_code="200"` for LL-HLS.
  Any other series, and every per-stream and per-session series, appears when its first request is recorded, so `rate()` and `increase()` miss that first increase.
- `cancelled` is normal for LL-HLS, because players cancel preload hints, and `connection_closed` rises when a viewer leaves with a request outstanding, which an LL-HLS viewer almost always has; `dropped` is the reason to alert on.
- `ome_http_requests_in_progress{handler="api"}` is at least 1, because the scrape itself is in progress.
- When a stream stops, a request it had queued but not handled yet ends as `dropped` on HTTP/1.1, but on HTTP/2 it stays in progress until the player cancels it (`cancelled`) or closes the connection (`connection_closed`).
- With `StreamWorkerCount` set to `0`, a request LL-HLS holds when its stream stops ends as `connection_closed` when the player leaves, instead of `dropped`.
- The `Elapsed` value that the `HTTP.Server` log tag writes when a request ends (at `trace` level, or `error` for a status other than 2xx and 3xx) is measured on the wall clock up to the start of the last response write, so it does not match these values exactly.

The `HTTP.Timing` log tag names the requests behind the numbers.

- At the default `info` level, every 10-second window that had a dropped request, or a request over 0.25 seconds in processing time for LL-HLS and in duration for other handlers, gets a `warn` line per `handler`, `kind`, and `held`.
  The line has the counts (`slow`, `dropped`) and the slowest request, or one dropped request: its `id`, the status and `total`/`wait`/`processing` in milliseconds (`waited` for a dropped request), arrival time, stream, session, client, HTTP version, method, and path.
  A field the log does not know is `-`: `stream` and `session` for a request not matched to one, and for some dropped requests also `id`, arrival time, client, HTTP version, method, and path.
  The `slow` counts add up to `_count - _bucket{le="0.25"}` of the processing histogram for LL-HLS and of the duration histogram for the other handlers.
  The windows are 10 seconds long but not aligned to the clock, so the time a line names can be any second.
- With the tag at `debug`, every 1-second window in which a `handler`, `kind`, and `held` had answered requests also gets a line, starting with those three and then the second in which the window starts as `sec=<Unix seconds>` and the time since the previous line as `w=<milliseconds>`:

| Field   | Meaning                                                                                                                                                              |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `n`     | Requests answered in that window                                                                                                                                     |
| `max`   | The longest time in that window, in milliseconds (processing time for LL-HLS, duration for other handlers), with the request `id`, `status`, `stream`, and `session` |
| `count` | The histogram `_count` when the line was written, summed over status codes                                                                                           |
| `d`     | What `_count` added since the previous line                                                                                                                          |
| `mean`  | The mean of the values added since the previous line, in milliseconds                                                                                                |
| `b`     | The buckets filled since the previous line, as `<upper bound in seconds>:<requests>` (only the ones that are not zero)                                               |

The first line of a `handler`, `kind`, and `held` has no `w` and covers everything since the server started, so the `d` of all its lines add up to its `count`.
Query strings are not logged, except the LL-HLS directives `_HLS_msn` and `_HLS_part`, because a query string can carry secrets such as signed policy tokens.

```text
Slow HTTP requests in 14:22:57 +10s: handler=llhls kind=partial_segment held=true slow=37 dropped=0 max: id=Ab3xK9q status=200 total=812.4ms wait=430.1ms processing=382.3ms arrived=14:23:05.900 stream=default/app/stream session=1830233551 client=203.0.113.7:51234/tcp http=2 GET /app/stream/part_1_2045_3_video_LMOikNC1_llhls.m4s
llhls/partial_segment held=false sec=1793723164 w=1001ms: n=1 max=0.3ms (id=cql5vwM status=200 stream=default/app/stream session=101) count=20 d=1 mean=0.3ms b=0.0005:1
```

#### Configuration

```xml
<Server>
    <Modules>
        <Measurements>
            <HTTPRequestTiming>
                <Enable>true</Enable>
            </HTTPRequestTiming>
        </Measurements>
    </Modules>
</Server>
```

- `<Enable>` (default `false`): turns the timing on for the whole server.
  While it is off, no request is timed, and neither the `http` families nor the `HTTP.Timing` lines are written.
  It is read at startup, so a change takes effect after a restart.

### `http`

Empty unless `Modules > Measurements > HTTPRequestTiming` is enabled.
See [HTTP request timing](#http-request-timing) for what is measured and the labels.

| Metric                                       | Type      | Description                                                                                                                                                    |
| -------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ome_http_request_duration_seconds`          | histogram | Time from a request arriving to the start of its response, server-wide, by `handler`, `kind`, `held`, and `status_code`. Includes LL-HLS waits.                |
| `ome_http_request_processing_seconds`        | histogram | LL-HLS only: time from the request becoming due (when it arrived, or when the playlist update that woke a held request was made) to the start of its response. |
| `ome_stream_http_request_duration_seconds`   | summary   | Per-stream count and sum of `ome_http_request_duration_seconds`, for the requests matched to the stream (no quantiles).                                        |
| `ome_stream_http_request_processing_seconds` | summary   | Per-stream count and sum of `ome_http_request_processing_seconds` (LL-HLS only).                                                                               |
| `ome_http_requests_unanswered_total`         | counter   | Requests that ended before OvenMediaEngine finished sending the response, server-wide, by `reason`. Not counted in the histograms.                             |
| `ome_http_requests_in_progress`              | gauge     | Requests that have arrived and not yet been answered or ended, by `handler`. Includes held LL-HLS requests and the scrape that reads the value.                |

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

# Frame latency. Keep each range ([5m], [2m]) at least four times your scrape interval,
# or rate() and increase() can return nothing.

# Frame latency: 95th percentile over 5 minutes, by media
histogram_quantile(0.95, sum by (le, media) (rate(ome_track_end_to_end_latency_seconds_bucket[5m])))

# Frame latency: share of frames above 200 ms
1 - rate(ome_track_end_to_end_latency_seconds_bucket{le="0.2"}[5m]) / ignoring(le) rate(ome_track_end_to_end_latency_seconds_count[5m])

# Frame latency alert: more than 10 frames above 500 ms in 2 minutes
increase(ome_track_end_to_end_latency_seconds_count[2m]) - ignoring(le) increase(ome_track_end_to_end_latency_seconds_bucket{le="0.5"}[2m]) > 10

# HTTP: requests slower than 250 ms per minute, by handler and kind
# (processing time for LL-HLS, whose held requests wait by design, and duration for the other handlers)
(
  sum by (handler, kind) (increase(ome_http_request_processing_seconds_count[1m]))
  - sum by (handler, kind) (increase(ome_http_request_processing_seconds_bucket{le="0.25"}[1m]))
)
or
(
  sum by (handler, kind) (increase(ome_http_request_duration_seconds_count{handler!="llhls"}[1m]))
  - sum by (handler, kind) (increase(ome_http_request_duration_seconds_bucket{handler!="llhls", le="0.25"}[1m]))
)

# HTTP: 99th percentile processing time of LL-HLS parts
histogram_quantile(0.99, sum by (le) (rate(ome_http_request_processing_seconds_bucket{kind="partial_segment"}[5m])))

# HTTP: mean processing time per stream
sum by (vhost, app, stream) (rate(ome_stream_http_request_processing_seconds_sum[5m])) / sum by (vhost, app, stream) (rate(ome_stream_http_request_processing_seconds_count[5m]))

# HTTP: requests OvenMediaEngine dropped
sum by (handler, kind) (increase(ome_http_requests_unanswered_total{reason="dropped"}[5m])) > 0
```

Stream-level series (`ome_connections`, `ome_receive_bytes_total`, `ome_transmit_bytes_total`, `ome_stream_rtt_seconds`) are emitted both for the input stream and for each output rendition. Match `output_stream=""` to select the input-side aggregate once and avoid double-counting across renditions.

## Compression

If the scraper sends `Accept-Encoding: gzip`, the response is gzip-compressed and returned with `Content-Encoding: gzip`.

## Format notes

The output conforms to OpenMetrics 1.0.0:

- One `# TYPE` line per metric family, followed by `# UNIT` when the family has a unit, then `# HELP`.
- Counter samples end with `_total` and info samples with `_info`; the family name on the `#` lines has no such suffix.
- Values use base units (`_bytes`, `_seconds`).
- No per-sample timestamps.
- The document is terminated by a single `# EOF` line.

A minimal scrape looks like:

```text
# TYPE ome_build info
# HELP ome_build OvenMediaEngine build information.
ome_build_info{version="...",git_version="..."} 1
# TYPE process_start_time_seconds gauge
# UNIT process_start_time_seconds seconds
# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
process_start_time_seconds 1783445283.19
# EOF
```
