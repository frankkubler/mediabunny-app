import {
  Input,
  Output,
  Conversion,
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Mp4OutputFormat,
  WebMOutputFormat,
  Mp3OutputFormat,
  WavOutputFormat,
} from 'mediabunny';

export type OutputFormat = 'mp4' | 'webm' | 'mp3' | 'wav';

export interface ConversionOptions {
  format: OutputFormat;
  // Trimming
  trim?: { start: number; end: number };
  // Resizing
  width?: number;
  height?: number;
  fit?: 'contain' | 'cover' | 'fill' | 'passThrough';
  // Transformation
  rotation?: number;
  crop?: { left: number; top: number; width: number; height: number };
  // Qualité
  videoBitrate?: number;
  audioBitrate?: number;
}

export interface MediaMetadata {
  duration: number;
  video: {
    codec: string | null;
    width: number;
    height: number;
    rotation: number;
  } | null;
  audio: {
    codec: string | null;
    sampleRate: number;
    channels: number;
  } | null;
  tags: any;
}

function getOutputFormat(format: OutputFormat) {
  switch (format) {
    case 'mp4': return new Mp4OutputFormat();
    case 'webm': return new WebMOutputFormat();
    case 'mp3': return new Mp3OutputFormat();
    case 'wav': return new WavOutputFormat();
    default: throw new Error(`Format non supporté: ${format}`);
  }
}

/**
 * Lit les métadonnées d'un fichier média
 * Fonctionne dans le navigateur avec WebCodecs
 */
export async function readMetadata(file: File): Promise<MediaMetadata> {
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });

  try {
    const duration = await input.computeDuration();
    const videoTrack = await input.getPrimaryVideoTrack();
    const audioTrack = await input.getPrimaryAudioTrack();
    const tags = await input.getMetadataTags();

    return {
      duration,
      video: videoTrack ? {
        codec: videoTrack.codec,
        width: videoTrack.displayWidth,
        height: videoTrack.displayHeight,
        rotation: videoTrack.rotation as number,
      } : null,
      audio: audioTrack ? {
        codec: audioTrack.codec,
        sampleRate: audioTrack.sampleRate,
        channels: audioTrack.numberOfChannels,
      } : null,
      tags,
    };
  } catch (error: any) {
    throw new Error(`Erreur lecture métadonnées: ${error.message}`);
  }
}

/**
 * Convertit un fichier média dans le navigateur
 * Utilise WebCodecs (disponible uniquement côté client)
 */
export async function convertFile(
  file: File,
  options: ConversionOptions,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });

  const output = new Output({
    format: getOutputFormat(options.format),
    target: new BufferTarget(),
  });

  try {
    // Initialiser la conversion avec les options
    const conversion = await Conversion.init({
      input,
      output,
      // Options de conversion
      ...(options.trim && { trim: options.trim }),
      ...(options.width && { width: options.width }),
      ...(options.height && { height: options.height }),
      ...(options.fit && { fit: options.fit }),
      ...(options.rotation !== undefined && { rotation: options.rotation }),
      ...(options.crop && { crop: options.crop }),
      ...(options.videoBitrate && { videoBitrate: options.videoBitrate }),
      ...(options.audioBitrate && { audioBitrate: options.audioBitrate }),
    });

    // Vérifier les pistes abandonnées
    if (conversion.discardedTracks && conversion.discardedTracks.length > 0) {
      const reasons = conversion.discardedTracks
        .map(dt => `${dt.track.constructor.name}: ${dt.reason}`)
        .join(', ');
      
      throw new Error(
        `Impossible de convertir ce fichier. Pistes non supportées: ${reasons}. ` +
        `Cela peut arriver si votre navigateur ne supporte pas certains codecs.`
      );
    }

    // Suivre la progression si callback fourni
    if (onProgress) {
      onProgress(0);
    }

    // Exécuter la conversion
    await conversion.execute();

    if (onProgress) {
      onProgress(100);
    }

    // Récupérer le buffer de sortie
    const buffer = (output.target as BufferTarget).buffer;
    
    if (!buffer) {
      throw new Error('La conversion n\'a produit aucun résultat');
    }

    return buffer;
  } catch (error: any) {
    throw new Error(`Erreur de conversion: ${error.message}`);
  }
}

/**
 * Télécharge un ArrayBuffer comme fichier
 */
export function downloadBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

/**
 * Vérifie si WebCodecs est disponible dans le navigateur
 */
export function isWebCodecsSupported(): boolean {
  return 'VideoDecoder' in window && 'VideoEncoder' in window;
}
