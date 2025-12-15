import express from 'express';

const router = express.Router();

// TOUTES les routes de conversion sont désactivées
// Utilisez le service client (client/src/services/mediabunny.service.ts)

// Message d'information pour les anciennes routes
const notSupportedMessage = {
  success: false,
  message: 'La conversion côté serveur n\'est pas supportée. ' +
           'MediaBunny utilise WebCodecs qui fonctionne uniquement dans le navigateur. ' +
           'Utilisez le service client: import { convertFile } from "@/services/mediabunny.service"',
  documentation: 'Consultez ARCHITECTURE.md pour plus d\'informations'
};

router.post('/convert', (req, res) => {
  res.status(501).json(notSupportedMessage);
});

router.post('/extract-audio', (req, res) => {
  res.status(501).json(notSupportedMessage);
});

router.post('/resize', (req, res) => {
  res.status(501).json(notSupportedMessage);
});

router.post('/trim', (req, res) => {
  res.status(501).json(notSupportedMessage);
});

router.post('/crop', (req, res) => {
  res.status(501).json(notSupportedMessage);
});

router.post('/rotate', (req, res) => {
  res.status(501).json(notSupportedMessage);
});

router.post('/advanced', (req, res) => {
  res.status(501).json(notSupportedMessage);
});

export default router;
