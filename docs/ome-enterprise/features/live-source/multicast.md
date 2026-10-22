---
title: Multicast
description: "Ingest MPEG-2 TS over UDP multicast into OvenMediaEngine Enterprise with the Multicast Provider."
enterprise_only: true
sidebar_position: 88
---

OvenMediaEngine can pull MPEG-2 TS input delivered over `UDP` multicast. The Multicast Provider uses the `multicast://` URL scheme and creates streams through `StreamMap` or the [Stream Creation API](../rest-api/v1/virtual-host/application/stream/README.md#create-stream-pull).

<table><thead><tr><th width="217.22216796875">Item</th><th>Description</th></tr></thead><tbody><tr><td>Container</td><td>MPEG-2 TS</td></tr><tr><td>Transport</td><td>UDP Multicast</td></tr><tr><td>Codec</td><td>H.264, H.265, AAC</td></tr><tr><td>Additional Features</td><td>SCTE-35 event forwarding</td></tr></tbody></table>

## Configuration

To use Multicast, enable the `<Provider>` in the `<Application>`.

### Bind

Bind settings are optional and are used only when you need to tune input socket processing or the UDP receive buffer size:

```xml
<!-- /Server/Bind -->
<Bind>
    <Providers>
        ...
        <Multicast>
            <WorkerCount>1</WorkerCount>
            <ThreadPerSocket>false</ThreadPerSocket>
            <ReceiveBufferSize>8388608</ReceiveBufferSize>
        </Multicast>
        ...
    </Providers>
</Bind>
```

<table><thead><tr><th width="217">Property</th><th>Description</th></tr></thead><tbody><tr><td>`WorkerCount`</td><td>Number of worker threads used to process input sockets.</td></tr><tr><td>`ThreadPerSocket`</td><td>Whether to use a dedicated thread for each socket. If set to `true`, socket-specific threads are used instead of `WorkerCount`.</td></tr><tr><td>`ReceiveBufferSize`</td><td>Size of the UDP receive buffer. Adjust this in environments with high bitrate input or large bursts.</td></tr></tbody></table>

### Application

Enable the Multicast Provider per Application:

```xml
<!-- /Server/VirtualHosts/VirtualHost/Applications/Application -->
<Providers>
    ...
    <Multicast>
        ...
    </Multicast>
    ...
</Providers>
```

## `StreamMap`

Multicast streams declared in `StreamMap` are created automatically when the Application starts:

```xml
<!-- /Server/VirtualHosts/VirtualHost/Applications/Application -->
<Providers>
    <Multicast>
        <StreamMap>
            <Stream>
                <Name>news_hd</Name>
                <source />multicast://239.1.1.10:5000</Source>
                <ProbeTimeoutMsec>3000</ProbeTimeoutMsec>
            </Stream>
            <Stream>
                <Name>sports_hd</Name>
                <source />multicast://239.1.1.11:5000?interface=eth1</Source>
                <ProbeTimeoutMsec>5000</ProbeTimeoutMsec>
            </Stream>
        </StreamMap>
    </Multicast>
</Providers>
```

<table><thead><tr><th width="217">Property</th><th>Description</th></tr></thead><tbody><tr><td>`Name`</td><td>Stream name to be created inside OvenMediaEngine.</td></tr><tr><td>`Source`</td><td>Multicast input URL.</td></tr><tr><td>`ProbeTimeoutMsec`</td><td><p>Maximum time, in milliseconds, to wait for input metadata.</p><ul><li>Default: `3000`.</li></ul></td></tr></tbody></table>

Multiple streams in the same Application can reference the same multicast source.

## Pull timeout and retry

Input timeout and retry count are configured in `Origins/Properties`:

```xml
<!-- /Server/VirtualHosts/VirtualHost -->
<Origins>
    <Properties>
        <NoInputFailoverTimeout>3000</NoInputFailoverTimeout>
        <RetryCount>3</RetryCount>
    </Properties>
</Origins>
```

<table><thead><tr><th width="217">Property</th><th>Description</th></tr></thead><tbody><tr><td>`NoInputFailoverTimeout`</td><td>If no input packets arrive for the configured time, the stream is stopped and a reconnect is attempted.</td></tr><tr><td>`RetryCount`</td><td>Maximum number of reconnect attempts.</td></tr></tbody></table>

## Source URL format

The following URL formats are supported:

```
multicast://239.1.1.1:5000
multicast://239.1.1.1:5000?interface=eth0
multicast://[ff05::111]:5000
multicast://[ff05::111]:5000?interface=eth0
```

The only supported query parameter is `interface`:

<table><thead><tr><th width="217">Property</th><th>Description</th></tr></thead><tbody><tr><td>`interface`</td><td>`NIC` name to use when joining the multicast group. If omitted, the OS selects the interface automatically.</td></tr></tbody></table>

#### Limitations:

* Paths are not supported. The URL path must be empty or `/`.
* Hostnames can be used. In that case, OvenMediaEngine resolves the hostname and uses the first result.
* The resolved hostname result must be in the multicast IP range.

## Pulling streams using the Stream Creation API

Multicast streams can also be created through the [Stream Creation API](../rest-api/v1/virtual-host/application/stream/README.md#create-stream-pull).

```json
{
  "name": "channel1",
  "urls": [
    "multicast://239.1.1.1:5000"
  ],
  "properties": {
    "persistent": false
  }
}
```

For more information, see the [REST API](../rest-api/README.md) documentation.

## Notes

* If a new sender starts on the same group and port, the provider detects it from a timestamp rollback of 1 second or more, a forward timestamp jump of more than 5 seconds that lands on no other track's timeline, or a PAT/PMT change of the PMT PID or the track PIDs and stream types, and continues the same stream with the new sender.
  Output timestamps continue from the last output without a gap, and media of the new sender that would overlap output already sent is dropped.
  SCTE-35 splice times move with the media.
  If the old video had stopped, or the new sender's video does not arrive within a second, video resumes at the new sender's next keyframe, waiting at most 3 seconds.
  Otherwise the video track the timeline continues from resumes at once, and any other video track resumes at its next keyframe.
  A new sender that joins mid-GOP (for example, a backup encoder that is already running) can therefore show a corrupted picture until its next keyframe.
* If the new sender uses different PIDs, its tracks are mapped onto the published tracks by media type and codec.
* The stream stops and reconnects as described in [Pull timeout and retry](#pull-timeout-and-retry), or is deleted if `RetryCount` is `0` (the default), when:
  * the tracks cannot be mapped (a different track count or kind, or several tracks with the same media type and codec under new PIDs), which also fails a reconnect to that sender;
  * the new sender's PAT/PMT does not describe its tracks within `ProbeTimeoutMsec`;
  * the stream is not persistent and the input gap plus the switch, which holds media for up to a few seconds, exceeds `NoInputFailoverTimeout`.
* The input metadata must be available within `ProbeTimeoutMsec` for the stream to be published.
