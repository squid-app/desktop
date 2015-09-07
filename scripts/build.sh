#!/bin/bash

os=${OSTYPE//[0-9.]/}

# Get the full path of this script
if [[ ${0} == /* ]]; then
  full_path="$0"
else
  full_path="${PWD}/${0#./}"
fi

# Remove /scripts/release.sh to get the root directory
root_dir=${full_path%/*/*}

gulp build

release_dir="$root_dir/release"
build_dir="$root_dir/build"
deps_dir="$root_dir/node_modules/nw/nwjs"

mkdir -p $release_dir

rm -rf $release_dir/*

pushd $build_dir
 zip -r $release_dir/app.nw *
popd

cd $release_dir

cp -R "$deps_dir/nwjs.app" .
mv nwjs.app Squid.app
rm Squid.app/Contents/Info.plist
rm Squid.app/Contents/Resources/nw.icns
cp "$build_dir/Info.plist" Squid.app/Contents
cp app.nw Squid.app/Contents/Resources/app.nw
cp "$root_dir/osx/squid.icns" Squid.app/Contents/Resources
codesign -d --deep-verify -v -v -v Squid.app

rm $release_dir/app.nw

test -f squid-lastest.dmg && rm squid-lastest.dmg
$root_dir/scripts/create-dmg/create-dmg \
--volname "Squid Installer" \
--volicon "$root_dir/osx/squid.icns" \
--background "$root_dir/osx/dmg_background.png" \
--window-pos 200 120 \
--window-size 500 350 \
--icon-size 100 \
--icon Squid.app 150 160 \
--hide-extension Squid.app \
--app-drop-link 350 155 \
squid-lastest.dmg \
.
