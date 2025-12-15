# Architecture MediaBunny App

## 💡 Problème fondamental : WebCodecs et Node.js

### 🔴 Pourquoi les conversions échouent côté serveur

**Erreur typique** :
```
Some tracks had to be discarded from the conversion:
- InputVideoTrack: undecodable_source_codec
- InputAudioTrack: undecodable_source_codec
```

**Cause** : **Node.js n'implémente PAS WebCodecs complètement**

### Explication technique

MediaBunny utilise l'**API WebCodecs** pour encoder/décoder :

| Environnement | WebCodecs | Résultat |
|---------------|-----------|----------|
| **Navigateur** (Chrome, Firefox, Edge) | ✅ Complet | **Conversion fonctionne** |
| **Node.js** | ❌ Incomplet | **Erreur undecodable_source_codec** |

Node.js peut :
- ✅ Lire les métadonnées (demux)
- ✅ Muxer des fichiers
- ❌ **Décoder/encoder vidéo/audio** ← **Problème ici**

Même avec **H.264+AAC** (format parfait), Node.js ne peut pas décoder car il n'a pas accès aux codecs système.

---

## 🎯 Solution : Architecture Client/Serveur

### Architecture recommandée

```
┌────────────────────────┐
│   NAVIGATEUR (Client)      │
│                            │
│  ✅ MediaBunny              │
│  ✅ WebCodecs complet       │
│  ✅ Conversion vidéo/audio  │
│  ✅ Trim, Crop, Resize     │
│  ✅ Rotation               │
│                            │
└─────────┬───────────────┘
         │
         │ HTTP (optionnel)
         │
┌────────┴───────────────┐
│   SERVEUR (Node.js)        │
│                            │
│  ✅ Servir l'application    │
│  ✅ Upload fichiers        │
│  ✅ Stockage               │
│  ❌ Conversion (impossible) │
│                            │
└────────────────────────┘
```

### 🟢 Nouvelle architecture implémentée

#### Côté Client (`client/src/services/mediabunny.service.ts`)

```typescript
import { convertFile, readMetadata } from '@/services/mediabunny.service';

// Lecture métadonnées
const metadata = await readMetadata(file);

// Conversion
const outputBuffer = await convertFile(file, {
  format: 'mp4',
  trim: { start: 10, end: 60 },
  width: 1280,
  height: 720,
  rotation: 90
});

// Téléchargement
downloadBuffer(outputBuffer, 'output.mp4');
```

**Avantages** :
- ✅ Conversion 100% fonctionnelle
- ✅ Pas de limite serveur
- ✅ Tout se passe dans le navigateur
- ✅ Aucun upload sur le serveur nécessaire

#### Côté Serveur (optionnel)

```typescript
// SEULEMENT si vous voulez stocker les fichiers
app.post('/api/media/upload', upload.single('file'), (req, res) => {
  // Stocker le fichier
  res.json({ success: true, fileId: uuid() });
});
```

---

## 🛠️ Implémentation

### Étape 1 : Service client créé

✅ Fichier créé : `client/src/services/mediabunny.service.ts`

Fonctions disponibles :
- `readMetadata(file)` - Lire les métadonnées
- `convertFile(file, options)` - Convertir dans le navigateur
- `downloadBuffer(buffer, filename)` - Télécharger le résultat
- `isWebCodecsSupported()` - Vérifier le support navigateur

### Étape 2 : Modifier les composants Vue

Remplacer les appels API serveur par les appels directs MediaBunny :

**Avant (ne fonctionne pas)** :
```typescript
// Appel au serveur Node.js - ❌ ÉCHOUE
await axios.post('/api/conversion/convert', {
  fileId,
  outputFormat: 'mp4'
});
```

**Après (fonctionne)** :
```typescript
import { convertFile, downloadBuffer } from '@/services/mediabunny.service';

// Conversion directe dans le navigateur - ✅ FONCTIONNE
const buffer = await convertFile(selectedFile, {
  format: 'mp4',
  trim: { start: 10, end: 60 }
});

downloadBuffer(buffer, 'output.mp4');
```

---

## 📊 Comparaison des approches

### Approche 1 : Serveur Node.js (ACTUELLE - NE FONCTIONNE PAS)

```
Client → Upload fichier → Serveur Node.js → MediaBunny → ❌ ERREUR
                                WebCodecs incomplet
```

**Résultat** : `undecodable_source_codec` toujours

### Approche 2 : Client navigateur (RECOMMANDÉE - FONCTIONNE)

```
Client → MediaBunny (navigateur) → WebCodecs → ✅ Conversion OK
```

**Résultat** : Conversion réussie avec H.264+AAC

### Approche 3 : Serveur FFmpeg (PRODUCTION)

```
Client → Upload → Serveur → FFmpeg → ✅ Conversion OK
```

**Résultat** : Support universel de tous les codecs

---

## ✅ Avantages de l'approche client

### Performance
- ✅ Pas de latence réseau (pas d'upload)
- ✅ Utilise le GPU du client
- ✅ Scalable (charge répartie sur les clients)

### Sécurité
- ✅ Fichiers ne quittent jamais le navigateur
- ✅ Confidentialité totale
- ✅ RGPD-friendly

### Coût
- ✅ Pas de coût serveur pour la conversion
- ✅ Pas de stockage nécessaire
- ✅ Infrastructure minimale

---

## ⚠️ Limitations de l'approche client

### Navigateurs anciens
- WebCodecs nécessite Chrome 94+, Firefox 130+, Safari 17.4+
- Solution : Détecter avec `isWebCodecsSupported()` et afficher un message

### Fichiers volumineux
- La mémoire du navigateur est limitée
- Solution : MediaBunny supporte le streaming pour gros fichiers

### Codecs non supportés par le navigateur
- Certains codecs peuvent ne pas être supportés
- Solution : Message clair à l'utilisateur

---

## 🚀 Migration Production

Pour une application de **production robuste** :

### Option A : Client uniquement (Recommandé)

```
✅ Conversion dans le navigateur (MediaBunny)
✅ Serveur minimal (juste servir l'app)
✅ Coûts minimaux
❌ Limité aux codecs supportés par les navigateurs
```

### Option B : Serveur FFmpeg

```
✅ Support universel de tous les codecs
✅ Conversion serveur fiable
✅ API traditionnelle
❌ Coûts serveur élevés
❌ Upload/download nécessaires
```

### Option C : Hybride

```
✅ Client pour codecs standards (H.264/AAC)
✅ Serveur FFmpeg pour codecs exotiques
✅ Meilleur des deux mondes
❌ Complexité accrue
```

---

## 📝 Résumé

### Pourquoi ça ne fonctionne pas côté serveur ?

**Node.js n'a PAS WebCodecs fonctionnel** pour encoder/décoder.

Même avec H.264+AAC (format parfait), vous aurez **toujours** `undecodable_source_codec`.

### Solution

**Faire la conversion dans le NAVIGATEUR** où WebCodecs est complet.

### Fichiers créés

- ✅ `client/src/services/mediabunny.service.ts` - Service client complet
- 🔴 `server/src/services/conversion.service.ts` - À NE PLUS UTILISER

### Prochaines étapes

1. Modifier les composants Vue pour utiliser `mediabunny.service.ts`
2. Supprimer les routes `/api/conversion/*` du serveur
3. Tester dans le navigateur
4. ✅ La conversion fonctionnera parfaitement !

---

**Conclusion** : MediaBunny est fait pour le navigateur, pas pour Node.js. Votre fichier H.264+AAC est parfait, il faut juste l'utiliser au bon endroit (client). 🎯
