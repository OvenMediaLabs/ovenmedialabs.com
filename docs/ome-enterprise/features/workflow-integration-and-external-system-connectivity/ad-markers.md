---
title: Ad Markers
description: "Insert CUE-OUT/IN ad markers into OvenMediaEngine Enterprise LL-HLS and HLS playlists via the REST API."
enterprise_only: true
sidebar_position: 130
---

## CUE-OUT/IN

#### For LL-HLS/HLS

You can dynamically insert Ad Markers into LL-HLS and HLS playlists using the REST API.

When requesting the CUE-OUT event, the following tags will be added to the playlist:

```
#EXT-X-CUE-OUT:DURATION=<time>
…
#EXT-X-CUE-IN
```

<table><thead><tr><th width="175">Element</th><th>Description</th></tr></thead><tbody><tr><td>`#EXT-X-CUE-OUT`,<br />`#EXT-X-CUE-IN`</td><td>`#EXT-X-CUE-OUT` and `#EXT-X-CUE-IN` are a pair, and the entire section between the two tags will be replaced with ad content by the ad server</td></tr><tr><td><code>DURATION=&#x3C;time></code></td><td><code>DURATION=&#x3C;time></code> is required and represents the duration of the ad.</td></tr></tbody></table>

You can request the CUE-IN event to end an inserted ad early. When the event is called, the `#EXT-X-CUE-IN` tag is immediately added to the playlist, and the previously added `#EXT-X-CUE-IN` tag is removed.

### API Interface

**Request**

<details>

<summary><span class="http-method http-method-post">POST</span> /v1/vhosts&#x7B;vhost&#x7D;/apps/&#x7B;app&#x7D;/streams/&#x7B;stream&#x7D;:sendEvent</summary>

**Header**

```http
Authorization: Basic {credentials}

# Authorization
Credentials for HTTP Basic Authentication created with <AccessToken>
```

**Body**

```json
{
  "eventFormat": "cue",
  "startOffset": 0, // optional, milliseconds to delay the marker from the current position
  "events":[
    {
      "cueType": "out", // out | in
      "duration": 60500 // milliseconds, only available when cueType is out
    }
  ]
}
```

</details>

<details>

<summary><span class="http-method http-method-post">POST</span> /v1/vhosts&#x7B;vhost&#x7D;/apps/&#x7B;app&#x7D;/streams/&#x7B;stream&#x7D;:sendEvents</summary>

**Header**

```http
Authorization: Basic {credentials}

# Authorization
Credentials for HTTP Basic Authentication created with <AccessToken>
```

**Body**

```json
[
  {
    "eventFormat": "id3v2",
    "eventType": "video", // "eventTarget": "video" is same
    "events":[
      {
        "frameType": "TXXX",
        "info": "OvenMedia Labs",
        "data": "OvenMediaEngine"
      },
      {
        "frameType": "TIT2",
        "data": "OvenMediaEngine 123"
      }
    ]
  },
  {
    "eventFormat": "cue",
    "startOffset": 0, // optional, milliseconds to delay the marker from the current position
    "events":[
      {
        "cueType": "out", // out | in
        "duration": 60500 // milliseconds, only available when cueType is out
      }
    ]
  }
]
```

</details>

**Responses**

<details>

<summary><span class="http-method http-method-200">200</span> Ok</summary>

The request has succeeded

**Header**

```http
Content-Type: application/json
```

**Body**

```json
{
    "message": "OK",
    "statusCode": 200
}
```

</details>

<details>

<summary><span class="http-method http-method-400">400</span> Bad Request</summary>

Invalid request. Body is not a Json Object or does not have a required value

</details>

<details>

<summary><span class="http-method http-method-401">401</span> Unauthorized</summary>

Authentication required

**Header**

```http
WWW-Authenticate: Basic realm=”OvenMediaEngine”
```

**Body**

```json
{
    "message": "[HTTP] Authorization header is required to call API (401)",
    "statusCode": 401
}
```

</details>

<details>

<summary><span class="http-method http-method-404">404</span> Not Found</summary>

The given vhost name or application name could not be found.

**Body**

```json
{
    "message": "[HTTP] Could not find the application: [default/app2] (404)",
    "statusCode": 404
}
```

</details>

## SCTE-35 Event Insertion

#### For LL-HLS/HLS

Using the REST API, you can insert ad markers into LL-HLS and HLS playlists as `#EXT-X-DATERANGE` tags. `#EXT-X-DATERANGE` specifies ad timing via the SCTE-35 OUT/IN attributes.

#### For SRT Push

Starting with OvenMediaEngine Enterprise 0.20.0.0-1, you can insert SCTE-35 events (`splice_insert()`) not only into LL-HLS and HLS playlists, but also into SRT Push. When you send ad start/end signals (OUT/IN) or other custom events to OvenMediaEngine Enterprise via the `sendEvents` API, the information is inserted into the SRT Push and propagated to other systems.

### Behavior Rule

