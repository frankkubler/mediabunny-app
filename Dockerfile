FROM node:20-alpine AS base

# Installer FFmpeg
RUN apk add --no-cache ffmpeg

# Vérifier installation FFmpeg
RUN ffmpeg -version

WORKDIR /app

# Copier package.json
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Installer les dépendances
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copier le code source
COPY . .

# Build du client
RUN cd client && npm run build

# Build du serveur
RUN cd server && npm run build

# Créer les dossiers nécessaires
RUN mkdir -p /app/server/uploads /app/server/output

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
