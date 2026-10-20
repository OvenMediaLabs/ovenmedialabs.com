---
title: Server-Side Ad Insertion (SSAI)
description: "Configure OvenMediaEngine Enterprise as an origin for server-side ad insertion, so an ad stitcher replaces marked ad breaks in LL-HLS output."
enterprise_only: true
sidebar_position: 140
---

In a server-side ad insertion (SSAI) workflow, an ad stitcher sits between OvenMediaEngine Enterprise and the viewer. OvenMediaEngine Enterprise marks where each ad break begins and ends, the stitcher replaces the marked range with ad content, and the player receives a single continuous playlist. AWS Elemental MediaTailor is one such stitcher.

A stitcher reads the playlist more strictly than a player does. Starting with OvenMediaEngine Enterprise 0.21.1.0, the `SsaiCompatibility` option prepares LL-HLS output for it, so the stitcher replaces each break exactly as marked.

## Configuration

In `Server.xml`, configure `<Publishers><LLHLS>` as below:

```xml
<Publishers>
  <LLHLS>
    <SsaiCompatibility>true</SsaiCompatibility>
    ...
  </LLHLS>
</Publishers>
```

<table><thead><tr><th width="230">Element</th><th width="135">Value</th><th>Description</th></tr></thead><tbody><tr><td>SsaiCompatibility</td><td>true | false<br />(default: false)</td><td>Prepares LL-HLS output for an ad stitcher. It turns on the options below unless you set them explicitly.</td></tr><tr><td>SegmentationMode</td><td>synced</td><td>Segments every track together. Required for SSAI.</td></tr><tr><td>ForceAlignMarkerBoundary</td><td>true</td><td>Advertises segment boundaries at the marker positions.</td></tr></tbody></table>

An explicit setting always wins, so you can configure either option on its own.

:::warning

Keep `SegmentationMode` set to `synced` whenever the stream carries ad breaks. In `duration` segmentation each track decides its own boundaries, so the same marker can land on a different segment on each of them. Synced segmentation also has requirements on the video renditions of the output profile, such as the same keyframe interval and the same B-frame settings; see the Segmentation Mode section of [Ad Markers](ad-markers.md).

:::

### About ForceAlignMarkerBoundary

Turn this on and every track marks the break at the same point. Audio and video advertise the same `EXT-X-PROGRAM-DATE-TIME` there, and one segment number means the same range on all of them. A stitcher that pairs the renditions by those advertised times, AWS Elemental MediaTailor among them, then replaces exactly the same piece of the stream on every rendition.

Frames rarely land exactly on the marker. Audio and video have different frame lengths, so each track cuts at the first frame it can and the tracks end up a few milliseconds apart. This option closes that gap: the segment carrying the marker advertises its boundary at the marker itself, the next segment gives those few milliseconds back so the advertised timeline stays correct, and the marker reports where the cut actually landed.

**When to turn it off.** This option exists for stitchers that need it. If anything downstream has trouble with the advertised times, set it to `false`. The media and the cut positions are the same either way; what returns is the marker advertising the time it was requested at rather than the cut it landed on.

```xml
<Publishers>
  <LLHLS>
    <SsaiCompatibility>true</SsaiCompatibility>
    <ForceAlignMarkerBoundary>false</ForceAlignMarkerBoundary>
    ...
  </LLHLS>
</Publishers>
```

## Authoring Ad Breaks

An ad stitcher replaces exactly the range between the OUT and the IN, so the break has to land where it was announced, on every rendition. Insert the markers through the REST API as described in [Ad Markers](ad-markers.md); stitchers commonly read `#EXT-X-DATERANGE` tags carrying SCTE-35 attributes, and some read `#EXT-X-CUE-OUT` and `#EXT-X-CUE-IN` instead, so check which signal yours expects.

### Encode the renditions

Encode the video renditions rather than passing the source through. A bypass track follows the source's keyframes, so the break lands wherever the source happens to place one, `KeyframeOnCue` has no effect on it, and a source that changes its encoding configuration while streaming moves the break again. Encoding puts the keyframe positions under this server's control, which is what everything below depends on.

### Segment duration and keyframe interval

The keyframe interval must be equal to or shorter than the segment duration, and must divide it evenly. A segment can only end at a keyframe, so an interval that does not divide the duration stretches every segment to the next whole interval: a 3 second interval with a 4 second segment duration produces 6 second segments, and the break lands that much further from where it was announced. An equal interval is allowed, and gives one keyframe interval per segment.

A 2 second segment duration is a good starting point for MediaTailor, which cuts the ads it inserts into 2 second segments.

### Starting the break at the marker

Enable `KeyframeOnCue` so a keyframe is placed at the marker itself. Without it the break starts at the next keyframe instead of at the marker, so the range handed to the stitcher is shorter than the duration it announces by up to one keyframe interval, while the stitcher still fills the announced duration.

