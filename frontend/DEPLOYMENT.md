# Deploying IGIT Memories

## Architecture

- **Frontend (Vercel):** React + Vite static build in `dist/`.
- **Backend (Render):** Node + Express + Socket.io in `server/`.
- **Data:** MongoDB Atlas + Cloudinary.

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. Network Access: allow `0.0.0.0/0` (or Render outbound IPs) for development.
3. Copy the connection string as `MONGODB_URI`.

## 2. Cloudinary

1. Create a Cloudinary account.
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret** into server env vars.

## 3. Render (API)

1. New **Web Service** → connect your repo.
2. **Root directory:** `server`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. **Environment variables** (from `server/.env.example`):

   - `MONGODB_URI`
   - `JWT_SECRET` (long random string)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_URL` — your Vercel URL(s), comma-separated, e.g. `https://igit-memories.vercel.app`
   - Optional: `STUDENT_EMAIL_DOMAIN` — restrict registration to `@yourcollege.edu`
   - Optional: `OPENAI_API_KEY` — AI nostalgic quotes (otherwise curated lines are used)

6. After deploy, note the public URL, e.g. `https://igit-memories-api.onrender.com`.

## 4. Vercel (Frontend)

1. Import the same repo; **Framework preset:** Vite.
2. **Root directory:** repository root (where `vite.config.js` lives).
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Environment variables:**

   - `VITE_API_URL` — your Render API URL, e.g. `https://igit-memories-api.onrender.com`  
     (The app calls `/api/...` on this host; in local dev, leave unset to use the Vite proxy.)

6. Redeploy after API URL is final.

## 5. CORS + WebSockets

- `CLIENT_URL` on the server must include every Vercel hostname you use (production + preview).
- Socket.io uses the same origin as `VITE_API_URL` in production. Ensure Render supports WebSockets (default for Node services).

## 6. Local development

Terminal 1 — API:

```bash
cd server
cp .env.example .env
# fill MONGODB_URI, JWT_SECRET, Cloudinary keys
npm run dev
```

Terminal 2 — Vite (proxies `/api` and `/socket.io` to port 5000):

```bash
npm install
npm run dev
```

## 7. PWA

The Vite PWA plugin generates `sw.js` in `dist/`. After deploy, open the site once; the service worker registers for offline shell caching.

## 8. Optional ambient music

Set `VITE_AMBIENT_MUSIC_URL` to a **self-hosted** royalty-free loop if you want the dashboard “ambient” toggle to play audio.
