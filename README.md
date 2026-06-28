# Tank Warfare

A 3D browser tank game built with [Three.js](https://threejs.org/). Drive a tank, aim
your turret independently with the mouse, and destroy the enemy. Includes single-player
modes against AI and an online 1v1 mode over WebSockets.

## Game modes

- **1v1** — duel one enemy ace tank.
- **Team vs Team** — you + allies fight an enemy squad.
- **Friends vs Friends** — larger squad battle.
- **LAN / Online 1v1** — two devices play one shared match (needs the server running).

## Controls

| Input | Action |
| --- | --- |
| `W` / `S` | Drive forward / reverse |
| `A` / `D` | Turn hull left / right |
| Mouse | Aim turret |
| Left Click / `Space` | Fire |

## Run locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm start
```

Then open <http://localhost:5500> in your browser. For LAN/online 1v1, open the same
URL on a second device on the same network (or two browser tabs) and press
**START BATTLE** on both.

Set a custom port with `PORT=8080 npm start`.

## Deploy for free (Render)

The repo includes a [`render.yaml`](render.yaml) blueprint.

1. Sign in to [render.com](https://render.com) with GitHub.
2. **New +** → **Web Service** → connect this repo.
3. Render reads `render.yaml` automatically (Node runtime, `npm install`, `npm start`,
   free plan). Click **Create Web Service**.
4. Open the generated `https://<name>.onrender.com` URL — all modes work, including
   online 1v1 (the client auto-uses `wss://` over HTTPS).

> Free instances sleep after ~15 min idle, so the first request after a pause takes
> ~30–50s to wake up.

## Project layout

```
index.html            # the whole game (markup, styles, and game logic)
server.js             # static file server + WebSocket relay for online 1v1
vendor/three.module.js # Three.js library
render.yaml           # Render deployment config
```
