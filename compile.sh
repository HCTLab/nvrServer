#!/bin/sh
if [ ! -d "/opt/qt4.8.6" ]; then
  ln -s /GIT/qt-hi3519v101/qt-everywhere-opensource-src-4.8.6 /opt/qt4.8.6
fi
if [ ! -d "/root/mkspecs" ]; then
  cp -R /opt/qt4.8.6/mkspecs /root
fi
export QMAKESPEC=/root/mkspecs/qws/linux-arm-hisiv500-g++
export PATH=$PATH:/opt/qt4.8.6/bin

rm APP/*.app 2> /dev/null
qmake
make
arm-hisiv500-linux-strip nvrServer
cp nvrServer APP
cd APP && ../packapp -p
