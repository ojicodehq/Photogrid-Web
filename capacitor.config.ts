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
};

export default config;
