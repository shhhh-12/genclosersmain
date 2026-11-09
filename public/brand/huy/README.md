# Brand partner character: drop-in folder

Put the files **sent by the artist** here (together with his written OK to use them on GenClosers).

| File | Used by | What happens |
|---|---|---|
| `push.json` | Hero opening push (`src/lib/brandPuppet.ts`) | His pushing character replaces the code salesman while the black curtain is pushed open. His steps follow the curtain's travel. |

Without `push.json`, the hero uses the code-drawn salesman, so the site works either way.

## After dropping the file in

0. Switch it on: add `NEXT_PUBLIC_BRAND_PUSH=1` to `web/.env.local` (and the host's env), then restart the dev server.

1. Open `http://localhost:3000/?brandDebug=1`. A dashed red box shows the Lottie frame, a red dot shows where the code expects his hands, and a red line shows where it expects his feet.
2. Adjust `BRAND_PUSH` in `src/lib/brandPuppet.ts`:
   - `hand`: the position of his hands as a fraction of the comp (0–1). The dot should sit on his palms.
   - `floor`: where his soles are as a fraction of the comp height.
   - `height` and `bodySpan`: how big he is on screen.
   - `cycle`: curtain travel per walk cycle. Raise it if his feet slide, lower it if he moonwalks.
3. Before launch, ask him for a version with plain sneakers (no third-party logos).

This README is not loaded by the site.