These rules apply to markers inserted through the API. An SCTE-35 event that arrives in an input stream is forwarded with the return point its sender chose.

1. When an `OUT` event sets `autoReturn` with a `duration`, an `IN` is inserted automatically at the end of that duration.
2. Sending an `IN` before then replaces the automatic one, so the break ends where you send it.
3. Without `autoReturn`, no `IN` is inserted on your behalf, because an explicit splice-in is expected to follow. Send the `IN` yourself to end the break.


:::warning

Some downstream devices may fail to detect a return from ad break. We recommend sending an `IN` event after an `OUT` event.

:::


### API Interface

**Request**

<details>

<summary><span class="http-method http-method-post">POST</span> /v1/vhosts&#x7B;vhost&#x7D;/apps/&#x7B;app&#x7D;/streams/&#x7B;stream&#x7D;:sendEvent</summary>

**Header**

```http
Authorization: Basic {credentials}

# Authorization
Credentials for HTTP Basic Authentication created with <AccessToken>
```

**Body**

```json
{
  "eventFormat": "scte35",
  "startOffset": 0, // optional, milliseconds to delay the marker from the current position
  "events":[
    {
      "id": {{randomId}}, // required, 32bits unsigned number, auto filled if not present
      "type": "out", // required, out | in
      "duration": 10000, // milliseconds, only available when type is out
      "autoReturn": false // optional, fixes the return at the end of the duration
    }
  ]
}
```

</details>

<details>

<summary><span class="http-method http-method-post">POST</span> /v1/vhosts&#x7B;vhost&#x7D;/apps/&#x7B;app&#x7D;/streams/&#x7B;stream&#x7D;:sendEvents</summary>

**Header**

```http
Authorization: Basic {credentials}

# Authorization
Credentials for HTTP Basic Authentication created with <AccessToken>
```

**Body**

```json
[
  {
    "eventFormat": "scte35",
    "startOffset": 0, // optional, milliseconds to delay the marker from the current position
    "events":[
      {
        "spliceCommand": "spliceInsert",
        "id": {{randomId}}, // required, 32bits unsigned number, auto filled if not present
        "type": "out", // required, out | in
        "duration": 30000, // milliseconds, only available when type is out
        "autoReturn": false // optional, fixes the return at the end of the duration
      }
    ]
  }
]
```

</details>


:::info

You enter `duration` in milliseconds (ms), but it is emitted to the playlist as `PLANNED-DURATION` in seconds (s).

:::


**Responses**

<details>

<summary><span class="http-method http-method-200">200</span> Ok</summary>

The request has succeeded

**Header**

```http
Content-Type: application/json
```

**Body**

```json
{
    "message": "OK",
    "statusCode": 200
}
```

</details>

<details>

<summary><span class="http-method http-method-400">400</span> Bad Request</summary>

Invalid request. Body is not a JSON object or does not have a required value

</details>

<details>

<summary><span class="http-method http-method-401">401</span> Unauthorized</summary>

Authentication required

**Header**

```http
WWW-Authenticate: Basic realm=”OvenMediaEngine”
```

**Body**

```json
{
    "message": "[HTTP] Authorization header is required to call API (401)",
    "statusCode": 401
}
```

</details>

<details>

<summary><span class="http-method http-method-404">404</span> Not Found</summary>

The given vhost name or application name could not be found.

**Body**

```json
{
    "message": "[HTTP] Could not find the application: [default/app2] (404)",
    "statusCode": 404
}
```

</details>

### Example: Successful Event Insertion

#### For LL-HLS/HLS

Below is an LL-HLS playlist sample after injecting an SCTE-35 event:

```
#EXT-X-DATERANGE:ID="123",START-DATE="2025-01-01T09:15:00+00:00",PLANNED-DURATION=10.0,SCTE35-OUT=0xF...
...
#EXT-X-DATERANGE:ID="123",START-DATE="2025-01-01T09:15:00+00:00",SCTE35-IN=0xF
```

<table><thead><tr><th width="175">Element</th><th>Description</th></tr></thead><tbody><tr><td>`SCTE35-OUT`</td><td>SCTE-35 payload indicating the start of the ad break (content → ad).</td></tr><tr><td>`SCTE35-IN`</td><td>SCTE-35 payload indicating the end of the ad break (ad → content).</td></tr><tr><td>`PLANNED-DURATION`</td><td>Ad break duration in seconds. When `OUT` sets `autoReturn`, an IN is inserted at the end of this time.</td></tr><tr><td>`ID`</td><td><p>An identifier that ties the OUT/IN to the same break.</p><p>*  32-bit unsigned integer.</p></td></tr><tr><td>`START-DATE`</td><td>Ad start timestamp (ISO-8601).<br />* yyyy-mm-ddThh:mm:ss±UTC</td></tr></tbody></table>

#### For SRT Push

If the OvenMediaEngine Enterprise log shows output similar to the example below, the SCTE-35 event was delivered successfully.

