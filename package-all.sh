#!/bin/bash

PROJECT_PATH=$(pwd)
OUTPUTS_PATH="$PROJECT_PATH/outputs"

if [ ! -d "$OUTPUTS_PATH" ]; then
    mkdir -p "$OUTPUTS_PATH"
fi


## 打包Android
# 删除旧的Bundle文件
# shellcheck disable=SC2164
cd PROJECT_PATH
cd ./android || exit
rm -rf ./app/src/main/assets/index.android.bundle

./gradlew clean
./gradlew assembleRelease


## 打包iOS
cd PROJECT_PATH || exit
cd ./ios || exit

# 删除旧的Bundle文件
rm -rf bundle/*

xcodebuild clean

xcodebuild archive -workspace "$(echo *.xcodeproj)" -scheme "$(echo *.xcodeproj | cut -d . -f 1)" -archivePath "$OUTPUTS_PATH"

xcodebuild export






