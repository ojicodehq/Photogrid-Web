#!/usr/bin/env node
/**
 * Bump de version « patch » synchronisé sur les 3 sources de vérité :
 *   - package.json        → version (lue par le sidecar APK du dashboard)
 *   - package-lock.json   → champ version racine (si présent)
 *   - android/app/build.gradle → versionName + versionCode (incrément +1)
 *
 * Android exige un versionCode strictement croissant pour proposer une
 * mise à jour par-dessus une install existante : on l'incrémente donc à
 * chaque release, en plus du versionName lisible.
 *
 * Usage : node scripts/bump-version.mjs   (appelé par `npm run release:apk`)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// --- package.json ---
const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);
if ([major, minor, patch].some(Number.isNaN)) {
  throw new Error(`Version package.json non sémantique : ${pkg.version}`);
}
const next = `${major}.${minor}.${patch + 1}`;
pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

// --- package-lock.json (champ version racine) ---
const lockPath = join(root, "package-lock.json");
if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  lock.version = next;
  if (lock.packages?.[""]) lock.packages[""].version = next;
  writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");
}

// --- android/app/build.gradle ---
const gradlePath = join(root, "android", "app", "build.gradle");
let gradle = readFileSync(gradlePath, "utf8");
const codeMatch = gradle.match(/versionCode\s+(\d+)/);
if (!codeMatch) throw new Error("versionCode introuvable dans build.gradle");
const nextCode = Number(codeMatch[1]) + 1;
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${nextCode}`)
  .replace(/versionName\s+"[^"]*"/, `versionName "${next}"`);
writeFileSync(gradlePath, gradle);

console.log(`✓ Version bumpée : ${major}.${minor}.${patch} → ${next} (versionCode ${nextCode})`);
