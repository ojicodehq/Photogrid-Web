# PhotoGrid

PWA d'impression de photos sur page **A4 / A5 / Letter / Legal**. Composez une
grille de photos et imprimez-la à l'échelle millimétrique exacte.

**React 19 + Vite + Tailwind 4 + base-ui.** Application 100 % client, installable
(PWA), conçue pour fonctionner hors-ligne. Également packagée en application
Android via Capacitor.

<!-- Captures d'écran à ajouter ici (mobile + desktop). -->

## Installation

**En PWA (recommandé)** : ouvrez le site dans votre navigateur, puis
menu → *Ajouter à l'écran d'accueil*. L'app s'installe et fonctionne hors-ligne.

**En APK Android** : autorisez l'installation depuis des sources inconnues,
puis ouvrez le fichier `.apk`.

## Fonctionnement

1. Ajoutez vos photos.
2. Choisissez le format de page (A4, A5, Letter, Legal) et l'orientation.
3. Réglez la grille : colonnes, lignes, marges, espacement.
4. Imprimez ou exportez en PDF, au format millimétrique exact.

## Prérequis

- Node.js >= 20

## Développement

```bash
npm install
npm run dev        # serveur de dev Vite (http://localhost:5173)
npm run build      # build de production vers dist/
npm run preview    # prévisualise le build de production
npm run lint       # ESLint
```

## Android (Capacitor)

```bash
npm run build:android   # build web + synchronisation du projet Android
npm run open:android    # ouvre le projet dans Android Studio
npm run release:apk     # build un APK release signé (signature à configurer dans android/)
```

## Déploiement

Le build est statique (`dist/`) : servez-le avec n'importe quel serveur HTTP
statique. Un exemple Docker (nginx) est fourni : voir `Dockerfile`, `nginx.conf`
et `docker-compose.yml`. Le `docker-compose.yml` lit la variable `PUBLIC_DOMAIN`
(cf. `.env.example`) pour le routage.

## Licence

Tous droits réservés. Voir [`LICENSE`](./LICENSE).
