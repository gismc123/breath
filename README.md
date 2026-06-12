# Calm Down — A Stress Management PWA

A mobile-first, Progressive Web App that walks you through a personalized calm-down plan during moments of stress or emotional overwhelm. No account. No login. No app store. Just open the link and use it.

Built by a member of the [Marriage Helper](https://www.marriagehelper.com) community around **[The Calm Toolkit](https://www.marriagehelper.com)** — Marriage Helper's step-by-step framework for stress regulation and emotional wellness.

---

## What It Does

When you're overwhelmed, the hardest part is knowing where to start. Calm Down removes that barrier. It asks you three simple things — how stressed you are, and which parts of your life feel most affected — and then hands you a short, focused plan of exercises tailored to your answers.

The app guides you through the exercise itself (breathing animations, step-by-step prompts, reflection questions), tracks your stress level before and after, and shows you a session summary at the end. Everything stays on your device and disappears when you close the tab.

---

## How It Works

The app is a four-screen guided flow:

**1. Stress Check-In**
Pick a number from 1 to 10 that describes how you feel right now. You don't have to know why — just pick the number that feels closest. At levels 8–10, a gentle interstitial surfaces the 988 Suicide & Crisis Lifeline as a non-clinical reminder.

**2. PIES Categories**
Select which areas of your life feel most affected right now:
- **Physical** — body tension, energy, sleep
- **Intellectual** — racing thoughts, mental fog, rumination
- **Emotional** — feelings of fear, sadness, anger, or disconnection
- **Spiritual** — loss of meaning, purpose, or peace

**3. Your Calm-Down Plan**
The app recommends tools based on your stress level and selected categories, weighted so the most relevant exercises surface first. You can try them in any order, skip any you don't want, and browse other tools at the bottom.

**4. Tool Experience**
Each tool has a unique guided experience:
- **Breathing tools** — animated visual timers (Box Breathing, Full Trunk Breathing)
- **Cognitive tools** — step-through prompts (Growth Mindset Reframe, Name the Lie, Habit Loop Audit)
- **Emotional tools** — guided reflection (Gratitude, Safe Place / Resourcing, Journaling)
- **Spiritual tools** — Mantra selection, Prayer Prompts, Values Alignment
- **Lifestyle tools** — Sleep hygiene, Movement, Nutrition prompts
- **Grounding** — 5-Senses grounding exercise, Mindfulness

After each tool, you can check in again on your stress level. The app tracks your progress — from where you started to where you are now — and shows a full session summary when you're done.

---

## The 16 Tools

| Tool | Category | What it does |
|---|---|---|
| Box Breathing | Physical | 4-count animated breathing cycle |
| Full Trunk Breathing | Physical | Diaphragmatic breathing guide |
| Growth Mindset Reframe | Intellectual | Reframe a fixed-mindset thought |
| Habit Loop Audit | Intellectual | Identify cue / routine / reward patterns |
| Name the Lie | Intellectual | Surface and challenge anxious self-talk |
| Gratitude | Emotional | Three-item guided gratitude prompt |
| Safe Place / Resourcing | Emotional | Guided visualization exercise |
| Journaling | Emotional | Open-ended written reflection |
| Mantra | Spiritual | Select or write a personal mantra |
| Prayer Prompts | Spiritual | Guided prayer structure |
| Values Alignment | Spiritual | Reconnect to what matters most |
| Sleep Hygiene | Physical | Practical sleep reset checklist |
| Movement | Physical | Short movement break guidance |
| Nutrition | Physical | Grounding through mindful eating |
| 5-Senses Grounding | Intellectual/Emotional | Present-moment anchoring exercise |
| Mindfulness | Spiritual | Breath-focused mindfulness practice |

---

## Privacy

**Privacy is a core principle of this app — not an afterthought.**

- **No data collection.** The app does not collect, store, log, or transmit any personal information — ever. Your stress levels, written responses, and session activity never leave your device.
- **Session-only.** All data lives only in your browser tab. Close or refresh the tab and everything is gone. Nothing is written to cookies, local storage, or any server.
- **No analytics, no trackers, no third-party services.** There is no Google Analytics, no ad network, no pixel, no telemetry of any kind. The app makes zero external network requests during a session.
- **Downloads stay on your device.** If you download your journal responses, that file goes only to your local device through your browser's standard download function — we never see it.
- **Open source.** The full source code is available for review. There is nowhere to hide anything.

---

## Screenshots

| Stress Check-In | PIES Categories | Your Calm-Down Plan |
|:-:|:-:|:-:|
| ![Stress check-in screen showing 1–10 scale with 7 selected](assets/Demo%20Images/Screen%201.png) | ![PIES category selector with Physical and Emotional checked](assets/Demo%20Images/Screen%202.png) | ![Personalized calm-down plan with Box Breathing highlighted](assets/Demo%20Images/Screen%203.png) |

| Box Breathing (Active) | Tool Complete | Quick Check-In |
|:-:|:-:|:-:|
| ![Box breathing animated timer showing Round 1 of 4, Hold phase](assets/Demo%20Images/Screen%204.png) | ![Completion screen — "You did something hard. That matters."](assets/Demo%20Images/screen%205.png) | ![Mid-session check-in modal — stress dropped from 7 to 4](assets/Demo%20Images/screen%206.png) |

| Updated Plan | Session Summary | Install as PWA |
|:-:|:-:|:-:|
| ![Updated plan showing stress progress and tools tried](assets/Demo%20Images/Screen%207.png) | ![5-Senses Grounding tool with session summary overlay](assets/Demo%20Images/Screen%208.png) | ![Add to Home Screen modal with iOS and Android install steps](assets/Demo%20Images/Install-on-HomeScreen.png) |

---

## Tech Stack

Pure HTML, CSS, and vanilla JavaScript. No frameworks, no build tools, no npm dependencies. The entire app is static files served by nginx inside a Docker container.

This means:
- **No server-side code** — there is no application server, no database, no API
- **Works fully offline** — once loaded, the app functions without an internet connection (via a Service Worker)
- **Installable** — can be added to the iOS or Android home screen and launched like a native app (PWA)
- **Auditable** — anyone can open DevTools and read every line of code the app runs

---

## Running with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your server

### Quick start

```bash
git clone https://github.com/gismc123/calm.git
cd calm
docker compose up -d
```

The app will be available at `http://localhost:901`.

### What the container does

The `Dockerfile` copies all static files into an `nginx:alpine` image and serves them on port 80. Docker Compose maps that to port `901` on the host.

```
Host port 901  →  Container port 80  →  nginx serves static files
```

To change the host port, edit `docker-compose.yml`:

```yaml
ports:
  - "901:80"   # change 901 to whatever port you want on the host
```

---

## Serving behind a reverse proxy (subdomain)

The container exposes port `901` on the host. A reverse proxy sitting in front routes your subdomain to that port. The production URL belongs in your reverse proxy config — not in `docker-compose.yml`.

### Nginx Proxy Manager (GUI)

1. Go to **Proxy Hosts → Add Proxy Host**
2. **Domain Names:** `calm.yourdomain.com`
3. **Scheme:** `http` · **Forward Hostname:** `localhost` · **Forward Port:** `901`
4. Enable **Block Common Exploits** and request an SSL certificate under the **SSL** tab

### Traefik (Docker label-based)

```yaml
services:
  calm-down-app:
    build: .
    container_name: calm-down-app
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.calm.rule=Host(`calm.yourdomain.com`)"
      - "traefik.http.routers.calm.entrypoints=websecure"
      - "traefik.http.routers.calm.tls.certresolver=letsencrypt"
      - "traefik.http.services.calm.loadbalancer.server.port=80"
```

Remove the `ports` block — Traefik handles routing through the Docker network.

### Caddy

```
calm.yourdomain.com {
    reverse_proxy localhost:901
}
```

Caddy handles HTTPS automatically via Let's Encrypt.

---

## Deploying updates

```bash
git pull
docker compose up -d --build
```

Or use the included `deploy.sh` script, which also stamps a build date into the service worker (forcing clients to pick up fresh files) and optionally purges a Cloudflare cache:

```bash
./deploy.sh
```

Create a `.env` file from `.env.example` and fill in your Cloudflare credentials if you use that CDN. The `.env` file is gitignored and never committed.

---

## PWA / Install to Home Screen

- **Android (Chrome):** A banner appears on first visit. Tap **Install**.
- **iOS (Safari):** Tap the Share icon → **Add to Home Screen**.

Once installed, the app launches in standalone mode (no browser chrome) and works fully offline.

---

## File Structure

```
calm/
├── index.html          # App shell — all four screens and all modals
├── style.css           # All styles, CSS custom properties, three color themes
├── app.js              # Screen logic, tool timers, session state
├── manifest.json       # PWA manifest (icons, display mode, theme color)
├── sw.js               # Service worker — caches assets for offline use
├── Dockerfile          # nginx:alpine image, copies static files
├── docker-compose.yml  # Maps container port 80 to host port 901
├── nginx.conf          # Cache-control headers, SPA fallback routing
├── deploy.sh           # Build + deploy script with optional Cloudflare purge
├── .env.example        # Template for Cloudflare credentials
└── assets/
    ├── icon-192.png    # PWA icon (192×192)
    ├── icon-512.png    # PWA icon (512×512)
    └── icon-apple.png  # iOS touch icon (180×180)
```

---

## Attribution

The calm-down tools, the PIES framework, and the therapeutic concepts in this app are drawn from **The Calm Toolkit** by Marriage Helper. Marriage Helper is a resource dedicated to helping individuals and couples navigate difficult seasons with evidence-based tools and compassionate guidance.

This app is an independent personal project built by a community member to make those tools more accessible in a private, offline-capable digital format. It is not affiliated with, endorsed by, or a product of Marriage Helper.

Learn more about Marriage Helper at [marriagehelper.com](https://www.marriagehelper.com).

---

## Legal

This app is provided for personal wellness use only. It is not a medical service, mental health treatment, or clinical intervention. Nothing in this app constitutes medical advice, diagnosis, or treatment. If you are in crisis, please contact the **988 Suicide & Crisis Lifeline** (call or text 988).

Source material © Marriage Helper. App code is a personal, non-commercial project.
