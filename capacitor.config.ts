import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "fr.ojicode.photogrid",
  appName: "PhotoGrid",
  webDir: "dist",
  android: {
    buildOptions: {
      signingType: "apksigner",
    },
  },
  plugins: {
    // Live updates OTA auto-hébergées (Capgo). On ne pousse que la couche
    // web (dist/) aux APK déjà installés, sans repasser par le store.
    // - autoUpdate true : vérifie au lancement, télécharge en fond, applique
    //   au prochain redémarrage de l'app (jamais en plein milieu de session).
    // - updateUrl : notre endpoint public servi par nginx (cf. nginx.conf
    //   location /ota/). Le téléphone n'étant pas sur le LAN, il faut du HTTPS
    //   public ; Cloudflare met le bundle en cache CDN.
    // - publicKey : déchiffrement E2E. Les bundles sont signés/chiffrés avec
    //   la clé privée (.capgo_key_v2, hors repo). Même un serveur compromis ne
    //   peut pas pousser une mise à jour que l'app accepte.
    // - statsUrl/channelUrl vidés : aucune télémétrie tierce (self-hosted,
    //   cohérent avec la politique « rien stocker »).
    // - resetWhenUpdate : purge les bundles OTA quand un nouvel APK natif
    //   (nouvelle version embarquée) est installé.
    CapacitorUpdater: {
      autoUpdate: true,
      updateUrl: "https://photogrid.ojicode.fr/ota/updates.json",
      statsUrl: "",
      channelUrl: "",
      resetWhenUpdate: true,
      publicKey:
        "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA2/zmVSm+jPqGlVeA1yBXO4oZUHZFD9cpV7YyrUOvgUkrs0L/vMn4\n3l8qGVLieA+dEmWjmM2Q4OJKOfqCeRdHQ2kX2bOrWtXwJSHlkgK9cVPho05Xmv8J\nWFnIv+3dnGWSqkt4njPrwMpwGhvTIttGUMMSdNhqlqPOGzVwFED8cXuk7Reum9zC\ne81g/RTc3FMUj1Z7BcXOfMVUy8+6wRmhXAgFo5XfHKW6Qq5UZgE1Q+yPIoLz9rjm\nX7vrz/BSd3BJcQY9d34Yj/7nvTQJb5LtmpYw4/H0YRayoIAW3RUxc/hdsIoMZNot\nKXTm3Nb5rZehnENVe2pXgVEKpjlD3IuJgwIDAQAB\n-----END RSA PUBLIC KEY-----\n",
    },
  },
};

export default config;
