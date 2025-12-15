# Conversion côté Client - Guide Complet

## 🔴 Pourquoi les conversions ne fonctionnent plus côté serveur ?

Si vous voyez cette erreur dans les logs :

```
Some tracks had to be discarded from the conversion:
- InputVideoTrack: undecodable_source_codec
- InputAudioTrack: undecodable_source_codec
```

C'est **NORMAL**. Les routes de conversion serveur ont été **désactivées** car **Node.js ne peut pas faire de conversion MediaBunny**.

### Explication

MediaBunny utilise **WebCodecs** qui n'existe que dans les navigateurs, pas dans Node.js.

**Solution** : Faire la conversion **dans le navigateur** avec le service client.

---

## ✅ Solution : Service Client MediaBunny

### Architecture correcte

```
Navigateur (WebCodecs) → MediaBunny → Conversion → ✅ Fonctionne !
```

### Fichier de service

✅ **`client/src/services/mediabunny.service.ts`**

Ce service permet de :
- Lire les métadonnées
- Convertir les formats
- Trim, crop, resize, rotate
- Télécharger le résultat

---

## 🚀 Utilisation dans vos composants

### 1. Lire les métadonnées

```vue
<script setup lang="ts">
import { readMetadata } from '@/services/mediabunny.service';
import { ref } from 'vue';

const metadata = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function handleFile(file: File) {
  loading.value = true;
  error.value = null;
  
  try {
    metadata.value = await readMetadata(file);
    console.log('Métadonnées:', metadata.value);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <input type="file" @change="e => handleFile(e.target.files[0])" />
    
    <div v-if="metadata">
      <h3>Informations du fichier</h3>
      <p>Durée: {{ Math.floor(metadata.duration / 60) }}:{{ Math.floor(metadata.duration % 60) }}</p>
      
      <div v-if="metadata.video">
        <h4>Vidéo</h4>
        <p>Codec: {{ metadata.video.codec }}</p>
        <p>Résolution: {{ metadata.video.width }}x{{ metadata.video.height }}</p>
      </div>
      
      <div v-if="metadata.audio">
        <h4>Audio</h4>
        <p>Codec: {{ metadata.audio.codec }}</p>
        <p>Sample Rate: {{ metadata.audio.sampleRate }} Hz</p>
      </div>
    </div>
  </div>
</template>
```

### 2. Conversion simple

```vue
<script setup lang="ts">
import { convertFile, downloadBuffer } from '@/services/mediabunny.service';
import { ref } from 'vue';

const selectedFile = ref<File | null>(null);
const converting = ref(false);
const progress = ref(0);

async function convertToMP4() {
  if (!selectedFile.value) return;
  
  converting.value = true;
  
  try {
    // Conversion dans le navigateur
    const buffer = await convertFile(
      selectedFile.value,
      { format: 'mp4' },
      (p) => { progress.value = p; }
    );
    
    // Téléchargement automatique
    downloadBuffer(buffer, 'converted.mp4');
    
    alert('Conversion réussie !');
  } catch (error: any) {
    alert(`Erreur: ${error.message}`);
  } finally {
    converting.value = false;
  }
}
</script>

<template>
  <div>
    <input type="file" @change="e => selectedFile = e.target.files[0]" />
    <button @click="convertToMP4" :disabled="!selectedFile || converting">
      {{ converting ? 'Conversion...' : 'Convertir en MP4' }}
    </button>
    <progress v-if="converting" :value="progress" max="100"></progress>
  </div>
</template>
```

### 3. Conversion avancée (trim + resize)

