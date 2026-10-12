---
title: Scheduled Channel (Fade)
description: "Fade each Scheduled Channel item in from and out to black or white in OvenMediaEngine Enterprise."
enterprise_only: true
sidebar_position: 141
---

Each item of a [Scheduled Channel](../live-source/scheduled-channel.md) can fade in from a solid color when it starts and fade out to a solid color when it ends. Set the fade on the `<Item>` with the following attributes.

```xml
<Program name="1" scheduled="2026-10-07T20:00:00.000+09:00" repeat="true">
    <!-- Fades in from white and out to black, 1 second each -->
    <Item url="file://opening.mp4" duration="60000" fadeIn="1000" fadeInColor="white" fadeOut="1000" fadeOutColor="black" />

    <!-- Fades in from black and out to white, 1 second each -->
    <Item url="file://main.mp4" fadeIn="1000" fadeInColor="black" fadeOut="1000" fadeOutColor="white" />
</Program>
```

<table><thead><tr><th width="200">Attribute</th><th>Description</th></tr></thead><tbody><tr><td><code>fadeIn</code></td><td>Length of the fade in at the start of the item, in milliseconds. Optional, default <code>0</code> (no fade in).</td></tr><tr><td><code>fadeOut</code></td><td>Length of the fade out at the end of the item, in milliseconds. Optional, default <code>0</code> (no fade out).</td></tr><tr><td><code>fadeInColor</code></td><td>Color the item fades in from: <code>black</code> or <code>white</code>. Optional, default <code>black</code>.</td></tr><tr><td><code>fadeOutColor</code></td><td>Color the item fades out to: <code>black</code> or <code>white</code>. Optional, default <code>black</code>.</td></tr></tbody></table>

The attributes can be set on the items of both `<Program>` and `<FallbackProgram>`. The items of the [REST API](../rest-api/v1/virtual-host/application/scheduled-channel.md) take the same parameters.

:::info

`fadeOut` needs a known end: a file item, or an item with `duration`. For an item with no known end, such as a live `stream://` item without `duration`, only the fade in is applied.

:::