```
[11-03 21:29:02.028] D [SW-Push:2415407] FFmpegWriter | writer.cpp:523  | SCTE-35 Event: SpliceCommandType=5, ID=2025, OutOfNetwork=true, Timestamp=372370 ms, Duration=30000 ms, AutoReturn=false
```

## Scheduling a Marker Ahead

`startOffset` delays a marker by that many milliseconds from the position the stream has reached when the request arrives. Omitting it, or sending `0`, places the marker at that position. Negative values are not allowed, and the maximum is 300000.

A scheduled marker holds the break sequence until it is reached. Between the request and that position, no other `OUT` or `IN` is accepted, because a break must be opened and closed in order. Keep the offset only as long as the moment you are aiming at.

## Segmentation Mode

Use synced segmentation when every rendition must cut its segments at the same positions: the same segment number then covers the same range on every rendition, and a marker lands on the same segment everywhere. In `duration` segmentation each track decides its own boundaries, so the same marker can land on a different segment on each of them.

Set `<SegmentationMode>` to `synced` on such streams:

```xml
<Publishers>
  <LLHLS>
    <SegmentationMode>synced</SegmentationMode>
    ...
  </LLHLS>
</Publishers>
```

### Requirements for synced segmentation

Synced segmentation keeps the renditions together only when every video rendition of the output profile can cut at the same positions. Configure the video renditions as follows. Audio renditions have no requirement.

- **Keyframe interval**: the same length of time on every video rendition. `KeyFrameInterval` counts frames, so scale it with the frame rate: 60 frames at 30 fps and 120 frames at 60 fps are both 2 seconds. Keep `SegmentDuration` a multiple of that length.
- **Frame rate**: the same on every video rendition, or one an integer multiple of the other, such as 30 fps and 60 fps. 29.97 fps and 30 fps do not go together.
- **B-frames**: the same `BFrames` value and the same encoder module on every video rendition. When the frame rates differ, set `BFrames` to 0 on every rendition.
- **Bypass video next to transcoded video**: the transcoded renditions must match the source encoder in frame rate, keyframe interval and B-frame configuration. If you cannot tell how the source was encoded, use a source without B-frames and `BFrames` 0 on every transcoded rendition, use bypass video alone, or transcode every video rendition.

| Output profile | Synced segmentation |
|---|---|
| 1080p and 720p, both 30 fps, `KeyFrameInterval` 60, `BFrames` 3, same encoder module | Supported |
| 1080p 60 fps `KeyFrameInterval` 120 and 720p 30 fps `KeyFrameInterval` 60, `BFrames` 0 on both | Supported |
| 1080p 60 fps and 720p 30 fps with `BFrames` 3 on both | Not supported |
| 30 fps renditions with `KeyFrameInterval` 60 and 90 | Not supported |
| Bypass video of a source without B-frames, transcoded renditions with `BFrames` 0 and the same keyframe interval | Supported |
| Bypass video of a source with B-frames next to transcoded renditions | Not supported unless the renditions match the source encoder |
| Bypass video of a 29.97 fps source with a 30 fps transcoded rendition | Not supported |
| One bypass video and bypass audio only | Supported |

A rendition outside these requirements keeps playing, but its segments are no longer guaranteed to end where the other renditions' do or to keep the same segment numbers, so a marker can land on a different segment on that rendition. The first such segment logs `The boundary at ... is not a keyframe on this track; the segment closes at the keyframe at ... instead` once for the rendition. Treat that line as a configuration problem of the output profile. With bypass video next to transcoded video, or with mixed frame rates, the line can appear once even on a supported profile; the renditions then still start every segment on the same picture.

## Keyframe on Cue

HLS and LL-HLS segments can only be split at keyframes. When an ad marker arrives in the middle of a GOP, the segment carrying the marker ends at the next keyframe, so the actual split can land up to one keyframe interval after the requested position and the ad break plays shorter than the duration it advertises.

When `KeyframeOnCue` is enabled, every video encoder inserts a keyframe exactly at the marker position, so the segment splits right where the marker was requested and the break length matches the advertised duration. This applies to both CUE and SCTE-35 events. Enable it when a downstream ad stitcher replaces the break content, so the replaced range starts exactly at the marker.

In `Server.xml`, configure `<Application><OutputProfiles><MediaOptions>` as below:

```xml
<OutputProfiles>
  <MediaOptions>
    <KeyframeOnCue>true</KeyframeOnCue>
  </MediaOptions>
  ...
</OutputProfiles>
```

<table><thead><tr><th width="175">Element</th><th width="135">Value</th><th>Description</th></tr></thead><tbody><tr><td>KeyframeOnCue</td><td>true | false<br />(default: false)</td><td>Inserts a keyframe at the position of every CUE and SCTE-35 marker, on every encoded video rendition of the application.</td></tr></tbody></table>

:::info

The inserted keyframe is an extra one; the configured keyframe interval keeps its original cadence. It applies to encoded video renditions only. A bypass (passthrough) video keeps the keyframes of the source, so its splits still follow the source's own keyframes.

:::