### Ending the break

Announce the duration you have ad content for, and set `autoReturn` so the return point is placed for you:

```json
{
  "eventFormat": "scte35",
  "events":[
    {
      "id": {{randomId}},
      "type": "out",
      "duration": 30000,
      "autoReturn": true
    }
  ]
}
```

The IN then lands exactly one duration after the OUT. Calling the API twice instead makes the break as long as the gap between the two calls happened to be: asking for a 15 second break and producing a 15.2 second one leaves the stitcher a slot its ads were not cut for, and it has to pad or overrun to fill it.

A break can still be ended sooner: an `IN` sent before the duration elapses replaces the automatic one. See [Ad Markers](ad-markers.md) for the API.

### Limits on when a break can be placed

<table><thead><tr><th width="230">Rule</th><th>Reason</th></tr></thead><tbody><tr><td>A break must last at least one segment cut, which is the segment duration rounded up to whole keyframe intervals.</td><td>A shorter break would return on the very cut that opened it, leaving nothing to replace. The same minimum applies between an OUT and the IN that closes it.</td></tr><tr><td>An OUT is refused while a break is still open.</td><td>A break that never receives its IN stops every later break on that stream. <code>autoReturn</code> closes it for you.</td></tr><tr><td>A marker positioned in the past is accepted up to one segment late, and refused beyond that.</td><td>The cut lands at the nearest position that can still cut; older than that, the announced time no longer describes where it would land.</td></tr></tbody></table>

### Example configuration

A 2 second segmentation with a matching keyframe interval, encoded renditions, and the options above:

```xml
<Application>
  <Name>app</Name>
  <Type>live</Type>

  <OutputProfiles>
    <MediaOptions>
      <KeyframeOnCue>true</KeyframeOnCue>
    </MediaOptions>

    <OutputProfile>
      <Name>ssai</Name>
      <OutputStreamName>${OriginStreamName}</OutputStreamName>
      <Encodes>
        <Video>
          <Name>video_1080</Name>
          <Codec>h264</Codec>
          <Width>1920</Width>
          <Height>1080</Height>
          <Bitrate>5000000</Bitrate>
          <Framerate>30.0</Framerate>
          <KeyFrameInterval>60</KeyFrameInterval>
          <KeyFrameIntervalType>frame</KeyFrameIntervalType>
          <Preset>fast</Preset>
        </Video>
        <Audio>
          <Name>audio_aac</Name>
          <Codec>aac</Codec>
          <Bitrate>128000</Bitrate>
          <Samplerate>48000</Samplerate>
          <Channel>2</Channel>
        </Audio>
      </Encodes>
    </OutputProfile>
  </OutputProfiles>

  <Publishers>
    <LLHLS>
      <ChunkDuration>0.5</ChunkDuration>
      <SegmentDuration>2</SegmentDuration>
      <SegmentCount>10</SegmentCount>
      <SsaiCompatibility>true</SsaiCompatibility>
    </LLHLS>
  </Publishers>
</Application>
```

At 30 frames per second a 60 frame keyframe interval is 2 seconds, the same as the segment duration, so every segment is one keyframe interval long and a break can begin at any segment boundary.

## Playlist URL

Point the stitcher at the playlist with `_HLS_legacy=YES`:

```
https://domain[:port]/<app>/<stream>/<playlist>.m3u8?_HLS_legacy=YES
```

A stitcher delivers ad content as complete segments, so partial segments serve no purpose in this workflow, and hls.js fails to parse a playlist that carries them across an ad break. To apply the query string to every request instead of appending it, configure `<DefaultQueryString>` as described in [Query String Handling](query-string-handling.md).

## Player Compatibility

Players differ in how they handle a stream with ads spliced into it. You can check playback of a stitched playlist at [https://demo.ovenplayer.com](https://demo.ovenplayer.com).

<table><thead><tr><th width="230">Player</th><th>Notes</th></tr></thead><tbody><tr><td>OvenPlayer</td><td>Request the playlist with <code>_HLS_legacy=YES</code>. OvenPlayer plays LL-HLS through hls.js.</td></tr><tr><td>hls.js</td><td>Request the playlist with <code>_HLS_legacy=YES</code>. Without it, hls.js reports a parsing error and stops at the first ad break.</td></tr><tr><td>Safari native HLS</td><td>Plays stitched output without additional configuration.</td></tr><tr><td>Shaka Player</td><td>Verified with the 4.16 branch (4.16.46), which Shaka maintains as LTS until January 31, 2027. Later branches are not verified for this workflow. Contact technical support before using them.</td></tr></tbody></table>

## Limitations

* SSAI compatibility is intended for a single origin. Do not combine it with [Origin Redundancy](../high-availability/origin-redundancy.md).
