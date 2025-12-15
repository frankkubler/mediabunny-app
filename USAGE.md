# Guide d'Utilisation - MediaBunny App

## 🚀 Démarrage rapide

### Lancer l'application

```bash
# Avec Docker (recommandé)
docker-compose up -d

# Sans Docker
npm run install:all
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## ✅ Formats de fichiers supportés

### ✅ Fichiers COMPATIBLES (fonctionnent directement)

**Vidéo :**
- MP4 avec codec H.264/AVC + audio AAC
- WebM avec VP8/VP9 + Opus/Vorbis
- MOV avec H.264 + AAC

**Audio :**
- MP3
- AAC (.m4a)
- Opus
- WAV

### ❌ Fichiers NON COMPATIBLES (erreur "undecodable_source_codec")

**Vidéo :**
- H.265/HEVC (iPhone/caméras récentes)
- ProRes (vidéos professionnelles)
- AV1 (sur certains systèmes)
- Codecs propriétaires

**Audio :**
- FLAC (sur certains systèmes)
- Codecs propriétaires

## 🛠️ Solutions aux problèmes courants

### Problème 1: Erreur "undecodable_source_codec"

**Cause :** Votre fichier utilise un codec non supporté par WebCodecs.

**Solution :** Convertir le fichier avec FFmpeg avant upload :

```bash
# Vidéo : Convertir en H.264 + AAC
ffmpeg -i input.mov -c:v libx264 -crf 23 -c:a aac -b:a 192k output.mp4

# Audio : Extraire en MP3
ffmpeg -i input.flac -c:a libmp3lame -b:a 320k output.mp3

# Vidéo : Réduire la taille (qualité moyenne)
ffmpeg -i input.mov -c:v libx264 -crf 28 -preset fast -c:a aac output.mp4

# Vidéo : Haute qualité
ffmpeg -i input.mov -c:v libx264 -crf 18 -preset slow -c:a aac -b:a 256k output.mp4
```

**Explication des paramètres :**
- `-crf 23` : Qualité (17-28, plus bas = meilleure qualité)
- `-preset slow` : Vitesse d'encodage (ultrafast, fast, medium, slow)
- `-b:a 192k` : Bitrate audio (128k, 192k, 256k, 320k)

### Problème 2: Fichier trop volumineux

**Limite :** 500 MB par défaut

**Solution 1 - Augmenter la limite :**

Dans `server/.env` :
```env
MAX_FILE_SIZE=1000000000  # 1 GB
```

**Solution 2 - Compresser le fichier :**

```bash
# Compression moyenne
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k output.mp4

# Compression forte (perte de qualité)
ffmpeg -i input.mp4 -c:v libx264 -crf 32 -preset faster -c:a aac -b:a 96k output.mp4
```

### Problème 3: Warnings "Closing file descriptor"

**Cause :** Limitation de MediaBunny avec Node.js

**Impact :** Aucun - warnings seulement, l'application fonctionne

**Note :** Ces warnings seront corrigés dans les futures versions de MediaBunny

## 🎯 Exemples d'utilisation

### 1. Upload et analyse d'un fichier

1. Allez sur http://localhost:3000
2. Cliquez sur **"Convertir"**
3. Glissez-déposez un fichier MP4 (H.264+AAC)
4. Les métadonnées s'affichent automatiquement

### 2. Conversion de format

**Exemple : MP4 vers WebM**

1. Uploadez votre fichier MP4
2. Sélectionnez "WebM" dans "Format de sortie"
3. Choisissez "Conversion simple"
4. Cliquez sur "Convertir"
5. Téléchargez le résultat

### 3. Extraction audio

**Exemple : Extraire l'audio d'une vidéo en MP3**

1. Uploadez votre fichier vidéo
2. Sélectionnez "MP3" dans "Format de sortie"
3. Choisissez "Extraire l'audio"
4. Cliquez sur "Convertir"
5. Téléchargez le fichier MP3

### 4. Utilisation de l'API

**Upload d'un fichier :**

```bash
curl -X POST http://localhost:3000/api/media/upload \
  -F "file=@video.mp4"
