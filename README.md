#Detail Instance Widget

This project is part of [FIWARE](https://www.fiware.org/). This widget is part of FI-Dash component included in FIWARE.

The widget displays all the attributes of an OpenStack Instance available to the user in FIWARE's Cloud. The widget also allows the user to reboot and delete the displayed instance.


## Wiring endpoints

The Detail Instance widget has the following wiring endpoints:

|Way|Name|Type|Description|Label|Friendcode|
|:--:|:--:|:--:|:--:|:--:|:--:|
|output|image_id|text|Sends an image ID and OpenStack service token.|Image ID|image_id|
|input|instance_id|text|Receives instance ID and OpenStack service token.|Instance ID|instance_id|