---
title: Enhanced Alert
description: "Detect stream and system anomalies and send notifications with OvenMediaEngine Enterprise Enhanced Alert."
enterprise_only: true
sidebar_position: 121
---

Enhanced Alert is a module that can detect anomalies and patterns of interest in a stream or system and send notifications to users. Anomalies and patterns of interest can be set through predefined rules, and when detected, the module sends an HTTP(S) request to the user's notification server.

## Configuring Enhanced Alert

Enhanced Alert can be set up on `<Server>`, as shown below:

```xml
<Server version="8">
	<Alert>
		<Webhooks>
			<Webhook>
				<Url>http://192.168.0.161:9595/alert/notification</Url>
				<SecretKey>1234</SecretKey>
				<Timeout>3000</Timeout>
			</Webhook>
			<Webhook>
				<Url>http://192.168.0.162:9595/alert/notification</Url>
				<SecretKey>5678</SecretKey>
				<HashAlgorithm>SHA-256</HashAlgorithm>
			</Webhook>
		</Webhooks>
		<RulesFile>AlertRules.xml</RulesFile>
		<Rules>
			<Ingress>
				<StreamStatus />
				<MinBitrate>2000000</MinBitrate>
				<MaxBitrate>4000000</MaxBitrate>
				<MinFramerate>15</MinFramerate>
				<MaxFramerate>60</MaxFramerate>
				<MinWidth>1280</MinWidth>
				<MinHeight>720</MinHeight>
				<MaxWidth>1920</MaxWidth>
				<MaxHeight>1080</MaxHeight>
				<MinSamplerate>16000</MinSamplerate>
				<MaxSamplerate>50400</MaxSamplerate>
				<LongKeyFrameInterval />
				<HasBFrames />
			</Ingress>
			<Egress>
				<StreamStatus />
				<LLHLSReady />
				<HLSReady />
			</Egress>
			<InternalQueueCongestion />
		</Rules>
	</Alert>
</Server>
```

<table><thead><tr><th width="139.55560302734375">Key</th><th>Description</th></tr></thead><tbody><tr><td>Webhooks</td><td>A list of webhooks to receive the notifications. Notifications are sent to every <code>&#x3C;Webhook></code>.</td></tr><tr><td>RulesFile</td><td>(Optional) Manages alert detection rules in a separate external file.</td></tr><tr><td>Rules</td><td>(Optional) Defines anomalies and patterns of interest to be detected. This section is ignored if <code>&#x3C;RulesFile></code> is set.</td></tr></tbody></table>

### Webhook

<table><thead><tr><th width="139.55560302734375">Key</th><th>Description</th></tr></thead><tbody><tr><td>Url</td><td><p>The HTTP Server is to receive the notification.</p><ul><li>HTTP and HTTPS are available.</li></ul></td></tr><tr><td>SecretKey</td><td>(Optional) The secret key used to sign the notification with HMAC. For more information, see <a href="enhanced-alert.md#security">Security</a>.</td></tr><tr><td>HashAlgorithm</td><td>(Optional, Default: <code>SHA-1</code>) The hash algorithm used for the HMAC signature. <code>SHA-224</code>, <code>SHA-256</code>, <code>SHA-384</code>, <code>SHA-512</code>, <code>SHA-512/224</code> and <code>SHA-512/256</code> are also available. For more information, see <a href="../access-control-and-security/sha-2-support.md">SHA-2 Support</a>.</td></tr><tr><td>Timeout</td><td>(Optional, Default: 3000) Time to wait for a response after the request (in milliseconds). Must be greater than 0.</td></tr></tbody></table>

:::warning

`<Url>`, `<SecretKey>`, `<Timeout>` and `<HashAlgorithm>` set directly under `<Alert>` are deprecated and will be removed in a future release. During the deprecation period they still work as a single webhook. Please use `<Webhooks>` instead.

:::

:::info

Notifications are sent to each webhook sequentially, and a request that fails without an HTTP response (e.g. connection timeout, network error or an internal error while sending) is retried up to 2 times. An HTTP error response (a status code other than 200) is not retried. A webhook that responds slowly or is unreachable therefore delays delivery to the webhooks after it. To keep alert delivery healthy:

* Prefer an IP address for `<Url>`, or a hostname whose DNS server is reliable — the hostname is resolved on every request and DNS resolution is not covered by `<Timeout>`.
* `<Webhook><Timeout>` must be greater than `0`. The deprecated `<Alert><Timeout>` still accepts `0`, which means waiting for a response indefinitely; avoid it.
* `<Url>` must have the form `http(s)://host[:port][/path][?query]`: `host` is a hostname, an IPv4 address or a bracketed IPv6 address, `port` (if written) is 1-65535, and `path`/`query` consist of printable ASCII characters without `#` or a second `?` (percent-encode anything else). Credentials (`user:password@`) are not supported because they would not be sent with the request; use `<SecretKey>` to authenticate the notification instead. Any other URL is rejected at startup.

:::

### Rules File

You can define anomalies and patterns of interest to be detected in a separate file. OvenMediaEngine Enterprise monitors this file for changes and applies any updates immediately without requiring a restart. If you anticipate needing to modify detection rules during service operation, we recommend using `<RulesFile>`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Rules>
	<Ingress>
		<StreamStatus />
		<MinBitrate>2000000</MinBitrate>
		<MaxBitrate>4000000</MaxBitrate>
		<MinFramerate>15</MinFramerate>
		<MaxFramerate>60</MaxFramerate>
		<MinWidth>1280</MinWidth>
		<MinHeight>720</MinHeight>
		<MaxWidth>1920</MaxWidth>
		<MaxHeight>1080</MaxHeight>
		<MinSamplerate>16000</MinSamplerate>
		<MaxSamplerate>50400</MaxSamplerate>
		<LongKeyFrameInterval />
		<HasBFrames />
	</Ingress>
	<Egress>
		<StreamStatus />
		<LLHLSReady />
		<HLSReady />
	</Egress>
	<InternalQueueCongestion />
