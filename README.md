# nvrServer

nvrServer is QT/FFMPEG-based demo application for LINUX-ARM-HISIV500 platform.
It can be executed on supported NVR cameras of this platform.

---

## Compiling

Please install docker in your favourite distro before compiling this application.
Once installed please follow these steps:

1. Clone this repository and its submodules into your favourite folder
2. Pull a LINUX-ARM-HISIV500 docker container (see below) which contains the toolchain
3. Run pulled container by mounting externally this repository
4. Compile with a simple bash script

```
# git clone --recursive https://github.com/HCTLab/nvrServer
# docker pull kelvinlawson/hi3519v101
# docker run --mount type=bind,source="$(pwd)",target=/GIT -it kelvinlawson/hi3519v101

root@052a9c6aa69a:~# cd /GIT/nvrServer
root@052a9c6aa69a:~# ./compile.sh
root@052a9c6aa69a:~# exit
```

When process completes, you can find the packaged app in 'nvrServer/APP' directory.

## Libraries

This application uses FFMPEG and QT libraries.
QT can be found precompiled for this platform at: https://github.com/yeahtoo/qt-hi3519v101
FFMPEG must be manually compiled by using **kelvinlawson/hi3519v101** container:

```
# git clone https://github.com/cisco-open-source/ffmpeg
# docker pull kelvinlawson/hi3519v101
# docker run --mount type=bind,source="$(pwd)",target=/GIT -it kelvinlawson/hi3519v101

root@052a9c6aa69a:~# ln -s /GIT/qt-hi3519v101/qt-everywhere-opensource-src-4.8.6 /opt/qt4.8.6
root@052a9c6aa69a:~# cp -R /opt/qt4.8.6/mkspecs /root
root@052a9c6aa69a:~# export QMAKESPEC=/root/mkspecs/qws/linux-arm-hisiv500-g++
root@052a9c6aa69a:~# export PATH=$PATH:/opt/qt4.8.6/bin
root@052a9c6aa69a:~# cd /GIT/ffmpeg/

root@fb1b686b3639:/GIT/ffmpeg# export CCPREFIX="/opt/hisi-linux/x86-arm/arm-hisiv500-linux/target/bin/arm-hisiv500-linux-"
root@fb1b686b3639:/GIT/ffmpeg# ./configure --disable-yasm --enable-cross-compile --cross-prefix=arm-hisiv500-linux- --arch=armv5te --target-os=linux
root@fb1b686b3639:/GIT/ffmpeg# make
root@fb1b686b3639:/GIT/ffmpeg# make install
root@fb1b686b3639:/GIT/ffmpeg# cp -aR /usr/local /GIT/ffmpeg_compiled
root@fb1b686b3639:/GIT/ffmpeg# exit
```

After process completes, you will find a new folder called 'ffmpeg_compiled' with all FFMPEG libraries.


Juancho 2019