```vue
<script setup lang="ts">
import { convertFile, downloadBuffer } from '@/services/mediabunny.service';
import { ref } from 'vue';

const file = ref<File | null>(null);
const startTime = ref(0);
const endTime = ref(60);
const width = ref(1280);
const height = ref(720);

async function advancedConversion() {
  if (!file.value) return;
  
  try {
    const buffer = await convertFile(file.value, {
      format: 'mp4',
      trim: {
        start: startTime.value,
        end: endTime.value
      },
      width: width.value,
      height: height.value,
      fit: 'contain'
    });
    
    downloadBuffer(buffer, 'trimmed-resized.mp4');
  } catch (error: any) {
    console.error(error);
  }
}
</script>

<template>
  <div>
    <input type="file" @change="e => file = e.target.files[0]" />
    
    <div>
      <label>Début (s): <input type="number" v-model="startTime" /></label>
      <label>Fin (s): <input type="number" v-model="endTime" /></label>
    </div>
    
    <div>
      <label>Largeur: <input type="number" v-model="width" /></label>
      <label>Hauteur: <input type="number" v-model="height" /></label>
    </div>
    
    <button @click="advancedConversion">Convertir</button>
  </div>
</template>
```

### 4. Extraction audio

```vue
<script setup lang="ts">
import { convertFile, downloadBuffer } from '@/services/mediabunny.service';

async function extractAudio(file: File) {
  const buffer = await convertFile(file, {
    format: 'mp3',
    audioBitrate: 320000 // 320 kbps
  });
  
  downloadBuffer(buffer, 'audio.mp3');
}
</script>
```

### 5. Rotation vidéo

```vue
<script setup lang="ts">
import { convertFile, downloadBuffer } from '@/services/mediabunny.service';

async function rotateVideo(file: File, degrees: number) {
  const buffer = await convertFile(file, {
    format: 'mp4',
    rotation: degrees // 0, 90, 180, 270
  });
  
  downloadBuffer(buffer, 'rotated.mp4');
}
</script>
```

---

## 📋 Options de conversion disponibles

```typescript
interface ConversionOptions {
  format: 'mp4' | 'webm' | 'mp3' | 'wav';
  
  // Découpage temporel
  trim?: {
    start: number; // secondes
    end: number;   // secondes
  };
  
  // Redimensionnement
  width?: number;
  height?: number;
  fit?: 'contain' | 'cover' | 'fill' | 'passThrough';
  
  // Transformation
  rotation?: number; // 0, 90, 180, 270
  
  // Recadrage
  crop?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  
  // Qualité
  videoBitrate?: number; // bits par seconde
  audioBitrate?: number; // bits par seconde
}
```

---

## ⚠️ Compatibilité navigateur

WebCodecs est supporté par :
- ✅ Chrome 94+
- ✅ Edge 94+
- ✅ Firefox 130+
- ✅ Safari 17.4+

### Vérifier le support

```typescript
import { isWebCodecsSupported } from '@/services/mediabunny.service';

if (!isWebCodecsSupported()) {
  alert('Votre navigateur ne supporte pas WebCodecs. Veuillez utiliser Chrome, Firefox ou Safari récent.');
}
```

---

## 🐛 Dépannage

### Erreur "Impossible de convertir ce fichier"

**Cause** : Le codec de votre fichier n'est pas supporté par WebCodecs.

**Solution** : Convertir d'abord avec FFmpeg :

```bash
ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4
```

### Erreur de mémoire (gros fichiers)

**Cause** : Le buffer est trop gros pour la mémoire du navigateur.

**Solution** : MediaBunny supporte le streaming (implémentation avancée nécessaire).

---

## 📚 Ressources

- **Service client** : `client/src/services/mediabunny.service.ts`
- **Architecture** : `ARCHITECTURE.md`
- **Documentation MediaBunny** : https://mediabunny.dev
- **WebCodecs API** : https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API

---

## ✅ Récapitulatif

1. ❌ **NE PAS** utiliser les routes `/api/conversion/*` (désactivées)
2. ✅ **UTILISER** le service client `mediabunny.service.ts`
3. ✅ Conversion 100% dans le navigateur
4. ✅ Fonctionne avec H.264+AAC
5. ✅ Trim, resize, crop, rotate disponibles

**Votre fichier H.264+AAC fonctionnera PARFAITEMENT** avec cette approche ! 🎉
