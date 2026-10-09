#!/usr/bin/env bash
# Builds the Android app (APK): the web app in dist/ wrapped by MainActivity.
# Uses only the Android SDK's own tools (aapt2, d8, zipalign, apksigner) and
# the JDK's javac; no Gradle and no libraries to download.
#
# Needs: Node.js, JDK 17+, an Android SDK with platforms;android-36 and a
# build-tools package, and the release keystore (keep it safe: every update
# of the app must be signed with the same key or phones refuse to install it).
#
#   ANDROID_HOME=/path/to/android-sdk \
#   ARMORY_KEYSTORE=/path/to/armory-release.jks \
#   ARMORY_KEYSTORE_PASS='…' \
#   android/build.sh
#
# Output: android/out/armory-<version>.apk (version from package.json)
set -euo pipefail
cd "$(dirname "$0")/.."

SDK="${ANDROID_HOME:?set ANDROID_HOME to the Android SDK folder}"
: "${ARMORY_KEYSTORE:?set ARMORY_KEYSTORE to the release keystore file}"
: "${ARMORY_KEYSTORE_PASS:?set ARMORY_KEYSTORE_PASS to the keystore password}"
KEY_ALIAS="${ARMORY_KEY_ALIAS:-armory}"
PLATFORM="${ANDROID_PLATFORM:-android-36}"
BUILD_TOOLS="${ANDROID_BUILD_TOOLS:-$(ls "$SDK/build-tools" | sort -V | tail -1)}"
TOOLS="$SDK/build-tools/$BUILD_TOOLS"
ANDROID_JAR="$SDK/platforms/$PLATFORM/android.jar"
MIN_SDK=24
TARGET_SDK=35

VERSION=$(node -p "require('./package.json').version")
IFS=. read -r MAJOR MINOR PATCH <<<"$VERSION"
VERSION_CODE=$((MAJOR * 10000 + MINOR * 100 + PATCH))

BUILD=android/build
OUT=android/out
rm -rf "$BUILD"
mkdir -p "$BUILD/gen" "$BUILD/classes" "$BUILD/assets" "$OUT"

echo "› Web app"
npm run build --silent
cp -r dist "$BUILD/assets/www"
rm -f "$BUILD/assets/www/sw.js" # offline support is only for the website

echo "› Resources and manifest"
"$TOOLS/aapt2" compile --dir android/res -o "$BUILD/res.zip"
"$TOOLS/aapt2" link -o "$BUILD/app.apk" \
  -I "$ANDROID_JAR" \
  --manifest android/AndroidManifest.xml \
  --java "$BUILD/gen" \
  -A "$BUILD/assets" \
  --min-sdk-version "$MIN_SDK" --target-sdk-version "$TARGET_SDK" \
  --version-code "$VERSION_CODE" --version-name "$VERSION" \
  "$BUILD/res.zip"

echo "› Java"
javac -nowarn -Xlint:-options --release 11 -encoding UTF-8 \
  -classpath "$ANDROID_JAR" -d "$BUILD/classes" \
  $(find android/src "$BUILD/gen" -name '*.java')
"$TOOLS/d8" --release --min-api "$MIN_SDK" --lib "$ANDROID_JAR" --output "$BUILD" \
  $(find "$BUILD/classes" -name '*.class')
(cd "$BUILD" && zip -q app.apk classes.dex)

echo "› Align and sign"
"$TOOLS/zipalign" -p -f 4 "$BUILD/app.apk" "$BUILD/app-aligned.apk"
APK="$OUT/armory-$VERSION.apk"
"$TOOLS/apksigner" sign \
  --ks "$ARMORY_KEYSTORE" --ks-pass env:ARMORY_KEYSTORE_PASS --ks-key-alias "$KEY_ALIAS" \
  --out "$APK" "$BUILD/app-aligned.apk"
"$TOOLS/apksigner" verify "$APK"

echo "✓ $APK (version $VERSION, code $VERSION_CODE)"
