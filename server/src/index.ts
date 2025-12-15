import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Routes
import mediaRoutes from './routes/media.routes.js';
import ffmpegRoutes from './routes/ffmpeg.routes.js';

// Configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Créer les répertoires nécessaires
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
const outputDir = process.env.OUTPUT_DIR || path.join(__dirname, '../output');

await fs.mkdir(uploadDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

console.log('✓ Directories created');

// Routes API
app.use('/api/media', mediaRoutes);
app.use('/api/ffmpeg', ffmpegRoutes);

// Servir les fichiers de sortie
app.use('/output', express.static(outputDir));

// Servir le client (production)
const clientPath = path.join(__dirname, '../../client/dist');
try {
  await fs.access(clientPath);
  app.use(express.static(clientPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
  console.log('✓ Client app served from:', clientPath);
} catch {
  console.log('⚠️  Client dist not found. Run: cd client && npm run build');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    ffmpeg: 'enabled',
    redis: process.env.REDIS_URL || 'localhost:6379'
  });
});

// Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`📂 Output directory: ${outputDir}`);
  console.log(`🔴 Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
  console.log(`🎥 FFmpeg: Enabled`);
});
