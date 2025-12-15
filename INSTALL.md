# Installation MediaBunny App - Version 1.26.0

## 📌 Version de MediaBunny

Cette application utilise **MediaBunny 1.26.0** (dernière version stable).

## 🚀 Installation complète

### Méthode 1 : Docker (Recommandé)

```bash
# 1. Cloner le répertoire
git clone https://github.com/frankkubler/mediabunny-app.git
cd mediabunny-app

# 2. Supprimer les anciens builds/node_modules
docker-compose down
rm -rf node_modules server/node_modules client/node_modules
rm -rf server/dist client/dist

# 3. Build avec la version 1.26.0
docker-compose build --no-cache

# 4. Lancer l'application
docker-compose up -d

# 5. Vérifier les logs
docker logs mediabunny-app -f
```

L'application sera accessible sur **http://localhost:3000**

### Méthode 2 : Installation locale

```bash
# 1. Cloner le répertoire
git clone https://github.com/frankkubler/mediabunny-app.git
cd mediabunny-app

# 2. Nettoyer les anciennes installations
rm -rf node_modules server/node_modules client/node_modules package-lock.json server/package-lock.json client/package-lock.json

# 3. Installer avec la version fixée
npm run install:all

# 4. Vérifier la version installée
cd server && npm list mediabunny
cd ../client && npm list mediabunny

# Vous devriez voir : mediabunny@1.26.0

# 5. Configuration
cp server/.env.example server/.env
cp client/.env.example client/.env

# 6. Démarrer en mode développement
cd ..
npm run dev
```

## ⚙️ Configuration

### Serveur (`server/.env`)

```env
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=500000000
UPLOAD_DIR=/app/server/uploads
OUTPUT_DIR=/app/server/output
CORS_ORIGIN=http://localhost:5173
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

## 🔍 Vérification de l'installation

### Vérifier la version de MediaBunny

```bash
# Dans le serveur
cd server
node -e "import('mediabunny').then(mb => console.log('MediaBunny version:', require('./package.json').dependencies.mediabunny))"

# Dans le client
cd client
npm list mediabunny
```

Vous devez voir : **1.26.0**

### Tester l'API

```bash
# Vérifier que le serveur répond
curl http://localhost:3000/api/health

# Réponse attendue:
# {"status":"ok","mediabunny":"1.26.0"}
```

## 🐛 Résolution des problèmes

### Problème 1 : Mauvaise version de MediaBunny

**Symptôme** : Erreurs TypeScript ou fonctionnalités manquantes

**Solution** :
```bash
# Supprimer complètement node_modules
rm -rf node_modules server/node_modules client/node_modules
rm -rf package-lock.json server/package-lock.json client/package-lock.json

# Réinstaller
npm run install:all

# Vérifier
cd server && npm list mediabunny
cd ../client && npm list mediabunny
```

### Problème 2 : Erreurs de build Docker

**Solution** :
```bash
# Nettoyer complètement Docker
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache --pull
docker-compose up -d
```

### Problème 3 : Conflit de versions

Si vous voyez des warnings sur les versions :

```bash
# Forcer l'installation exacte
cd server
npm install mediabunny@1.26.0 --save-exact

cd ../client
npm install mediabunny@1.26.0 --save-exact
```

## 📦 Versions des dépendances principales

### Serveur
- **Node.js** : 20.x ou supérieur
- **MediaBunny** : 1.26.0 (fixé)
- **Express** : ^4.21.2
- **TypeScript** : ^5.9.3

### Client
- **Vue.js** : ^3.5.13
- **Vite** : ^6.3.5
- **MediaBunny** : 1.26.0 (fixé)
- **Tailwind CSS** : ^4.0.0
- **DaisyUI** : ^5.5.5

## 🔄 Mise à jour vers une version supérieure

Si une version plus récente de MediaBunny sort (1.27.0, etc.) :

```bash
# 1. Modifier package.json
# server/package.json et client/package.json
# "mediabunny": "1.27.0"

# 2. Réinstaller
rm -rf node_modules server/node_modules client/node_modules
npm run install:all

# 3. Vérifier les breaking changes
# Consultez : https://github.com/Vanilagy/mediabunny/releases

# 4. Adapter le code si nécessaire

# 5. Rebuild
npm run build
```

## 📚 Documentation MediaBunny 1.26.0

- [Documentation officielle](https://mediabunny.dev)
- [GitHub](https://github.com/Vanilagy/mediabunny)
- [Guide de conversion](https://mediabunny.dev/guide/converting-media-files)
- [API Reference](https://mediabunny.dev/api/)
- [Release 1.26.0](https://github.com/Vanilagy/mediabunny/releases/tag/v1.26.0)

## ✅ Checklist post-installation

- [ ] MediaBunny version 1.26.0 installée (serveur + client)
- [ ] Build Docker réussi sans erreurs TypeScript
- [ ] Serveur démarre sur le port 3000
- [ ] Interface accessible sur http://localhost:3000
- [ ] Upload de fichier fonctionne
- [ ] Métadonnées affichées correctement
- [ ] Conversion simple fonctionne (avec fichiers H.264+AAC)

## 🚀 Prochaines étapes

1. Lire [USAGE.md](./USAGE.md) pour les exemples d'utilisation
2. Consulter [README.md](./README.md) pour la documentation complète
3. Tester avec des fichiers compatibles (voir USAGE.md)

---

**Version de ce guide** : 1.0.0  
**Date** : 15 décembre 2024  
**MediaBunny** : 1.26.0
