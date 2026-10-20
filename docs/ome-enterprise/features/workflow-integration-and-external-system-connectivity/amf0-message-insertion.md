---
title: AMF0 Message Insertion
description: "Insert AMF0 messages when re-streaming OvenMediaEngine Enterprise live streams over RTMP push publishing."
enterprise_only: true
sidebar_position: 129
---

When re-streaming (Push Publishing) a live stream to another system using the RTMP protocol, you can insert AMF0 messages. Utilizing this feature, you can deliver messages such as subtitle insertions and advertisement markers to another system. The method for inserting messages is as follows:

* If the Media Source received through the RTMP Provider includes a message, it will be automatically inserted.
* You can insert messages dynamically through the OvenMediaEngine's Send Event API or continuously through XML configuration.

## onTextData

### Inserting the onTextData via the Send Event API | 0.17.3.0+

The `onTextData` message is used for various purposes, such as subtitle insertion, ad marker insertion, and more.

#### API Interface

**Request**

<details>

<summary><span class="http-method http-method-post">POST</span> /v1/vhosts/&#x7B;vhost&#x7D;/apps/&#x7B;app&#x7D;/streams/&#x7B;stream&#x7D;:sendEvent</summary>

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
      "amfType": "onTextData",
      "data": {
        "key1": "value",  // String Type
        "key2": 354.1,    // Number Type [Double]
        "key3": true     // Boolean Type [true | false]
      }
    }
  ]
}
```

</details>

<details>

<summary><span class="http-method http-method-post">POST</span> /v1/vhosts/&#x7B;vhost&#x7D;/apps/&#x7B;app&#x7D;/streams/&#x7B;stream&#x7D;:sendEvents</summary>

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
        "amfType": "onTextData",
        "data": {
          "key1": "value",  // String Type
          "key2": 354.1,    // Number Type [Double]
          "key3": true     // Boolean Type [true | false]
        }
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

### Inserting the onTextData through XML Configuration | 0.18.2.0+

For scenarios requiring continuous `onTextData` message insertion, you can configure this behavior through XML configuration. Create an XML file defining the `onTextData` message insertion events and enable `EventGenerator` in `Server.xml`.

#### Configuration Example

**Server.xml:** You can enable the EventGenerator functionality for the `onTextData` message insertion by adding `<Application><EventGenerator>`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Server version="8">
  ...
  <VirtualHosts>
    <VirtualHost>
      <Applications>
        <Application>
          ...
          <EventGenerator>
            <Enable>true</Enable>
            <Path>events/send_event_info.xml</Path>
          </EventGenerator>
        </Application>
      </Applications>
    </VirtualHost>
  </VirtualHosts>
</Server>
```

<table><thead><tr><th width="133">Element</th><th>Description</th></tr></thead><tbody><tr><td><code>&#x3C;Enable></code></td><td><p>Sets activation status to `true` or `false`.</p><ul><li>Default: `false`</li></ul></td></tr><tr><td><code>&#x3C;Path></code></td><td>Sets the path to the XML file defining the `onTextData` message insertion details. If a relative path is specified, the directory containing the `Server.xml` file is used as the base.</td></tr></tbody></table>

**XML Defining the onTextData message Insertion Events:** Create an XML file defining `onTextData` message insertion events at the path specified in `Server.xml`. In this example, it's `send_event_info.xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<EventInfo>
  <Event>
    <Enable>true</Enable>
    <SourceStreamName>stream*</SourceStreamName>
    <Interval>2000</Interval>
    <EventFormat>amf</EventFormat>
    <EventType>video</EventType>
    <Values>
      <AmfType>onTextData</AmfType>
      <Data>
        <key1 type="string">value</key1>    // String Type
        <key2 type="double">354.1</key2>    // Number Type [Double]
        <key3 type="boolean">true</key3>    // Boolean Type [true | false]
        <key4>${EpochTime}</key4>
      </Data>
    </Values>
  </Event>
