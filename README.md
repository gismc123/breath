# BREATHE

A minimal, mobile-first Progressive Web App for box breathing. No account. No login. No app store. Open the link and breathe.

---

## What It Does

BREATHE guides you through a three-step flow whenever you need to reset:

**1. Feeling Check-In**
Select how you're feeling right now — Stressed, Anxious, Sad, Overwhelmed, Tired, or Angry. Nothing is stored or transmitted.

**2. Affirmation**
A short, feeling-specific message meets you where you are and transitions you into the breathing exercise.

**3. Box Breathing**
An animated breathing circle walks you through 4 rounds of 4-count box breathing:

```
Breathe In (4s) → Hold (4s) → Breathe Out (4s) → Hold (4s)
```

- **Extended Exhale Mode** — switch to a 6-count exhale mid-session for a deeper calm effect
- **Keep Going** — add 4 more rounds at any time
- Coaching tip to breathe with your full trunk (chest and belly)

When you finish, a completion overlay lets you breathe again or end the session.

---

## Features

- **English / Spanish** — full UI translation, toggle in the header, saved to `localStorage`
- **Three color themes** — Midnight (deep navy, default), Forest (deep green), Ember (warm amber), saved to `localStorage`
- **Persistent global header** — language toggle, + Home Screen button, and theme swatches stay visible across all screens
- **Installable PWA** — works like a native app on iOS and Android, no app store needed
- **Fully offline** — Service Worker caches all assets after the first load
- **Zero data collection** — nothing leaves your device; no analytics, no trackers, no third-party scripts

---

## Privacy

- No data collection of any kind — feelings, session activity, and responses never leave your device
- No analytics, ad trackers, or third-party services
- Session state lives only in memory; close the tab and it's gone
- Theme and language preferences are the only things written to `localStorage`

---

## Tech Stack

Pure HTML, CSS, and vanilla JavaScript. No frameworks, no build tools, no npm dependencies. Static files served by nginx inside a Docker container.

---

## Running with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Quick start

```bash
git clone <your-repo-url>
cd breath
docker compose up -d
```

The app will be available at `http://localhost:907`.

### What the container does

The `Dockerfile` copies all static files into an `nginx:alpine` image and serves them on port 80. Docker Compose maps that to port `907` on the host.

```
Host port 907  →  Container port 80  →  nginx serves static files
```

To change the host port, edit `docker-compose.yml`:

```yaml
ports:
  - "907:80"   # change 907 to whatever port you want
```

---

## Serving behind a reverse proxy

The container exposes port `907` on the host. Point your reverse proxy at that port.

### Nginx Proxy Manager (GUI)

1. **Proxy Hosts → Add Proxy Host**
2. **Domain:** `breathe.yourdomain.com`
3. **Scheme:** `http` · **Forward Hostname:** `localhost` · **Forward Port:** `907`
4. Enable **Block Common Exploits** and request an SSL certificate under the **SSL** tab

### Caddy

```
breathe.yourdomain.com {
    reverse_proxy localhost:907
}
```

### Traefik

```yaml
services:
  breathe-app:
    build: .
    container_name: breathe-app
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.breathe.rule=Host(`breathe.yourdomain.com`)"
      - "traefik.http.routers.breathe.entrypoints=websecure"
      - "traefik.http.routers.breathe.tls.certresolver=letsencrypt"
      - "traefik.http.services.breathe.loadbalancer.server.port=80"
```

Remove the `ports` block — Traefik handles routing through the Docker network.

---

## Deploying updates

```bash
git pull
docker compose up -d --build
```

Or use the included `deploy.sh`, which pulls, rebuilds with a timestamped build version, and optionally purges a Cloudflare cache:

```bash
./deploy.sh
```

Create a `.env` from `.env.example` and fill in your Cloudflare credentials if you use that CDN. The `.env` file is gitignored.

---

## PWA / Install to Home Screen

- **Android (Chrome):** A banner appears on first visit. Tap **Install**.
- **iOS (Safari):** Tap the Share icon → **Add to Home Screen**.
- Tap **+ Home Screen** in the app header for step-by-step instructions.

Once installed, BREATHE launches in standalone mode (no browser chrome) and works fully offline.

---

## File Structure

```
breath/
├── index.html          # App shell — 3 screens, modals, global header
├── style.css           # All styles, CSS custom properties, three color themes
├── app.js              # Screen logic, breathing timer, session state
├── i18n.js             # Internationalization — loads locale JSON, exposes t()
├── manifest.json       # PWA manifest (icons, display mode, theme color)
├── sw.js               # Service worker — caches assets for offline use
├── robots.txt          # Search engine crawl rules + sitemap pointer
├── sitemap.xml         # XML sitemap (APP_URL substituted at build time)
├── Dockerfile          # nginx:alpine image, stamps BUILD_DATE and APP_URL
├── docker-compose.yml  # Maps container port 80 to host port 907
├── nginx.conf          # Cache-control headers
├── deploy.sh           # git pull → docker build/up → optional Cloudflare purge
├── .env.example        # Template for CF_API_TOKEN, CF_ZONE_ID, and APP_URL
├── locales/
│   ├── en.json         # English strings
│   └── es.json         # Spanish strings
└── assets/
    ├── icon-192.png    # PWA icon (192×192)
    ├── icon-512.png    # PWA icon (512×512)
    └── icon-apple.png  # iOS touch icon (180×180)
```

---

## Legal

BREATHE is a personal wellness tool. It is not a medical service, mental health treatment, or clinical intervention. Nothing in this app constitutes medical advice, diagnosis, or treatment. If you are in crisis, call or text **988** (Suicide & Crisis Lifeline).
