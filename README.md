# MediaBunny App

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MPL--2.0-blue?style=for-the-badge)

### 💾 Application web auto-hébergée moderne pour la conversion de fichiers média

[Installation](#-installation) • [Déploiement](#-déploiement-docker) • [Documentation](#-documentation) • [API](#-api-endpoints)

</div>

---

## 🚀 Fonctionnalités

- **Conversion multi-formats** - MP4, WebM, MP3, WAV, et plus
- **Extraction audio** - Extraction audio depuis vidéo
- **Analyse métadonnées** - Analyse complète des informations média
- **Édition vidéo** - Découpage, trim, redimensionnement, rotation
- **Interface moderne** - Vue 3 + Tailwind CSS v4 + DaisyUI 5
- **Auto-hébergé** - Contrôle total de vos données
- **API REST complète** - Intégration facile dans vos workflows
- **Docker ready** - Déploiement en un clic

## ⚙️ Formats et codecs supportés

MediaBunny utilise l'API **WebCodecs** du navigateur, ce qui limite les formats supportés aux codecs natifs de votre environnement.

### Codecs supportés

| Type | Formats supportés | Utilisation |
|------|------------------|-------------|
| **Vidéo** | H.264 (AVC), VP8, VP9, AV1 | Conversion, redimensionnement, trim |
| **Audio** | AAC, Opus, MP3, Vorbis | Extraction, conversion |
| **Conteneurs** | MP4, WebM, WAV | Input/Output |

### ⚠️ Limitations importantes

**Codecs NON supportés (erreur "undecodable_source_codec"):**
- H.265 (HEVC) - support limité
- ProRes, DNxHD, DivX
- Codecs propriétaires

**Solutions:**
1. 🌐 **Utiliser MediaBunny côté client** (navigateur) où WebCodecs est pleinement implémenté
2. 🔄 **Pré-convertir avec FFmpeg** pour compatibilité universelle
3. 🚀 **Migrer vers FFmpeg côté serveur** (voir [FFMPEG_GUIDE.md](FFMPEG_GUIDE.md))

> **Note**: En environnement Node.js/Docker, le support des codecs est plus limité. Pour une production robuste, FFmpeg est recommandé.

## 📌 Technologies

### Backend
- **Runtime**: Node.js 20+ avec Express
- **Langage**: TypeScript
- **Conversion**: MediaBunny 1.26.0
- **Upload**: Multer
- **Sécurité**: Helmet.js, CORS

### Frontend
- **Framework**: Vue.js 3.5+ (Composition API)
- **Build**: Vite 6.x
- **Langage**: TypeScript
- **Styling**: Tailwind CSS 4.0 (CSS-first)
- **UI**: DaisyUI 5.5
- **State**: Pinia
- **HTTP**: Axios

## 📋 Prérequis

- Node.js 20 ou supérieur
- npm 10 ou supérieur
- Docker et Docker Compose (optionnel)

## 🛠️ Installation

### Méthode 1: Docker (recommandé)

> **Warning**: Si vous ne pouvez pas vous connecter, assurez-vous d'accéder au service via localhost ou https, sinon définissez `HTTP_ALLOWED=true`

```yaml
# docker-compose.yml
services:
  mediabunny:
    image: ghcr.io/frankkubler/mediabunny-app:latest
    container_name: mediabunny-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MAX_FILE_SIZE=500000000
      # - HTTP_ALLOWED=true # décommenter si accès en HTTP
    volumes:
      - ./uploads:/app/server/uploads
      - ./output:/app/server/output
```

Puis démarrer:
```bash
docker-compose up -d
```

Accéder à l'application sur `http://localhost:3000`

### Méthode 2: Installation manuelle

**1. Cloner le dépôt**
```bash
git clone https://github.com/frankkubler/mediabunny-app.git
cd mediabunny-app
```

**2. Installer les dépendances**
```bash
npm run install:all
```

**3. Configuration**

Créer `server/.env`:
```env
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=500000000
UPLOAD_DIR=./uploads
OUTPUT_DIR=./output
CORS_ORIGIN=http://localhost:5173
```

Créer `client/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

**4. Lancer en développement**
```bash
npm run dev
```

- Serveur : `http://localhost:3000`
- Client : `http://localhost:5173`

**5. Build production**
```bash
npm run build
npm start
```

## 📁 Structure du projet

```
mediabunny-app/
├── server/                # Backend Node.js + Express
│   ├── src/
│   │   ├── controllers/   # Logique métier
│   │   ├── routes/        # Routes API
│   │   ├── services/      # Services (MediaBunny)
│   │   ├── middleware/    # Middlewares
│   │   └── utils/         # Utilitaires
│   ├── uploads/           # Fichiers uploadés
│   └── output/            # Fichiers convertis
├── client/                # Frontend Vue.js 3
│   ├── src/
│   │   ├── components/    # Composants Vue
│   │   ├── views/         # Pages
│   │   ├── stores/        # State management (Pinia)
│   │   └── services/      # Services API
│   └── dist/              # Build production
├── docker-compose.yml     # Configuration Docker
└── Dockerfile             # Image Docker
```

## 📡 API Endpoints

### Media

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/media/upload` | Upload un fichier |
| `GET` | `/api/media/metadata/:fileId` | Récupère les métadonnées |
| `GET` | `/api/media/list` | Liste tous les fichiers |
| `DELETE` | `/api/media/:fileId` | Supprime un fichier |

### Conversion

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/conversion/convert` | Convertit un fichier |
| `POST` | `/api/conversion/extract-audio` | Extrait l'audio |
| `POST` | `/api/conversion/resize` | Redimensionne une vidéo |
| `POST` | `/api/conversion/trim` | Découpe un média |
| `POST` | `/api/conversion/rotate` | Pivote une vidéo |

**Exemple de conversion:**
```json
POST /api/conversion/convert
{
  "fileId": "uuid-du-fichier",
  "outputFormat": "mp4",
  "codec": "avc",
  "bitrate": 5000000
}
```

## 🔧 Configuration

### Variables d'environnement serveur

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Port du serveur |
| `NODE_ENV` | development | Environnement (development/production) |
| `MAX_FILE_SIZE` | 500000000 | Taille max des fichiers en octets (500MB) |
| `UPLOAD_DIR` | ./uploads | Dossier des uploads |
| `OUTPUT_DIR` | ./output | Dossier des fichiers convertis |
| `CORS_ORIGIN` | http://localhost:5173 | Origin CORS autorisée |
| `HTTP_ALLOWED` | false | Autoriser HTTP (uniquement en local) |

### Variables d'environnement client

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL de l'API backend |

## 🐳 Déploiement Docker

```bash
# Build et démarrage
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Rebuild complet
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Images Docker

| Image | Description |
|-------|-------------|
| `ghcr.io/frankkubler/mediabunny-app:latest` | Dernière version stable |
| `ghcr.io/frankkubler/mediabunny-app:main` | Derniers commits (dev) |

## 📝 Développement

```bash
# Installer les dépendances
npm run install:all

# Mode développement (serveur + client)
npm run dev

# Serveur uniquement
npm run dev:server

# Client uniquement
npm run dev:client

# Build production
npm run build

# Lancer en production
npm start
```

## 🔒 Sécurité

- ✅ Validation des types de fichiers
- ✅ Limite de taille configurable
- ✅ Helmet.js pour sécurité HTTP
- ✅ CORS configuré
- ✅ Gestion des erreurs
- ✅ Nettoyage automatique des fichiers
- ✅ Protection contre path traversal

## 🐛 Dépannage

### Erreur "undecodable_source_codec"

Cette erreur indique que le codec n'est pas supporté par WebCodecs.

**Solutions:**

1. **Utiliser un fichier avec codec supporté** (H.264, VP8, VP9)
2. **Pré-convertir avec FFmpeg:**
   ```bash
   ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4
   ```
3. **Migrer vers FFmpeg** pour support universel (voir [FFMPEG_GUIDE.md](FFMPEG_GUIDE.md))

### Problème de dépendances

```bash
rm -rf node_modules server/node_modules client/node_modules
rm package-lock.json server/package-lock.json client/package-lock.json
npm run install:all
```

### Erreurs Docker

```bash
# Vérifier les logs
docker logs mediabunny-app -f

# Rebuild complet
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 🚀 Roadmap

### Version 2.0
- [ ] Migration vers FFmpeg pour support universel des codecs
- [ ] Queue de jobs (Bull/BullMQ) pour traitement asynchrone
- [ ] Stockage S3 pour scalabilité
- [ ] Authentification JWT + OAuth2
- [ ] Rate limiting et quotas utilisateur
- [ ] Historique des conversions
- [ ] Prévisualisation vidéo avant conversion
- [ ] Batch processing
- [ ] API webhooks

## 📚 Documentation

- [INSTALL.md](INSTALL.md) - Guide d'installation détaillé
- [QUICKSTART.md](QUICKSTART.md) - Démarrage rapide
- [USAGE.md](USAGE.md) - Guide d'utilisation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture technique
- [FFMPEG_GUIDE.md](FFMPEG_GUIDE.md) - Migration vers FFmpeg
- [CLIENT_CONVERSION.md](CLIENT_CONVERSION.md) - Conversion côté client

## 📚 Ressources

- [MediaBunny Documentation](https://mediabunny.dev)
- [MediaBunny GitHub](https://github.com/Vanilagy/mediabunny)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [DaisyUI 5](https://daisyui.com)
- [Vue.js 3](https://vuejs.org)
- [Vite](https://vitejs.dev)
- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)

## 🙏 Contributeurs

Les contributions sont les bienvenues ! Consultez les [issues ouvertes](https://github.com/frankkubler/mediabunny-app/issues) pour la liste des tâches.

Utilisez les [conventional commits](https://www.conventionalcommits.org/) pour vos messages de commit.

## 📝 Licence

Ce projet utilise MediaBunny sous licence MPL-2.0.

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=frankkubler/mediabunny-app&type=Date)](https://star-history.com/#frankkubler/mediabunny-app&Date)

---

<div align="center">

**Auteur**: Frank KUBLER  
**Repository**: [github.com/frankkubler/mediabunny-app](https://github.com/frankkubler/mediabunny-app)

Si ce projet vous aide, n'hésitez pas à lui donner une ⭐ !

</div>

## About

💾 Application web auto-hébergée moderne pour la conversion de fichiers média avec MediaBunny - Vue.js 3 + Node.js + TypeScript ⚙️

### Topics

`converter` `typescript` `media-conversion` `convert` `conversion` `video-converter` `audio-converter` `self-hosted` `file-converter` `file-conversion` `vuejs` `nodejs` `docker` `mediabunny` `tailwindcss` `daisyui` `vite` `webcodecs`