</EventInfo>
```

<table><thead><tr><th width="234">Parameter</th><th>Description</th></tr></thead><tbody><tr><td><code>&#x3C;Enable></code></td><td><p>Sets activation status to `true` or `false`.</p><ul><li>Default: `false`</li></ul></td></tr><tr><td><code>&#x3C;SourceStreamName></code></td><td><p>Specifies the target stream name.</p><ul><li>It supports wildcards (`*`) for pattern matching.</li></ul></td></tr><tr><td><code>&#x3C;Interval></code></td><td>Sets event occurrence interval in milliseconds (ms).</td></tr><tr><td><code>&#x3C;EventFormat></code></td><td>Specifies event format (use `amf` format).</td></tr><tr><td><code>&#x3C;EventType></code></td><td><p>Specifies the event type.</p><ul><li>Default: `video`</li></ul></td></tr><tr><td><code>&#x3C;Values></code></td><td>Contains the value of the event data.</td></tr><tr><td><code>&#x3C;Values>&#x3C;amfType></code></td><td>Specifies AMF0 message type (use `onTextData` format).</td></tr><tr><td><code>&#x3C;Values>&#x3C;Data></code></td><td><p>Specifies the array of data to be transmitted</p><ul><li>You can use the <code>&#x3C;key></code> tag, and if the type attribute is not specified, it defaults to string.</li><li>It supports the macro `${EpochTime}`, which is replaced with the server's current epoch time in milliseconds when transmitted (e.g., 1747147513056).</li></ul></td></tr></tbody></table>


:::info

Changes made to the event definition XML file are immediately applied without needing to restart OvenMediaEngine.

:::


### AMF0.onTextData Payload Format

Here’s an example of an `onTextData` message payload encoded in AMF0. A Common Object (ECMA Array) consists of a list of key and value, where the value type can be String, Number, or Boolean.

```
string-maker "onTextData"         // Command Name ECMA Array: 
ecma-array-maker
"key1" string-maker "value"       // String Type
"key2" number-maker 354.1         // Number Type [Double]
"key3" boolean-maker 1            // Boolean Type [1 | 0]
...
object-end-marker
```

## onUserDataEvent

### Inserting the onUserDataEvent via the Send Event API | 0.19.1.1+

The `onUserDataEvent` message is used for various purposes, such as subtitle insertion, ad marker insertion, and more.

#### API Interface

**Request**

<details>

<summary><span class="http-method http-method-post">POST</span> /v1/vhosts/&#x7B;vhost&#x7D;/apps/&#x7B;app&#x7D;/streams/&#x7B;stream&#x7D;:sendEvent</summary>

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
        "eventFormat": "amf",
        "events": [
            {
                "amfType": "onUserDataEvent",
                "data": {
                    "key1": "value",    // String Type
                    "key2": 354.1       // Number Type [Double]
                    "key3": true        // Boolean Type [true | false]
                }
            }
        ]
    }
]
```

</details>

<details>

