import axios from 'axios';

// Utilise une base relative par défaut pour les déploiements derrière nginx/proxy
// VITE_API_URL peut toujours surcharger (ex: http://backend:3000/api)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
