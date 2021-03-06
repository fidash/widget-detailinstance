#Detail Instance Widget

[![GitHub license](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://raw.githubusercontent.com/fidash/widget-detailinstance/master/LICENSE)
[![Support badge](https://img.shields.io/badge/support-askbot-yellowgreen.svg)](http://ask.fiware.org)
[![Build Status](https://build.conwet.fi.upm.es/jenkins/view/FI-Dash/job/Widget%20Detail%20Instance/badge/icon)](https://build.conwet.fi.upm.es/jenkins/view/FI-Dash/job/Widget%20Detail%20Instance/)

This project is part of [FIWARE](https://www.fiware.org/). This widget is part of FI-Dash component included in FIWARE.

The widget displays all the attributes of an OpenStack Instance available to the user in FIWARE's Cloud. The widget also allows the user to reboot and delete the displayed instance.


## Wiring endpoints

The Detail Instance widget has the following wiring input endpoints:

|Label|Name|Friendcode|Type|Description|
|:--:|:--:|:--:|:--:|:--|
|Authentication|authentication|openstack-auth|text|Receive the authentication data via wiring.|
|Instance ID|instance_id|instance_id|text|Receives instance ID and OpenStack service token.|


And the following output endpoints:

|Label|Name|Friendcode|Type|Description|
|:--:|:--:|:--:|:--:|:--|
|Image ID|image_id|image_id|text|Sends an image ID and OpenStack service token.|