<summary><span class="http-method http-method-post">POST</span> /v1/vhosts/&#x7B;vhost&#x7D;/apps/&#x7B;app&#x7D;/streams/&#x7B;stream&#x7D;:sendEvents</summary>

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
        "eventFormat": "amf",
        "events": [
            {
                "amfType": "onUserDataEvent",
                "data": "<XMLTag>{\"time\":\"2026-09-09T02:07:42.934Z\",\"program\":\"adsection\"}<\/XMLTag>"
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

### Inserting the onUserDataEvent through XML Configuration | 0.19.1.1+

For scenarios requiring continuous `onUserDataEvent` message insertion, you can configure this behavior through XML configuration. Create an XML file defining the `onUserDataEvent` message insertion events and enable `EventGenerator` in `Server.xml`.

#### Configuration Example

**Server.xml:** You can enable the EventGenerator functionality for the `onUserDataEvent` message insertion by adding `<Application><EventGenerator>`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Server version="8">
  ...
  <VirtualHosts>
    <VirtualHost>
      <Applications>
        <Application>
          ...
          <EventGenerator>
            <Enable>true</Enable>
            <Path>events/send_event_info.xml</Path>
          </EventGenerator>
        </Application>
      </Applications>
    </VirtualHost>
  </VirtualHosts>
</Server>
```

<table><thead><tr><th width="133">Element</th><th>Description</th></tr></thead><tbody><tr><td><code>&#x3C;Enable></code></td><td><p>Sets activation status to `true` or `false`.</p><ul><li>Default: `false`</li></ul></td></tr><tr><td><code>&#x3C;Path></code></td><td>Sets the path to the XML file defining the `onUserDataEvent` message insertion details. If a relative path is specified, the directory containing the `Server.xml` file is used as the base.</td></tr></tbody></table>

**XML Defining the onTextData message Insertion Events:** Create an XML file defining `onUserDataEvent` message insertion events at the path specified in `Server.xml`. In this example, it's `send_event_info.xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<EventInfo>
  <!-- Simple -->
  <Event>
    <SourceStreamName>schedule*</SourceStreamName>
    <Interval>1000</Interval>
    <EventFormat>amf</EventFormat>
    <Values>
      <AmfType>onUserDataEvent</AmfType>
      <Data>
         <key1>value</key1>,    // String Type, Default
         <key1 type="string">value</key1>,    // String Type
         <key2 type="double">354.1</key2>,    // Number Type [Double]
         <key3 type="boolean">true</key3>      // Boolean Type [true | false]
      </Data>
    </Values>
  </Event>
  
  <!-- Single value data format below (Example: inserting XML data) --> 
  <Event>
    <SourceStreamName>schedule*</SourceStreamName>
    <Interval>1000</Interval>
    <EventFormat>amf</EventFormat>
    <Values>
      <AmfType>onUserDataEvent</AmfType>
      <Data><![CDATA[<XMLTag>{"json":"value"}</XMLTag>]]></Data>
    </Values>
  </Event>
</EventInfo>
```

<table><thead><tr><th width="234">Parameter</th><th>Description</th></tr></thead><tbody><tr><td><code>&#x3C;SourceStreamName></code></td><td><p>Specifies the target stream name.</p><ul><li>It supports wildcards (`*`) for pattern matching.</li></ul></td></tr><tr><td><code>&#x3C;Interval></code></td><td>Sets event occurrence interval in milliseconds (ms).</td></tr><tr><td><code>&#x3C;EventFormat></code></td><td>Specifies event format (use `amf` format).</td></tr><tr><td><code>&#x3C;Values></code></td><td>Contains the value of the event data.</td></tr><tr><td><code>&#x3C;Values>&#x3C;amfType></code></td><td>Specifies AMF0 message type (use `onUserDataEvent` format).</td></tr><tr><td><code>&#x3C;Values>&#x3C;Data></code></td><td><p>Specifies the array of data to be transmitted</p><ul><li>You can use the <code>&#x3C;key></code> tag, and if the type attribute is not specified, it defaults to string.</li><li>It supports the macro `${EpochTime}`, which is replaced with the server's current epoch time in milliseconds when transmitted (e.g., 1747147513056).</li></ul></td></tr></tbody></table>


:::info

Changes made to the event definition XML file are immediately applied without needing to restart OvenMediaEngine.

:::


### AMF0.onUserDataEvent Payload Format

This is an example of an AMF0-encoded `onUserDataEvent` message payload. It can be structured as a Common Object (ECMA Array) or as a single value, and the value type can be String, Number, or Boolean.

```
[KV Array Form]

string-maker "onUserDataEvent"      // Command Name ECMA Array: 
ecma-array-maker
"key1" string-maker "value"    // String Type
"key2" number-maker 354.1      // Number Type [Double]
"key3" boolean-maker 1         // Boolean Type [1 | 0]
...
object-end-master

[Single Value Form]

string-maker "onUserDataEvent"     // Command Name ECMA Array: 
[string|number-boolean]-maker "value"  // String Type | Number Type [Double] | Boolean Type [1 | 0]
```
