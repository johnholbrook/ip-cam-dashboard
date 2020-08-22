# ip-cam-dashboard

## Overview
This is an alternate viewer for the Android app "[IP Webcam](https://play.google.com/store/apps/details?id=com.pas.webcam)" by Pavel Khlebovich.

It's designed to be useful when mounting a phone in portrait orientation on a remotely-operated vehicle, and viewing live video and telemetry from the vehicle.

![Screenshot of Interface](https://user-images.githubusercontent.com/3682581/90960702-90343780-e471-11ea-8463-d720e8eaff15.png)

Features:
* View live video feed from phone
* Select Front- or Rear-Facing Camera
* Control phone flash
* Toggle and configure "Night Vision Mode" (camera gain and exposure)
* Live telemetry from phone:
    * Battery Charge Level
    * Battery Temperature
    * Phone orientation (pitch, roll, yaw)
* Take still-image snapshots from video feed

## Installation and Use
To use this dashboard, first clone the repository into the directory of your choice:
```sh
git clone https://github.com/johnholbrook/ip-cam-dashboard.git
```
Then, you'll need to serve the webpage locally (just opening `index.html` in your browser won't work due to CORS). You can use any http server you like for this, but one easy way is to use the server class built in to Python 3's `http` module:

```python3 -m http.server```