</Rules>
```

#### Rules

<table><thead><tr><th width="140.11114501953125">Key</th><th width="200.4444580078125"></th><th>Description</th></tr></thead><tbody><tr><td>Ingress</td><td>StreamStatus</td><td>It detects the creation, standby, failure, and deletion states of a ingress stream.</td></tr><tr><td></td><td>MinBitrate</td><td>Detects when the ingress stream's video bitrate is lower than the set value.</td></tr><tr><td></td><td>MaxBitrate</td><td>Detects when the ingress stream's video bitrate is greater than the set value.</td></tr><tr><td></td><td>MinFramerate</td><td>Detects when the ingress stream's framerate is lower than the set value.</td></tr><tr><td></td><td>MaxFramerate</td><td>Detects when the ingress stream's framerate is greater than the set value.</td></tr><tr><td></td><td>MinWidth</td><td>Detects when the ingress stream's width is lower than the set value.</td></tr><tr><td></td><td>MaxWidth</td><td>Detects when the ingress stream's width is greater than the set value.</td></tr><tr><td></td><td>MinHeight</td><td>Detects when the ingress stream's height is lower than the set value.</td></tr><tr><td></td><td>MaxHeight</td><td>Detects when the ingress stream's height is greater than the set value.</td></tr><tr><td></td><td>MinSamplerate</td><td>Detects when the ingress stream's audio samplerate is lower than the set value.</td></tr><tr><td></td><td>MaxSamplerate</td><td>Detects when the ingress stream's audio samplerate is greater than the set value.</td></tr><tr><td></td><td>LongKeyFrameInterval</td><td>Detects when the ingress stream's keyframe interval is too long (exceeds 4 seconds).</td></tr><tr><td></td><td>HasBFrames</td><td>Detects when there are B-frames in the ingress stream.</td></tr><tr><td>Egress</td><td>StreamStatus</td><td>It detects the creation, standby, failure, and deletion states of a egress stream.</td></tr><tr><td></td><td>LLHLSReady</td><td>Detects the point in time when Low-Latency HLS playback becomes available.</td></tr><tr><td></td><td>HLSReady</td><td>Detects the point in time when HLS playback becomes available.</td></tr><tr><td></td><td>TranscodeStatus</td><td>Detects decoding, encoding, and filtering failure states during egress stream transcoding.</td></tr><tr><td>InternalQueueCongestion</td><td></td><td>Detect when internal queues become congested.</td></tr><tr><td>Anomaly</td><td>DTSReversal</td><td>Detects cases where DTS is not monotonically increasing.</td></tr><tr><td></td><td>DTSJump</td><td>Detects cases where DTS increases abruptly between consecutive frames.</td></tr><tr><td></td><td>DTSDuplication</td><td>Detects cases where DTS is the same between consecutive frames.</td></tr><tr><td></td><td>PacketTimeout</td><td>Detects when no packets are received for a specified period of time.</td></tr><tr><td></td><td>TrackPrepareTimeout</td><td>Detects when a track is not prepared in time, blocking the stream while other tracks keep arriving.</td></tr></tbody></table>

## Notification

### Request

#### Format

```http
POST /configured/target/url HTTP/1.1
Content-Length: 1037
Content-Type: application/json
Accept: application/json
X-OME-Signature: f871jd991jj1929jsjd91pqa0amm1
{
  "serverInfo": {
    "serverID": "b8e2f6a1-58f6-4451-b6f6-97f2b3ee4c39",
    "serverName": "MyEdge-01",
    "hostname": "ome-edge-01",
    "ipAddresses": ["203.0.113.10", "192.168.0.160"]
  },
  "sourceUri": "#default#app/stream",
  "messages": [
    {
      "code": "INGRESS_HAS_BFRAME",
      "description": "There are B-Frames in the ingress stream."
    },
    {
      "code": "INGRESS_BITRATE_LOW",
      "description": "The ingress stream's current bitrate (316228 bps) is lower than the configured bitrate (2000000 bps)"
    }
  ],
  "sourceInfo": {
    "connection": {
      "localAddress": "192.168.0.160",
      "localPort": 1935,
      "protocol": "TCP",
      "remoteAddress": "192.168.0.220",
      "remotePort": 10639,
      "transport": "TCP"
    },
    "createdTime": "2023-04-07T21:15:24.487+09:00",
    "name": "stream",
    "sourceType": "Rtmp",
    "sourceUrl": "TCP://192.168.0.220:10639",
    "tracks": [
      {
        "id": 0,
        "name": "Video",
        "type": "Video",
        "video": {
          "bitrate": 300000,
          "bypass": false,
          "codec": "H264",
          "framerate": 30.0,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 160000,
          "bypass": false,
          "channel": 1,
          "codec": "AAC",
          "samplerate": 48000
        },
        "id": 1,
        "name": "Audio",
        "type": "Audio"
      },
      {
        "id": 2,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "type": "INGRESS"
}
```

#### Element

Here is a detailed explanation of each element of the JSON payload:

<table><thead><tr><th width="156.5555419921875">Element</th><th>Description</th></tr></thead><tbody><tr><td>serverInfo</td><td><p>Information identifying the server that sent the notification. This is useful for distinguishing alerts when multiple OvenMediaEngine instances report to the same notification server.</p><ul><li>`serverID`: Unique ID of the server. It is generated when the server first starts and is persisted in the `Server.id` file in the configuration directory. The configuration directory must be writable for the ID to remain stable across restarts.</li><li>`serverName`: The value of `&#x3C;Server>&#x3C;Name>` in the configuration. Omitted if not set.</li><li>`hostname`: The OS hostname of the machine running OvenMediaEngine. On Kubernetes this is the pod name, and on Docker it is the container ID unless `--hostname` is specified. Omitted in the rare case that the hostname cannot be retrieved from the OS.</li><li>`ipAddresses`: IP addresses of the server, captured at server startup. The public IP addresses resolved from `&#x3C;StunServer>` (if configured) come first, followed by the local interface addresses (excluding loopback and IPv6 link-local addresses). Omitted when no address is available.</li></ul></td></tr><tr><td>messages</td><td>List of <a href="enhanced-alert.md#messages">Messages</a> detected by the <a href="enhanced-alert.md#rules">Rules</a>.</td></tr><tr><td>type</td><td>It represents the format of the JSON payload. The information of the JSON elements can vary depending on the value of the type.</td></tr><tr><td>sourceUri</td><td><p>URI information of the detected source.</p><ul><li>`INGRESS`: #&#x3C;vhost>#&#x3C;application>/&#x3C;input_stream></li><li>`EGRESS`: #&#x3C;vhost>#&#x3C;application>/&#x3C;output_stream></li><li>`ANOMALY`: #&#x3C;vhost>#&#x3C;application>/&#x3C;input_stream></li></ul></td></tr><tr><td>sourceInfo</td><td>Detailed information about the source, captured when the notification is sent. It is the stream `name` plus the fields of the `input` object in the <a href="../rest-api/v1/virtual-host/application/stream/README.md#get-stream-info">Stream REST API</a> response, at the top level, so it also includes `connection`. For a WebRTC source, `connection` is present only after ICE has selected a candidate pair, so `INGRESS_STREAM_CREATED` normally does not have it yet, while notifications sent after ICE completes, starting with `INGRESS_STREAM_PREPARED`, do. A later ICE candidate pair switch changes the value returned by the REST API and is reflected in later notifications, but does not trigger a notification of its own.</td></tr><tr><td>parentSourceUri</td><td><p>It provides the URI information of the parent-level source associated with the detected source.</p><ul><li>`INGRESS`: #&#x3C;vhost>#&#x3C;application>/&#x3C;input_stream></li><li>`EGRESS`: #&#x3C;vhost>#&#x3C;application>/&#x3C;output_stream></li></ul></td></tr><tr><td>parentSourceInfo</td><td>Provides details of the parent-level source associated with the detected source. If detailed information is unavailable, this field helps trace the source through its parent connection. It has the same shape as `sourceInfo`, so it includes `connection` when the parent is a pushed ingress stream (WebRTC, RTMP, SRT, MPEG-TS); other source types do not report one.</td></tr></tbody></table>

#### Messages

<table><thead><tr><th width="140.111083984375">Type</th><th width="299.6666259765625">Code</th><th>Description</th></tr></thead><tbody><tr><td>INGRESS</td><td>INGRESS_STREAM_CREATED</td><td>A new ingress stream has been created.</td></tr><tr><td></td><td>INGRESS_STREAM_PREPARED</td><td>A ingress stream has been prepared.</td></tr><tr><td></td><td>INGRESS_STREAM_DELETED</td><td>A ingress stream has been deleted.</td></tr><tr><td></td><td>INGRESS_STREAM_CREATION_FAILED_DUPLICATE_NAME</td><td>Failed to create stream because the specified stream name is already in use.</td></tr><tr><td></td><td>INGRESS_BITRATE_LOW</td><td>The ingress stream's current video bitrate (`%d` bps) is lower than the configured bitrate (`%d` bps).</td></tr><tr><td></td><td>INGRESS_BITRATE_HIGH</td><td>The ingress stream's current video bitrate (`%d` bps) is higher than the configured bitrate (`%d` bps).</td></tr><tr><td></td><td>INGRESS_FRAMERATE_LOW</td><td>The ingress stream's current framerate (`%.2f` fps) is lower than the configured framerate (`%.2f` fps).</td></tr><tr><td></td><td>INGRESS_FRAMERATE_HIGH</td><td>The ingress stream's current framerate (`%f` fps) is higher than the configured framerate (`%f` fps).</td></tr><tr><td></td><td>INGRESS_WIDTH_SMALL</td><td>The ingress stream's width (`%d`) is smaller than the configured width (`%d`).</td></tr><tr><td></td><td>INGRESS_WIDTH_LARGE</td><td>The ingress stream's width (`%d`) is larger than the configured width (`%d`).</td></tr><tr><td></td><td>INGRESS_HEIGHT_SMALL</td><td>The ingress stream's height (`%d`) is smaller than the configured height (`%d`).</td></tr><tr><td></td><td>INGRESS_HEIGHT_LARGE</td><td>The ingress stream's height (`%d`) is larger than the configured height (`%d`).</td></tr><tr><td></td><td>INGRESS_SAMPLERATE_LOW</td><td>The ingress stream's current audio samplerate (`%d`) is lower than the configured samplerate (`%d`).</td></tr><tr><td></td><td>INGRESS_SAMPLERATE_HIGH</td><td>The ingress stream's current audio samplerate (`%d`) is higher than the configured samplerate (`%d`).</td></tr><tr><td></td><td>INGRESS_LONG_KEY_FRAME_INTERVAL</td><td>The ingress stream's current keyframe interval (`%.1f` seconds) is too long. Please use a keyframe interval of 4 seconds or less.</td></tr><tr><td></td><td>INGRESS_HAS_BFRAME</td><td>There are B-frames in the ingress stream.</td></tr><tr><td>EGRESS</td><td>EGRESS_STREAM_CREATED</td><td>A new egress stream has been created.</td></tr><tr><td></td><td>EGRESS_STREAM_PREPARED</td><td>A egress stream has been prepared.</td></tr><tr><td></td><td>EGRESS_STREAM_DELETED</td><td>A egress stream has been deleted.</td></tr><tr><td></td><td>EGRESS_STREAM_CREATION_FAILED_OUTPUT_PROFILE</td><td>Failed to create egress stream because the output profile configuration is invalid</td></tr><tr><td></td><td>EGRESS_STREAM_CREATION_FAILED_DECODER</td><td>Failed to create egress stream because the decoder could not be created</td></tr><tr><td></td><td>EGRESS_STREAM_CREATION_FAILED_ENCODER</td><td>Failed to create egress stream because the encoder could not be created</td></tr><tr><td></td><td>EGRESS_STREAM_CREATION_FAILED_FILTER</td><td>Failed to create egress stream because the filter could not be created</td></tr><tr><td></td><td>EGRESS_LLHLS_READY</td><td>Low-Latency HLS stream is ready to play - initial segment(s) have been generated.</td></tr><tr><td></td><td>EGRESS_HLS_READY</td><td>HLS stream is ready to play - initial segment(s) have been generated.</td></tr><tr><td></td><td>EGRESS_TRANSCODE_FAILED_DECODING</td><td>Failed to transcode the egress stream due to a frame decoding failure.</td></tr><tr><td></td><td>EGRESS_TRANSCODE_FAILED_ENCODING</td><td>Failed to transcode the egress stream due to a frame encoding failure.</td></tr><tr><td></td><td>EGRESS_TRANSCODE_FAILED_FILTERING</td><td>Failed to transcode the egress stream due to a frame filtering failure.</td></tr><tr><td>INTERNAL_QUEUE</td><td>INTERNAL_QUEUE</td><td>Internal queue(s) is currently congested</td></tr><tr><td>ANOMALY</td><td>ANOMALY_DTS_REVERSAL_DETECTED</td><td>DTS has been reversed by `%lld`.</td></tr><tr><td></td><td>ANOMALY_DTS_JUMP_DETECTED</td><td>DTS has increased significantly by `%lld`.</td></tr><tr><td></td><td>ANOMALY_DTS_DUPLICATION_DETECTED</td><td>DTS has been duplicated `%d` times.</td></tr><tr><td></td><td>ANOMALY_PACKET_TIMEOUT_DETECTED</td><td>No packets have been received for `%lld`ms.</td></tr></tbody></table>

#### Additional Element (`INGRESS_STREAM_DELETED`)

When an ingress stream is deleted, the notification payload includes `extraInfo.deletedReason` and `extraInfo.deletedReasonMessage` to indicate why the stream was removed.

<table><thead><tr><th width="220.0">deletedReason</th><th width="360.0">deletedReasonMessage</th><th>Description</th></tr></thead><tbody><tr><td><code>IngressDisconnected</code></td><td><code>Ingress client disconnected normally.</code></td><td>The ingress client closed the connection normally (e.g., an RTMP encoder stopped streaming).</td></tr><tr><td><code>NetworkError</code></td><td><code>Transport connection failed.</code></td><td>The ingress stream was interrupted due to a network, session, or transport layer error.</td></tr><tr><td><code>DuplicateStream</code></td><td><code>Existing stream was replaced by a new stream with the same name.</code></td><td>A new ingress with the same stream name arrived and replaced the existing stream.</td></tr><tr><td><code>NoViewersTimeout</code></td><td><code>No viewers were attached within the configured timeout.</code></td><td>A pull-based stream was cleaned up because no viewers connected within the configured timeout.</td></tr><tr><td><code>InputTimeout</code></td><td><code>No input packets were received within the configured timeout.</code></td><td>The stream was removed because no input packets arrived within the configured timeout period.</td></tr><tr><td><code>PolicyExpired</code></td><td><code>Stream lifetime policy expired.</code></td><td>A signed policy or other lifetime restriction for the stream expired.</td></tr><tr><td><code>AnomalyDetected</code></td><td>(dynamic message describing the anomaly)</td><td>An anomaly detection rule triggered a <code>TerminateStream</code> action and stopped the stream.</td></tr><tr><td><code>ApiRequested</code></td><td><code>Deleted by API request.</code></td><td>The stream was explicitly deleted by an API call.</td></tr><tr><td><code>UpstreamError</code></td><td><code>Upstream source failed.</code></td><td>The upstream source itself failed, making it impossible to maintain the stream.</td></tr><tr><td><code>ConfigChanged</code></td><td><code>Configuration changed and the stream was replaced.</code></td><td>The stream was deleted because its configuration was updated and the stream was replaced.</td></tr><tr><td><code>ConfigDeleted</code></td><td><code>Configuration file was deleted.</code></td><td>The configuration file or entry was removed, causing the stream to be deleted.</td></tr><tr><td><code>InternalError</code></td><td><code>Stream was removed due to an internal error.</code></td><td>Fallback reason used when no other reason was classified before the alert was serialized. This should not occur under normal circumstances.</td></tr></tbody></table>

**Example:**

```json
{
  "type": "INGRESS",
  "sourceUri": "#default#app/stream",
  "messages": [
    {
      "code": "INGRESS_STREAM_DELETED",
      "description": "A ingress stream has been deleted"
    }
  ],
  "sourceInfo": {
    ...
  },
  "extraInfo": {
    "deletedReason": "IngressDisconnected",
    "deletedReasonMessage": "Ingress client disconnected normally."
  }
}
```

#### Additional Element (`EGRESS_STREAM_CREATION_FAILED`)

The following provides additional information when an Egress Stream creation fails.

**Egress Stream Failure Example:**

<details>

<summary>#01 When output track creation fails:</summary>

```json
{
  "type": "EGRESS",
  "parentSourceUri": "#default#app/stream1",
  "parentSourceInfo": {
    "createdTime": "2025-12-13T02:19:59.256+09:00",
    "name": "stream1",
    "sourceType": "Scheduled",
    "tracks": [
      {
        "id": 0,
        "name": "Video",
        "type": "Video",
        "video": {
          "bitrate": 3898586,
          "bitrateAvg": 0,
          "bitrateConf": 3898586,
          "bitrateLatest": 0,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 1,
          "framerate": 60.0,
          "framerateAvg": 0.0,
          "framerateConf": 60.0,
          "framerateLatest": 0.0,
          "hasBframes": false,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 127999,
          "bitrateAvg": 0,
          "bitrateConf": 127999,
          "bitrateLatest": 0,
          "bypass": false,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 100,
        "name": "Audio",
        "type": "Audio"
      },
      {
        "id": 200,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "messages": [
    {
      "code": "EGRESS_STREAM_CREATION_FAILED_BY_OUTPUT_PROFILE",
      "description": "Failed to create egress stream because the output profile configuration is invalid"
    }
  ],
  "extraInfo": {
    "outputProfile": {
      "encodes": {
        "audios": [
          {
            "bypass": "true",
            "name": "bypass_audio"
          },
          {
            "bitrate": "128000",
            "bypassIfMatch": {
              "codec": "eq"
            },
            "channel": "2",
            "codec": "opus",
            "name": "opus_audio",
            "samplerate": "48000"
          }
        ],
        "videos": [
          {
            "bypass": "true",
            "name": "bypass_video"
          },
          {
            "bFrames": "2",
            "bitrate": "7000000",
            "codec": "h264",
            "framerate": "60",
            "height": "1080",
            "keyFrameInterval": "120",
            "name": "video_1080",
            "preset": "faster",
            "profile": "high",
            "width": "1920"
          }
        ]
      },
      "name": "high",
      "outputStreamName": "${OriginStreamName}"
    }
  }
}
```

</details>

<details>

<summary>#02-1 When decoder creation fails:</summary>

```json
{
  "type": "EGRESS",
  "parentSourceUri": "#default#app/stream1",
  "parentSourceInfo": {
    "createdTime": "2025-12-13T02:14:34.972+09:00",
    "name": "stream1",
    "sourceType": "Scheduled",
    "tracks": [
      {
        "id": 0,
        "name": "Video",
        "type": "Video",
        "video": {
          "bitrate": 3898586,
          "bitrateAvg": 0,
          "bitrateConf": 3898586,
          "bitrateLatest": 0,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 1,
          "framerate": 60.0,
          "framerateAvg": 0.0,
          "framerateConf": 60.0,
          "framerateLatest": 0.0,
          "hasBframes": false,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 127999,
          "bitrateAvg": 0,
          "bitrateConf": 127999,
          "bitrateLatest": 0,
          "bypass": false,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 100,
        "name": "Audio",
        "type": "Audio"
      },
      {
        "id": 200,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "messages": [
    {
      "code": "EGRESS_STREAM_CREATION_FAILED_BY_DECODER",
      "description": "Failed to create egress stream because the decoder could not be created"
    }
  ],
  "extraInfo": {
    "codecModule": {
      "busId": "-",
      "displayName": "FFmpeg Video Codecs",
      "id": 0,
      "isDecoder": true,
      "isDefault": true,
      "isEncoder": false,
      "isHwAccel": false,
      "mediaType": "Video",
      "metrics": {
        "active": {
          "decoder": 0,
          "encoder": 0
        }
      },
      "module": "default",
      "name": "default:0",
      "supportedCodecs": [
        "H264",
        "H265",
        "VP8"
      ]
    },
    "parentSourceTrackId": 0
  }
}
```

</details>

<details>

<summary>#02-2 When encoder creation fails:</summary>

```json
{
  "extraInfo": {
    "codecModule": {
      "busId": "00000000:3B:00.0",
      "displayName": "NVIDIA GeForce GTX 1050",
      "id": 0,
      "isDecoder": true,
      "isDefault": false,
      "isEncoder": true,
      "isHwAccel": true,
      "mediaType": "Video",
      "metrics": {
        "active": {
          "decoder": 0,
          "encoder": 0
        }
      },
      "module": "nv",
      "name": "nv:0",
      "supportedCodecs": [
        "H264",
        "H265"
      ]
    },
    "outputProfile": {
      "encodes": {
        "audios": [
          {
            "bypass": "true",
            "name": "bypass_audio"
          },
          {
            "bitrate": "128000",
            "bypassIfMatch": {
              "codec": "eq"
            },
            "channel": "2",
            "codec": "opus",
            "name": "opus_audio",
            "samplerate": "48000"
          }
        ],
        "videos": [
          {
            "bypass": "true",
            "name": "bypass_video"
          },
          {
            "bFrames": "2",
            "bitrate": "7000000",
            "codec": "h264",
            "framerate": "60",
            "height": "1080",
            "keyFrameInterval": "120",
            "name": "video_1080",
            "preset": "faster",
            "profile": "high",
            "width": "1920"
          }
        ]
      },
      "name": "high",
      "outputStreamName": "${OriginStreamName}"
    },
    "parentSourceTrackId": 0,
    "sourceTrackId": 1
  },
  "messages": [
    {
      "code": "EGRESS_STREAM_CREATION_FAILED_ENCODER",
      "description": "Failed to create stream because the encoder could not be created"
    }
  ],
  "parentSourceInfo": {
    "connection": {
      "localAddress": "192.168.0.160",
      "localPort": 1935,
      "protocol": "TCP",
      "remoteAddress": "192.168.0.245",
      "remotePort": 3805,
      "transport": "TCP"
    },
    "createdTime": "2025-12-15T11:55:50.029+09:00",
    "name": "stream1",
    "sourceType": "Rtmp",
    "sourceUrl": "TCP://192.168.0.245:3805",
    "tracks": [
      {
        "id": 0,
        "name": "Video",
        "type": "Video",
        "video": {
          "bitrate": 30000000,
          "bitrateAvg": 0,
          "bitrateConf": 30000000,
          "bitrateLatest": 0,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 24,
          "framerate": 60.0,
          "framerateAvg": 0.0,
          "framerateConf": 60.0,
          "framerateLatest": 0.0,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 160000,
          "bitrateAvg": 0,
          "bitrateConf": 160000,
          "bitrateLatest": 0,
          "bypass": false,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 1,
        "name": "Audio",
        "type": "Audio"
      },
      {
        "id": 2,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "parentSourceUri": "#default#app/stream1",
  "sourceInfo": {
    "createdTime": "2025-12-15T11:55:50.048+09:00",
    "name": "stream1",
    "sourceType": "Transcoder",
    "sourceUrl": "da4da9dc-4e0f-41de-b623-4a8f3ed8a4c5/#default#app/stream1/i",
    "tracks": [
      {
        "id": 0,
        "name": "bypass_video",
        "type": "Video",
        "video": {
          "bitrate": 30000000,
          "bitrateAvg": 0,
          "bitrateConf": 30000000,
          "bitrateLatest": -1980852460,
          "bypass": true,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 23,
          "framerate": 60.0,
          "framerateAvg": 0.0,
          "framerateConf": 60.0,
          "framerateLatest": 0.0,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "id": 1,
        "name": "video_1080",
        "type": "Video",
        "video": {
          "bitrate": 7000000,
          "bitrateAvg": 0,
          "bitrateConf": 7000000,
          "bitrateLatest": 123084383,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 0,
          "framerate": 60.0,
          "framerateAvg": 0.0,
          "framerateConf": 60.0,
          "framerateLatest": 0.0,
          "hasBframes": false,
          "height": 1080,
          "keyFrameInterval": 120.0,
          "keyFrameIntervalAvg": 0.0,
          "keyFrameIntervalConf": 120.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 160000,
          "bitrateAvg": 0,
          "bitrateConf": 160000,
          "bitrateLatest": -374024710,
          "bypass": true,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 2,
        "name": "bypass_audio",
        "type": "Audio"
      },
      {
        "audio": {
          "bitrate": 128000,
          "bitrateAvg": 0,
          "bitrateConf": 128000,
          "bitrateLatest": -1130268890,
          "bypass": false,
          "channel": 2,
          "codec": "OPUS",
          "samplerate": 48000
        },
        "id": 3,
        "name": "opus_audio",
        "type": "Audio"
      },
      {
        "id": 4,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "sourceUri": "#default#app/stream1",
  "type": "EGRESS"
}
```

</details>

<details>

<summary>#02-3 When filter creation fails:</summary>

```json
{
  "extraInfo": {
    "codecModule": {
      "busId": "00000000:3B:00.0",
      "displayName": "NVIDIA GeForce GTX 1050",
      "id": 0,
      "isDecoder": true,
      "isDefault": false,
      "isEncoder": true,
      "isHwAccel": true,
      "mediaType": "Video",
      "metrics": {
        "active": {
          "decoder": 0,
          "encoder": 1
        }
      },
      "module": "nv",
      "name": "nv:0",
      "supportedCodecs": [
        "H264",
        "H265"
      ]
    },
    "outputProfile": {
      "encodes": {
        "audios": [
          {
            "bypass": "true",
            "name": "bypass_audio"
          },
          {
            "bitrate": "128000",
            "bypassIfMatch": {
              "codec": "eq"
            },
            "channel": "2",
            "codec": "opus",
            "name": "opus_audio",
            "samplerate": "48000"
          }
        ],
        "videos": [
          {
            "bypass": "true",
            "name": "bypass_video"
          },
          {
            "bFrames": "2",
            "bitrate": "7000000",
            "codec": "h264",
            "framerate": "60",
            "height": "1080",
            "keyFrameInterval": "120",
            "name": "video_1080",
            "preset": "faster",
            "profile": "high",
            "width": "1920"
          }
        ]
      },
      "name": "high",
      "outputStreamName": "${OriginStreamName}"
    },
    "parentSourceTrackId": 0,
    "sourceTrackId": 1
  },
  "messages": [
    {
      "code": "EGRESS_STREAM_CREATION_FAILED_FILTER",
      "description": "Failed to create stream because the filter could not be created"
    }
  ],
  "parentSourceInfo": {
    "connection": {
      "localAddress": "192.168.0.160",
      "localPort": 1935,
      "protocol": "TCP",
      "remoteAddress": "192.168.0.245",
      "remotePort": 3830,
      "transport": "TCP"
    },
    "createdTime": "2025-12-15T11:57:32.668+09:00",
    "name": "stream1",
    "sourceType": "Rtmp",
    "sourceUrl": "TCP://192.168.0.245:3830",
    "tracks": [
      {
        "id": 0,
        "name": "Video",
        "type": "Video",
        "video": {
          "bitrate": 30000000,
          "bitrateAvg": 0,
          "bitrateConf": 30000000,
          "bitrateLatest": 1835102790,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 13,
          "framerate": 60.0,
          "framerateAvg": 0.0,
          "framerateConf": 60.0,
          "framerateLatest": 0.0,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 160000,
          "bitrateAvg": 0,
          "bitrateConf": 160000,
          "bitrateLatest": 695105391,
          "bypass": false,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 1,
        "name": "Audio",
        "type": "Audio"
      },
      {
        "id": 2,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "parentSourceUri": "#default#app/stream1",
  "sourceInfo": {
    "createdTime": "2025-12-15T11:57:32.683+09:00",
    "name": "stream1",
    "sourceType": "Transcoder",
    "sourceUrl": "da4da9dc-4e0f-41de-b623-4a8f3ed8a4c5/#default#app/stream1/i",
    "tracks": [
      {
        "id": 0,
        "name": "bypass_video",
        "type": "Video",
        "video": {
          "bitrate": 30000000,
          "bitrateAvg": 0,
          "bitrateConf": 30000000,
          "bitrateLatest": 842608930,
          "bypass": true,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 12,
          "framerate": 60.0,
          "framerateAvg": 0.0,
          "framerateConf": 60.0,
          "framerateLatest": 0.0,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "id": 1,
        "name": "video_1080",
        "type": "Video",
        "video": {
          "bitrate": 7000000,
          "bitrateAvg": 0,
          "bitrateConf": 7000000,
          "bitrateLatest": 0,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 0,
          "framerate": 60.0,
          "framerateAvg": 0.0,
          "framerateConf": 60.0,
          "framerateLatest": 0.0,
          "hasBframes": false,
          "height": 1080,
          "keyFrameInterval": 120.0,
          "keyFrameIntervalAvg": 0.0,
          "keyFrameIntervalConf": 120.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 160000,
          "bitrateAvg": 0,
          "bitrateConf": 160000,
          "bitrateLatest": 0,
          "bypass": true,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 2,
        "name": "bypass_audio",
        "type": "Audio"
      },
      {
        "audio": {
          "bitrate": 128000,
          "bitrateAvg": 0,
          "bitrateConf": 128000,
          "bitrateLatest": 0,
          "bypass": false,
          "channel": 2,
          "codec": "OPUS",
          "samplerate": 48000
        },
        "id": 3,
        "name": "opus_audio",
        "type": "Audio"
      },
      {
        "id": 4,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "sourceUri": "#default#app/stream1",
  "type": "EGRESS"
}
```

</details>

<details>

<summary>#03-1 When frame decoding fails:</summary>

```json
{
  "type": "EGRESS",
  "parentSourceUri": "#default#app/stream1",
  "parentSourceInfo": {
    "createdTime": "2025-12-12T18:31:41.139+09:00",
    "name": "stream1",
    "sourceType": "Scheduled",
    "tracks": [
      {
        "id": 0,
        "name": "Video",
        "type": "Video",
        "video": {
          "bitrate": 3898586,
          "bitrateAvg": 2299712,
          "bitrateConf": 3898586,
          "bitrateLatest": 2275110,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 173,
          "framerate": 60.0,
          "framerateAvg": 60.0,
          "framerateConf": 60.0,
          "framerateLatest": 60.039371490478516,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 127999,
          "bitrateAvg": 130655,
          "bitrateConf": 127999,
          "bitrateLatest": 131385,
          "bypass": false,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 100,
        "name": "Audio",
        "type": "Audio"
      },
      {
        "id": 200,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "messages": [
    {
      "code": "EGRESS_TRANSCODE_FAILED_DECODING",
      "description": "Failed to decode frames"
    }
  ],
  "extraInfo": {
    "codecModule": {
      "busId": "-",
      "displayName": "FFmpeg Audio Codecs",
      "id": 0,
      "isDecoder": true,
      "isDefault": true,
      "isEncoder": false,
      "isHwAccel": false,
      "mediaType": "Audio",
      "metrics": {
        "active": {
          "decoder": 1,
          "encoder": 0
        }
      },
      "module": "default",
      "name": "default:0",
      "supportedCodecs": [
        "AAC",
        "OPUS"
      ]
    },
    "errorCount": 50,
    "errorEvaluationWindow": 5000,
    "parentSourceTrackId": 100
  }
}
```

</details>

<details>

<summary>#03-2 When frame encoding fails:</summary>

```json
{
  "type": "EGRESS",
  "sourceUri": "#default#app/stream1",
  "sourceInfo": {
    "createdTime": "2025-12-12T18:31:41.155+09:00",
    "name": "stream1",
    "sourceType": "Transcoder",
    "sourceUrl": "da4da9dc-4e0f-41de-b623-4a8f3ed8a4c5/#default#app/stream1/i",
    "tracks": [
      {
        "id": 0,
        "name": "bypass_video",
        "type": "Video",
        "video": {
          "bitrate": 3898586,
          "bitrateAvg": 3249288,
          "bitrateConf": 3898586,
          "bitrateLatest": 2977072,
          "bypass": true,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 265,
          "framerate": 60.0,
          "framerateAvg": 60.0,
          "framerateConf": 60.0,
          "framerateLatest": 60.0,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "id": 1,
        "name": "video_1080",
        "type": "Video",
        "video": {
          "bitrate": 7000000,
          "bitrateAvg": 1591632,
          "bitrateConf": 7000000,
          "bitrateLatest": 1582415,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 9,
          "framerate": 60.0,
          "framerateAvg": 60.0,
          "framerateConf": 60.0,
          "framerateLatest": 62.376235961914062,
          "hasBframes": false,
          "height": 1080,
          "keyFrameInterval": 120.0,
          "keyFrameIntervalAvg": 80.333335876464844,
          "keyFrameIntervalConf": 120.0,
          "keyFrameIntervalLatest": 120.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 127999,
          "bitrateAvg": 130459,
          "bitrateConf": 127999,
          "bitrateLatest": 130048,
          "bypass": true,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 2,
        "name": "bypass_audio",
        "type": "Audio"
      },
      {
        "audio": {
          "bitrate": 128000,
          "bitrateAvg": 128000,
          "bitrateConf": 128000,
          "bitrateLatest": 245681,
          "bypass": false,
          "channel": 2,
          "codec": "OPUS",
          "samplerate": 48000
        },
        "id": 3,
        "name": "opus_audio",
        "type": "Audio"
      },
      {
        "id": 4,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "parentSourceUri": "#default#app/stream1",
  "parentSourceInfo": {
    "createdTime": "2025-12-12T18:31:41.139+09:00",
    "name": "stream1",
    "sourceType": "Scheduled",
    "tracks": [
      {
        "id": 0,
        "name": "Video",
        "type": "Video",
        "video": {
          "bitrate": 3898586,
          "bitrateAvg": 3249288,
          "bitrateConf": 3898586,
          "bitrateLatest": 2983512,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 266,
          "framerate": 60.0,
          "framerateAvg": 60.0,
          "framerateConf": 60.0,
          "framerateLatest": 60.0,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 127999,
          "bitrateAvg": 130459,
          "bitrateConf": 127999,
          "bitrateLatest": 128983,
          "bypass": false,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 100,
        "name": "Audio",
        "type": "Audio"
      },
      {
        "id": 200,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "messages": [
    {
      "code": "EGRESS_TRANSCODE_FAILED_ENCODING",
      "description": "Failed to encode frames"
    }
  ],
  "extraInfo": {
    "codecModule": {
      "busId": "-",
      "displayName": "Opus Interactive Audio Codec",
      "id": 0,
      "isDecoder": false,
      "isDefault": true,
      "isEncoder": true,
      "isHwAccel": false,
      "mediaType": "Audio",
      "metrics": {
        "active": {
          "decoder": 0,
          "encoder": 1
        }
      },
      "module": "libopus",
      "name": "libopus:0",
      "supportedCodecs": [
        "OPUS"
      ]
    },
    "errorCount": 100,
    "errorEvaluationWindow": 5000,
    "parentSourceTrackId": 100,
    "sourceTrackId": 3
  }
}
```

</details>

<details>

<summary>#03-3 When frame filtering fails:</summary>

```json
{
  "type": "EGRESS",
  "sourceUri": "#default#app/stream1",
  "sourceInfo": {
    "createdTime": "2025-12-12T18:31:41.155+09:00",
    "name": "stream1",
    "sourceType": "Transcoder",
    "sourceUrl": "da4da9dc-4e0f-41de-b623-4a8f3ed8a4c5/#default#app/stream1/i",
    "tracks": [
      {
        "id": 0,
        "name": "bypass_video",
        "type": "Video",
        "video": {
          "bitrate": 3898586,
          "bitrateAvg": 2299712,
          "bitrateConf": 3898586,
          "bitrateLatest": 2296848,
          "bypass": true,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 157,
          "framerate": 60.0,
          "framerateAvg": 60.0,
          "framerateConf": 60.0,
          "framerateLatest": 60.0,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "id": 1,
        "name": "video_1080",
        "type": "Video",
        "video": {
          "bitrate": 7000000,
          "bitrateAvg": 905512,
          "bitrateConf": 7000000,
          "bitrateLatest": 895276,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 26,
          "framerate": 60.0,
          "framerateAvg": 60.0,
          "framerateConf": 60.0,
          "framerateLatest": 59.642147064208984,
          "hasBframes": false,
          "height": 1080,
          "keyFrameInterval": 120.0,
          "keyFrameIntervalAvg": 60.5,
          "keyFrameIntervalConf": 120.0,
          "keyFrameIntervalLatest": 120.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 127999,
          "bitrateAvg": 130655,
          "bitrateConf": 127999,
          "bitrateLatest": 130696,
          "bypass": true,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 2,
        "name": "bypass_audio",
        "type": "Audio"
      },
      {
        "audio": {
          "bitrate": 128000,
          "bitrateAvg": 128000,
          "bitrateConf": 128000,
          "bitrateLatest": 125417,
          "bypass": false,
          "channel": 2,
          "codec": "OPUS",
          "samplerate": 48000
        },
        "id": 3,
        "name": "opus_audio",
        "type": "Audio"
      },
      {
        "id": 4,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "parentSourceUri": "#default#app/stream1",
  "parentSourceInfo": {
    "createdTime": "2025-12-12T18:31:41.139+09:00",
    "name": "stream1",
    "sourceType": "Scheduled",
    "tracks": [
      {
        "id": 0,
        "name": "Video",
        "type": "Video",
        "video": {
          "bitrate": 3898586,
          "bitrateAvg": 2299712,
          "bitrateConf": 3898586,
          "bitrateLatest": 2275110,
          "bypass": false,
          "codec": "H264",
          "deltaFramesSinceLastKeyFrame": 158,
          "framerate": 60.0,
          "framerateAvg": 60.0,
          "framerateConf": 60.0,
          "framerateLatest": 60.039371490478516,
          "hasBframes": true,
          "height": 1080,
          "keyFrameInterval": 1.0,
          "keyFrameIntervalAvg": 1.0,
          "keyFrameIntervalConf": 0.0,
          "keyFrameIntervalLatest": 0.0,
          "width": 1920
        }
      },
      {
        "audio": {
          "bitrate": 127999,
          "bitrateAvg": 130655,
          "bitrateConf": 127999,
          "bitrateLatest": 131385,
          "bypass": false,
          "channel": 2,
          "codec": "AAC",
          "samplerate": 44100
        },
        "id": 100,
        "name": "Audio",
        "type": "Audio"
      },
      {
        "id": 200,
        "name": "Data",
        "type": "Data"
      }
    ]
  },
  "messages": [
    {
      "code": "EGRESS_TRANSCODE_FAILED_FILTERING",
      "description": "Failed to filter frames"
    }
  ],
  "extraInfo": {
    "codecModule": {
      "busId": "-",
      "displayName": "Opus Interactive Audio Codec",
      "id": 0,
      "isDecoder": false,
      "isDefault": true,
      "isEncoder": true,
      "isHwAccel": false,
      "mediaType": "Audio",
      "metrics": {
        "active": {
          "decoder": 0,
          "encoder": 1
        }
      },
      "module": "libopus",
      "name": "libopus:0",
      "supportedCodecs": [
        "OPUS"
      ]
    },
    "errorCount": 49,
    "errorEvaluationWindow": 5000,
    "parentSourceTrackId": 100,
    "sourceTrackId": 3
  }
}
```

</details>

**Data delivered when `type` is `EGRESS`:**

<table><thead><tr><th width="280.00018310546875">Element</th><th>Description</th></tr></thead><tbody><tr><td>`sourceInfo`</td><td>Information about the egress stream.</td></tr><tr><td>`parentSourceInfo`</td><td>Information about the ingress stream.</td></tr><tr><td>`extraInfo.outputProfil`</td><td>Output profile information related to a stream creation failure or a transcoding failure.</td></tr><tr><td>`extraInto.codecModule`</td><td>Codec module information related to a stream creation failure or a transcoding failure.</td></tr><tr><td>`extraInfo.sourceTrackId`</td><td>The track ID of the egress stream related to a stream creation failure or a transcoding failure.</td></tr><tr><td>`extraInfo.parentSourceTrackId`</td><td>The track ID of the ingress stream related to a stream creation failure or a transcoding failure.</td></tr></tbody></table>

#### Security

The control server may need to validate incoming HTTP requests for security reasons. To do this, the Enhanced Alert module puts the `X-OME-Signature` value in the HTTP request header.

This `X-OME-Signature` is the base64 URL-safe encoding of the HMAC computed over the payload of the HTTP request, using the secret key set in `<Webhook><SecretKey>` and the hash algorithm set in `<Webhook><HashAlgorithm>` (HMAC-SHA1 by default) of the configuration. HMAC authenticates the payload; it does not encrypt it. Each webhook is therefore signed with its own secret key and hash algorithm.

### Response

The engine in the closing state does not need any parameters in response. The response payload is ignored.

```http
HTTP/1.1 200 OK
Content-Length: 0
Connection: Closed
```

## Anomaly Detection | 0.20.1.0+

Anomaly Detection is a module that detects input stream errors that occur during streaming\
and can take follow-up actions such as triggering an alert callback or terminating the stream.

Anomaly Detection can be configured in `<Server><Alert><Rules>` as shown below:

```xml
<Server>
	<Alert>
		<Rules>
			...
			<Anomaly>
				<DTSReversal>
					<CheckDuration>5</CheckDuration>
					<Count>1</Count>
					<Threshold>5</Threshold>
					<Action>TerminateStream,Alert</Action>
				</DTSReversal>
				<DTSJump>
					<Action>TerminateStream,Alert</Action>
				</DTSJump>
				<DTSDuplication>
					<Count>1</Count>
					<Action>TerminateStream,Alert</Action>
				</DTSDuplication>
				<PacketTimeout>
					<Action>TerminateStream,Alert</Action>
				</PacketTimeout>
				<TrackPrepareTimeout>
					<Action>TerminateStream,Alert</Action>
				</TrackPrepareTimeout>
			</Anomaly>
		</Rules>
	</Alert>
...
```

<table><thead><tr><th width="139.5555419921875">Key</th><th width="159.5555419921875" align="center">Default (Allowed)</th><th>Description</th></tr></thead><tbody><tr><td>CheckDuration</td><td align="center">10 (0-3600)</td><td><p>The base time used to accumulate the number of anomaly counts in order to decide whether to execute the action.</p><ul><li>The unit is seconds (s).</li></ul><p>If, within the `CheckDuration`, situations where the measured value exceeds the `Threshold` (as described for each option below) occur at least `Count` times, the `Action` is triggered.</p><ul><li>ex) If `CheckDuration` is set to `0` and `Count` is `1`, the anomaly is detected immediately with no waiting time. If `Count` is `2` or greater, there is no time window, so detection is not possible.</li></ul></td></tr><tr><td>Count</td><td align="center">1  (1-65535)</td><td><p>If the number of anomaly occurrences within the `CheckDuration` reaches the value set in `Count`, the condition is treated as an anomaly.</p><ul><li>The unit is the number of occurrences.</li></ul></td></tr><tr><td>Action</td><td align="center">N/A</td><td><p>Specifies which follow-up actions to take after an anomaly is detected. If omitted, detected anomalies are only logged (no stream termination or alert is performed).</p><p>The available follow-up actions are as follows, and multiple actions can be configured at the same time:</p><ol><li>`TerminateStream`: Stops the stream when an anomaly is detected on a source type such as `WebRTC`, `Ovt`, `RTMP`, `RtmpPull`, `Rtsp`, `RtspPull`, `Mpegts`, or `Srt`.</li><li>`Alert`: Sends the anomaly detection result to alert.</li></ol></td></tr></tbody></table>

### Configuring DTSReversal

`DTSReversal` detects cases where the Decoding Time Stamp (DTS) becomes smaller than the previous value in milliseconds or does not increase, which may cause playback issues.

`DTSReversal` can be configured under `<Server><Alert><Rules><Anomaly>`. An example is shown below:

```xml
<Server>
	<Alert>
		<Rules>
		...
			<Anomaly>
				<DTSReversal>
					<CheckDuration>5</CheckDuration>	<!-- During the last 5 seconds -->
					<Count>2</Count>	<!-- Two or more times -->
					<Threshold>5</Threshold>	<!-- DTS reversed by 5ms or more -->
					<Action>TerminateStream,Alert</Action>	<!-- Terminates the stream and sends an alert -->
				</DTSReversal>
				...
```

\= During the last 5 seconds (`CheckDuration`), the number of times the DTS has reversed by 5 milliseconds or more (`Threshold`) is 2 or greater (`Count`), the stream is terminated and an alert is sent (`Action`).

<table><thead><tr><th width="139.5555419921875">Key</th><th width="159.5555419921875" align="center">Default (Allowed)</th><th>Description</th></tr></thead><tbody><tr><td>Threshold</td><td align="center">1<br />(1-2147483647)</td><td><p>The criterion for “By how many milliseconds must the DTS be reversed for it to be regarded as an anomaly?”</p><ul><li>The unit is milliseconds (ms)</li></ul></td></tr></tbody></table>

#### Notification example

```json
{
	"sourceUri": "#default#app/stream",
	"messages": [
		{
			"code": "ANOMALY_DTS_REVERSAL_DETECTED",
			"description": "DTS has been reversed by 100."
		}
	],
	"type": "ANOMALY"
}
```

### Configuring DTSJump

`DTSJump` detects cases where the DTS increases abruptly between consecutive frames, which may cause playback issues.

`DTSJump` can be configured under `<Server><Alert><Rules><Anomaly>`. An example is shown below:

```xml
<Server>
	<Alert>
		<Rules>
			<Anomaly>
				<DTSJump>
					<CheckDuration>5</CheckDuration>	<!-- During the last 5 seconds -->
					<Count>2</Count>	<!-- Two or more times -->
					<Threshold>1000</Threshold>	<!-- DTS spikes by 1000 ms or more -->
					<Action>TerminateStream,Alert</Action>	<!-- Terminates the stream and sends an alert -->
				</DTSJump>
				...
```

\= During the last 5 seconds (`CheckDuration`), the number of times the DTS has jumped by 1,000 milliseconds or more (`Threshold`) is 2 or greater (`Count`), the stream is terminated and an alert is sent (`Action`).

<table><thead><tr><th width="139.5555419921875">Key</th><th width="159.5555419921875" align="center">Default (Allowed)</th><th>Description</th></tr></thead><tbody><tr><td>Threshold</td><td align="center">1000<br />(1-2147483647)</td><td><p>The criterion for “By how many milliseconds must the DTS jump for it to be regarded as an anomaly?”</p><ul><li>The unit is milliseconds (ms).</li></ul></td></tr></tbody></table>

#### Notification example

```json
{
	"sourceUri": "#default#app/stream",
	"messages": [
		{
			"code": "ANOMALY_DTS_JUMP_DETECTED",
			"description": "DTS has increased significantly by 3000."
		}
	],
	"type": "ANOMALY"
}
```

### Configuring DTSDuplication

`DTSDuplication` detects cases where the DTS of consecutive frames is identical, which may cause playback issues.

`DTSDuplication` can be configured under `<Server><Alert><Rules><Anomaly>`. An example is shown below:

```xml
<Server>
	<Alert>
		<Rules>
			<Anomaly>
				<DTSDuplication>
					<CheckDuration>5</CheckDuration>	<!-- During the last 5 seconds -->
					<Count>2</Count>	<!-- Two or more times -->
					<Action>TerminateStream,Alert</Action>	<!-- Terminates the stream and sends an alert -->
				</DTSDuplication>
				...
```

\= During the last 5 seconds (`CheckDuration`), the number of times the DTS is identical is 2 or greater (`Count`), the stream is terminated and an alert is sent (`Action`).

#### Notification example

```json
{
	"sourceUri": "#default#app/stream",
	"messages": [
		{
			"code": "ANOMALY_DTS_DUPLICATION_DETECTED",
			"description": "DTS has been duplicated 2 times."
		}
	],
	"type": "ANOMALY"
}
```

### Configuring PacketTimeout

`PacketTimeout` detects cases where no packets are received for a specified period of time,&#x20;which may cause playback issues.

`PacketTimeout` can be configured under `<Server><Alert><Rules><Anomaly>`. An example is shown below:

```xml
<Server>
	<Alert>
		<Rules>
			<Anomaly>
				<PacketTimeout>
					<CheckDuration>5</CheckDuration>	<!-- During the last 5 seconds -->
					<Count>2</Count>	<!-- Two or more times -->
					<Threshold>1000</Threshold>	<!-- No packets have been received for 1000 ms or more -->
					<Action>TerminateStream,Alert</Action>	<!-- Terminates the stream and sends an alert -->
				</PacketTimeout>
				...
```

\= During the last 5 seconds (`CheckDuration`), the number of times no packet was received for 1,000 milliseconds or more (`Threshold`) is 2 or greater (`Count`), the stream is terminated and an alert is sent (`Action`).

<table><thead><tr><th width="139.5555419921875">Key</th><th width="159.5555419921875" align="center">Default (Allowed)</th><th>Description</th></tr></thead><tbody><tr><td>Threshold</td><td align="center">1500<br />(1-2147483647)</td><td><p>The criterion for “By how many milliseconds must no packet be received for it to be regarded as an anomaly?”</p><ul><li>The unit is milliseconds (ms).</li></ul></td></tr></tbody></table>


:::warning

Because this `PacketTimeout` feature overlaps with the [`PacketSilenceTimeoutMs` in Origin Redundancy,](../high-availability/origin-redundancy.md#packetsilencetimeoutms-settings--01830) we recommend using the Anomaly Detection feature.

* If both settings are enabled, the module configured with the smaller value will take effect first.

:::


#### Notification example

```json
{
	"sourceUri": "#default#app/stream",
	"messages": [
		{
			"code": "ANOMALY_PACKET_TIMEOUT_DETECTED",
			"description": "No packets have been received for 1500ms."
		}
	],
	"type": "ANOMALY"
}
```

### Configuring TrackPrepareTimeout

`TrackPrepareTimeout` detects cases where a track is not prepared within a specified time after media starts, which blocks the stream from being prepared. A common cause is a Simulcast layer (RID) that the client never sends while the other layers keep arriving.

`TrackPrepareTimeout` can be configured under `<Server><Alert><Rules><Anomaly>`. An example is shown below:

```xml
<Server>
	<Alert>
		<Rules>
			<Anomaly>
				<TrackPrepareTimeout>
					<CheckDuration>5</CheckDuration>	<!-- During the last 5 seconds -->
					<Count>1</Count>	<!-- One or more times -->
					<Threshold>3000</Threshold>	<!-- A track stayed not prepared for 3000 ms or more -->
					<Action>TerminateStream,Alert</Action>	<!-- Terminates the stream and sends an alert -->
				</TrackPrepareTimeout>
				...
```

\= During the last 5 seconds (`CheckDuration`), if a track stays not prepared for 3,000 milliseconds or more (`Threshold`) at least once (`Count`) while another track keeps arriving, the stream is terminated and an alert is sent (`Action`).

<table><thead><tr><th width="139.5555419921875">Key</th><th width="159.5555419921875" align="center">Default (Allowed)</th><th>Description</th></tr></thead><tbody><tr><td>Threshold</td><td align="center">3000<br />(1-2147483647)</td><td><p>The criterion for "How long, after media starts, must a track stay not prepared for it to be regarded as an anomaly?"</p><ul><li>The unit is milliseconds (ms).</li></ul></td></tr></tbody></table>


:::info

`TrackPrepareTimeout` applies only before the stream is prepared. Once every track is prepared, this rule no longer triggers.

* It triggers only on a partial failure: at least one track is prepared while another is not.
* If no track is prepared yet (the stream is just starting or idle), this rule stays quiet; full-stream silence is handled by `PacketTimeout` instead.

:::


#### Notification example

```json
{
	"sourceUri": "#default#app/stream",
	"messages": [
		{
			"code": "ANOMALY_TRACK_PREPARE_TIMEOUT_DETECTED",
			"description": "Track #1 (Audio) is not prepared, blocking stream preparation."
		}
	],
	"type": "ANOMALY"
}
```