```

**Réponse :**
```json
{
  "success": true,
  "file": {
    "id": "uuid-123",
    "originalName": "video.mp4",
    "metadata": {
      "duration": 120.5,
      "video": {
        "codec": "avc",
        "width": 1920,
        "height": 1080
      }
    }
  }
}
```

**Conversion :**

```bash
curl -X POST http://localhost:3000/api/conversion/convert \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "uuid-123",
    "outputFormat": "webm"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "outputId": "uuid-456",
  "outputPath": "/output/uuid-456.webm",
  "filename": "uuid-456.webm"
}
```

**Télécharger le résultat :**

```bash
curl http://localhost:3000/output/uuid-456.webm -o result.webm
```

## 📊 Comparaison des formats

| Format | Usage | Qualité | Compatibilité | Taille |
|--------|-------|---------|----------------|--------|
| MP4 (H.264+AAC) | Général | Excellente | Universelle | Moyenne |
| WebM (VP9+Opus) | Web | Très bonne | Navigateurs modernes | Petite |
| MP3 | Audio | Bonne | Universelle | Petite |
| WAV | Audio pro | Parfaite | Universelle | Très grande |

## 🔧 Créer des fichiers de test compatibles

### Vidéo de test simple (10 secondes)

```bash
# Créer une vidéo de test avec couleur unie
ffmpeg -f lavfi -i color=c=blue:s=1280x720:d=10 \
  -c:v libx264 -pix_fmt yuv420p \
  test-video.mp4
```

### Vidéo avec audio de test

```bash
# Créer une vidéo avec son
ffmpeg -f lavfi -i color=c=green:s=1920x1080:d=5 \
  -f lavfi -i sine=frequency=1000:duration=5 \
  -c:v libx264 -c:a aac \
  test-av.mp4
```

### Audio de test

```bash
# Créer un fichier audio MP3
ffmpeg -f lavfi -i sine=frequency=440:duration=5 \
  -c:a libmp3lame -b:a 192k \
  test-audio.mp3
```

## ⚠️ Limitations connues

### 1. Support codec limité

**Cause :** MediaBunny utilise WebCodecs qui a un support limité en Node.js

**Impact :** 
- H.265/HEVC ne fonctionne pas
- Certains fichiers iPhone ne fonctionnent pas
- Codecs professionnels non supportés

**Solution :** Pré-convertir avec FFmpeg (voir ci-dessus)

### 2. Pas de traitement vidéo avancé

Les fonctionnalités suivantes sont prévues mais non implémentées :
- Redimensionnement réel
- Rotation effective
- Découpage (trim)
- Filtres vidéo

**Recommandation :** Utiliser FFmpeg pour ces opérations

### 3. Performance en environnement serveur

WebCodecs est conçu pour le navigateur. En Node.js :
- Performances sous-optimales
- Utilisation CPU élevée
- Pas de support GPU

**Recommandation production :** Migrer vers FFmpeg pour le backend

## 🚀 Migration vers FFmpeg (Production)

Pour une application de production, remplacer MediaBunny par FFmpeg :

### Avantages FFmpeg

- ✅ Support universel de tous les codecs
- ✅ Performances excellentes
- ✅ Accélération matérielle (GPU)
- ✅ Fonctionnalités avancées (filtres, effets)
- ✅ Stable et mature

### Exemple d'implémentation

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function convertWithFFmpeg(input: string, output: string) {
  const command = `ffmpeg -i ${input} -c:v libx264 -crf 23 -c:a aac ${output}`;
  await execPromise(command);
}
```

## 📚 Ressources utiles

- [MediaBunny Documentation](https://mediabunny.dev)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [Guide FFmpeg (français)](https://www.libellules.ch/dotclear/index.php?pages/ffmpeg)

## 🐛 Signaler un problème

Si vous rencontrez un problème :

1. Vérifiez que votre fichier est compatible (H.264+AAC)
2. Consultez les logs : `docker logs mediabunny-app -f`
3. Essayez avec un fichier de test FFmpeg
4. Ouvrez une issue sur GitHub avec :
   - Type/taille du fichier
   - Message d'erreur complet
   - Logs du serveur

---

**Bon usage !** 🎉
