---
title: Getting Started with Web Console
description: "Set up the OvenMediaEngine Enterprise Web Console via its environment variable file and start the service."
sidebar_position: 50
---

The configuration for the Web Console is managed through an environment variable file. When starting with the `systemctl start ovenstudio` command, it loads the environment variables from the following path:

```bash
/usr/share/ovenmediaengine/ovenstudio/system.env
```

## Configuring `system.env`

The default configuration of the environment variable file is as follows:

```bash
OS_SERVER_HTTP_PORT=8080

LOG_DIR=/var/log/ovenmediaengine/ovenstudio

JAVA_HOME=/usr/share/ovenmediaengine/ovenstudio/jvm/jre
```


:::info

If you have configured the Host IP, the following additional information is included:

* `OME_HOST_IP=Your.HOST.IP.Address`

:::


### Environment Variables

<table><thead><tr><th width="239">Env</th><th>Default Value</th></tr></thead><tbody><tr><td>OS_SERVER_PORT</td><td>⚠️ <strong>Deprecated since 0.20.7.1.</strong> Use <code>OS_SERVER_HTTP_PORT</code> instead.</td></tr><tr><td>OS_SERVER_HTTP_ENABLED</td><td>Enable HTTP for Web Console: `true`. Set to `false` to disable HTTP serving.</td></tr><tr><td>OS_SERVER_HTTP_PORT</td><td>HTTP service port where Web Console will run: `8080`</td></tr><tr><td>OS_SERVER_HTTPS_ENABLED</td><td>Enable HTTPS for Web Console: `false`</td></tr><tr><td>OS_SERVER_HTTPS_PORT</td><td>HTTPS service port where Web Console will run: `8443`</td></tr><tr><td>OS_SERVER_HTTPS_CERT</td><td>(required / no default) Path to the SSL certificate file when HTTPS is enabled, for example: `/path/to/cert.crt`</td></tr><tr><td>OS_SERVER_HTTPS_KEY</td><td>(required / no default) Path to the SSL private key file when HTTPS is enabled, for example: `/path/to/cert.key`</td></tr><tr><td>OS_SERVER_HTTPS_CHAIN_CERT</td><td>(required / no default) Path to the SSL chain certificate file when HTTPS is enabled, for example: `/path/to/chain.crt`</td></tr><tr><td>LOG_DIR</td><td>Log storage path of Web Console: `/var/log/ovenmediaengine/ovenstudio`</td></tr><tr><td>JAVA_HOME</td><td>JAVA installation path: `/usr/share/ovenmediaengine/ovenstudio/jvm/jre`</td></tr><tr><td>OME_HOST_IP</td><td>Host IP of OvenMediaEngine</td></tr></tbody></table>


:::info

If you prefer to use a different version of Java that you manage, modify the **`JAVA_HOME`** path accordingly and restart the Web Console.

* **JAVA 17+**

:::


## Admin Password

The admin password for the Web Console is managed in a file. If the `.admin-password` file does not exist when the Web Console starts, it will be automatically generated, and the default password will be `ovenstudio`.

```sh
$ cat /usr/share/ovenmediaengine/ovenstudio/conf/.admin-password
ovenstudio
$
```

### Change password

You can directly modify the `.admin-password` file to change the password as follows. The updated password will be applied immediately without restarting the Web Console.

```sh
$ echo 'new-password' > /usr/share/ovenmediaengine/ovenstudio/conf/.admin-password
$ cat /usr/share/ovenmediaengine/ovenstudio/conf/.admin-password
new-password
$
```


:::info

You can also change the password through the UI using options like "[Change Password](web-console-overview/change-password.md)".

:::


## Enabling HTTPS

To manually enable HTTPS for the Web Console, edit `system.env` and set the following variables:

```bash
OS_SERVER_HTTPS_ENABLED=true
OS_SERVER_HTTPS_PORT=8443
OS_SERVER_HTTPS_CERT=/path/to/cert.crt
OS_SERVER_HTTPS_KEY=/path/to/cert.key
OS_SERVER_HTTPS_CHAIN_CERT=/path/to/chain.crt
```

All three certificate paths are required. The files must be in PEM format. For supported file names and formats by certificate authority, see the [Custom SSL Certificate File Guide](web-console-overview/ssl-configuration/custom-ssl-certificate-file-guide.md).

Once configured, restart the Web Console for the changes to take effect. The Web Console will then be accessible at `https://Your.Host.Address:8443`.

:::tip

To automatically configure HTTPS for both the Web Console and OvenMediaEngine at once, see [SSL Configuration](web-console-overview/ssl-configuration/README.md).

:::

## Apply Changes

If the Environment Variables are changed, you must restart the Web Console (ovenstudio) for the changes to take effect. You can restart the Web Console using the following command:

```bash
$ sudo systemctl restart ovenstudio
```
