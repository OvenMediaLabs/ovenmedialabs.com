---
title: onCuePoint Message Insertion
description: "Insert onCuePoint AMF0 messages when re-streaming OvenMediaEngine Enterprise streams over RTMP."
enterprise_only: true
sidebar_position: 131
---

When re-streaming (Push Publishing) a live stream to another system using the RTMP protocol, you can insert AMF0 messages. Utilizing this feature, you can deliver messages such as subtitle insertions and advertisement markers to another system. The method for inserting messages is as follows:

* If the Media Source received through the RTMP Provider includes a message, it will be automatically inserted.
* You can insert messages dynamically through the OvenMediaEngine's Send Event API.

## Inserting onCuePoint message

The `onCuePoint` message is used for the purpose of automatic ad cue point insertions to YouTube live broadcasts.

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
  "eventFormat": "amf",
  "events":[
    {
      "amfType": "onCuePoint.YouTube",
      "version": "0.1",
      "preRollTimeSec": 2.56,
      "cuePointStart": true,
      "breakDurationSec": 30,
      "spliceEventId": 0
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
    "eventFormat": "amf",
    "events":[
      {
        "amfType": "onCuePoint.YouTube",
        "version": "0.1",
        "preRollTimeSec": 2.56,
        "cuePointStart": true,
        "breakDurationSec": 30,
        "spliceEventId": 0
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

## Payload Example

Here’s an example of a payload encoded in AMF0 format for an `onCuePoint` message:

```
string-marker “onCuePoint”
object-marker
“type” string-marker “com.youtube.cuepoint”
“version” string-marker “0.1”
“pre_roll_time_sec” number-marker 2.56
“cue_point_start” boolean-marker 1
“break_duration_sec” number-marker 30
“splice_event_id” number-marker 0
UTF-8-empty object-end-marker
```
