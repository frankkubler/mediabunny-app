import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mediaRoutes from './routes/media.routes.js';
import conversionRoutes from './routes/conversion.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createDirectories } from './utils/filesystem.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Créer les dossiers nécessaires
await createDirectories();

// Routes
app.use('/api/media', mediaRoutes);
app.use('/api/conversion', conversionRoutes);

// Servir les fichiers statiques (client build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Servir les fichiers uploadés et de sortie
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));
app.use('/output', express.static(process.env.OUTPUT_DIR || './output'));

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR}`);
  console.log(`📂 Output directory: ${process.env.OUTPUT_DIR}`);
});
