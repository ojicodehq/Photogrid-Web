#!/usr/bin/env bash
#
# Build un APK release SIGNÉ puis le publie sur un hôte distant via SSH/SCP.
#
# Prérequis : la signature release doit être configurée dans android/
# (signingConfig dans app/build.gradle lisant un keystore + mots de passe
#  depuis android/gradle.properties — ces fichiers restent HORS du dépôt).
#
# Configurer avant usage (variables d'environnement) :
#   PHOTOGRID_REMOTE_HOST : hôte SSH de destination
#   PHOTOGRID_REMOTE_DIR  : dossier distant où déposer l'APK
#
# Usage : PHOTOGRID_REMOTE_HOST=... PHOTOGRID_REMOTE_DIR=... npm run publish:apk
#
set -euo pipefail

SLUG="photogrid"
APP_NAME="PhotoGrid"
REMOTE_HOST="${PHOTOGRID_REMOTE_HOST:?Définir PHOTOGRID_REMOTE_HOST (hôte SSH de destination)}"
REMOTE_DIR="${PHOTOGRID_REMOTE_DIR:?Définir PHOTOGRID_REMOTE_DIR (dossier distant des APK)}"
APK_SRC="android/app/build/outputs/apk/release/app-release.apk"

cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').version")

echo "→ Build web + synchronisation Android…"
npm run build
npx cap sync android

echo "→ Build de l'APK release (signé)…"
(cd android && ./gradlew assembleRelease)

if [ ! -f "$APK_SRC" ]; then
    echo "✗ APK introuvable : $APK_SRC" >&2
    exit 1
fi

echo "→ Génération du sidecar de métadonnées…"
TMP_JSON=$(mktemp)
trap 'rm -f "$TMP_JSON"' EXIT
printf '{"name":"%s","version":"%s"}\n' "$APP_NAME" "$VERSION" > "$TMP_JSON"
chmod 644 "$TMP_JSON"  # mktemp crée en 600 ; le sidecar doit rester lisible

echo "→ Envoi vers $REMOTE_HOST:$REMOTE_DIR…"
ssh "$REMOTE_HOST" "mkdir -p $REMOTE_DIR"
scp "$APK_SRC" "$REMOTE_HOST:$REMOTE_DIR/$SLUG.apk"
scp "$TMP_JSON" "$REMOTE_HOST:$REMOTE_DIR/$SLUG.json"

echo "✓ $SLUG.apk (v$VERSION) publié sur $REMOTE_HOST:$REMOTE_DIR."
