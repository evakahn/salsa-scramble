# Salsa Scramble

A falling-block dance game. Every piece is a salsa dancer striking a pose, and the board is a theater stage with curtains, spotlights and a cheering crowd. Clear lines to hear "¡Eso!", "¡Wepa!", "¡Fuego!" and, for four at once, "¡AZÚCAR!"

## Shout ¡OLÉ!

When you clear a row, the game stops for a curtain call. The dancers in that row take a bow and keep bowing until you **shout "¡OLÉ!"** at your phone or laptop. Then they cartwheel off into the wings and the show goes on.

- The game asks for mic access when you tap **Curtain up**. Browsers only allow the mic on https or localhost, and GitHub Pages is https.
- It listens for a loud shout, measured against the room's background noise, so it works offline on any browser. It doesn't check that you actually said "olé", so any yell works.
- If the mic is blocked, you tap the card instead. If you can't shout, a **"Can't shout? Tap"** link appears after 5 seconds.

It's plain HTML, CSS and JavaScript, with no dependencies and no build step.

## The troupe

| Shape | Performer |
| --- | --- |
| I | Grand jeté: a split leap |
| O | A salsa couple, hands joined |
| T | Ta-da! Arms out, maracas in hand |
| J / L | High kick |
| S / Z | Hip sway with a spinning skirt |

## Play locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Controls

| Key | Action |
| --- | --- |
| ← → | Move |
| ↑ / X | Spin clockwise |
| Z | Spin counter-clockwise |
| ↓ | Soft drop |
| Space | Hard drop |
| C | Send backstage (hold) |
| P / Esc | Intermission (pause) |
| Enter | Curtain up / resume (or olé, once the tap fallback shows) |

On phones and tablets, on-screen buttons appear instead.

## Testing

Open `http://localhost:8000/?debug`, start a game, then run `salsaDebug.clear(2)` in the console to fill and clear two rows right away.
