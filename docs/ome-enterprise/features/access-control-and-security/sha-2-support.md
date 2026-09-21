---
title: SHA-2 Support
description: "Use SHA-2 as the hash algorithm for OvenMediaEngine Enterprise Alert, SignedPolicy, and AdmissionWebhooks authentication."
enterprise_only: true
sidebar_position: 113
---

OvenMediaEngine Enterprise provides the features to select `SHA-2` as the hash algorithm used for `Alert`, `SignedPolicy`, and `AdmissionWebhooks` authentication, in line with the security requirements of enterprise environments.

You can flexibly configure the environment and performance by directly selecting `SHA-256`, `SHA-384`, or `SHA-512` within the Settings (Server.xml) of OvenMediaEngine Enterprise.

## SHA-2 Settings

`SHA-2` is available for use with `<Alert>` (per `<Webhook>`), `<SignedPolicy>`, and `<AdmissionWebhooks>`, and can be configured in Server.xml as follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Server version="8">
  ...
  <Alert>
    <Webhooks>
      <Webhook>
        <HashAlgorithm>SHA-256</HashAlgorithm>
        ...
      </Webhook>
    </Webhooks>
    ...
  </Alert>
  ...
  <VirtualHosts>
    <VirtualHost>
      <SignedPolicy>
        <HashAlgorithm>SHA-256</HashAlgorithm>
        ...
      </SignedPolicy>
      ...
      <AdmissionWebhooks>
        <HashAlgorithm>SHA-256</HashAlgorithm>
        ...
      </AdmissionWebhooks>
      ...
    </VirtualHost>
  </VirtualHosts>
</Server>
```

### Hash Algorithm Values

There are a total of seven `<HashAlgorithm>` values are supported in OvenMediaEngine Enterprise:

#### SHA-1

<table><thead><tr><th width="151">Value</th><th>Expression</th></tr></thead><tbody><tr><td><p>SHA-1</p><p>* Default</p></td><td><code>&#x3C;HashAlgorithm></code><strong>`SHA-1`</strong><code>&#x3C;/HashAlgorithm></code></td></tr></tbody></table>

#### SHA-2

<table><thead><tr><th width="151">Value</th><th>Expression</th></tr></thead><tbody><tr><td>SHA-224</td><td><code>&#x3C;HashAlgorithm></code><strong>`SHA-224`</strong><code>&#x3C;/HashAlgorithm></code></td></tr><tr><td>SHA-256</td><td><code>&#x3C;HashAlgorithm></code><strong>`SHA-256`</strong><code>&#x3C;/HashAlgorithm></code></td></tr><tr><td>SHA-384</td><td><code>&#x3C;HashAlgorithm></code><strong>`SHA-384`</strong><code>&#x3C;/HashAlgorithm></code></td></tr><tr><td>SHA-512</td><td><code>&#x3C;HashAlgorithm></code><strong>`SHA-512`</strong><code>&#x3C;/HashAlgorithm></code></td></tr><tr><td>SHA-512/224</td><td><code>&#x3C;HashAlgorithm></code><strong>`SHA-512/224`</strong><code>&#x3C;/HashAlgorithm></code></td></tr><tr><td>SHA-512/256</td><td><code>&#x3C;HashAlgorithm></code><strong>`SHA-512/256`</strong><code>&#x3C;/HashAlgorithm></code></td></tr></tbody></table>
