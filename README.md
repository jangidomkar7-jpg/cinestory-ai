# CineStory AI — Realistic Video Maker

A GitHub Pages-ready story-to-storyboard and browser video assembly starter app.

## What it does
- Splits Hindi/English scripts into scenes.
- Writes a cinematic visual prompt for each scene.
- Lets you upload one image per scene.
- Previews a landscape (16:9) or portrait (9:16) storyboard.
- Plays browser text-to-speech narration as a preview.
- Records scene visuals and optional uploaded background music, then attempts MP4 conversion with FFmpeg.wasm.

## Important: what this is and is not
This starter app does **not** generate realistic AI images or AI motion footage by itself. It creates scene breakdowns and prompts, and you add an image for each scene (for example, an image you create with an AI image service). It then assembles those visuals into a video with simple scene holds. Real text-to-video generation requires a provider API and a secure backend; do not put secret API keys in public GitHub files.

Browser speech synthesis is preview-only and is not included in the exported MP4. Optional uploaded background music can be included. MP4 conversion uses FFmpeg.wasm from a CDN and may be slow or fail on some mobile browsers due to memory or codec limitations. This is not a guarantee of professional AI video output.

## Publish on GitHub Pages
1. Create a public repository, e.g. `cinestory-ai`.
2. Extract this ZIP.
3. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
4. Open **Settings → Pages**.
5. Select **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
6. Wait for GitHub Pages to publish your site. The URL will look like `https://YOUR-USERNAME.github.io/cinestory-ai/`.

## Usage
1. Enter a story and click **Create storyboard**.
2. Select each scene and use **Add scene image** to attach a visual.
3. Choose landscape or portrait.
4. Optionally add background music.
5. Click **Export MP4** and keep the browser tab open while conversion runs.

## Requirements
- Internet connection for Three.js/FFmpeg CDN assets is not needed here for rendering, but is needed to load FFmpeg conversion modules.
- A recent desktop browser is recommended for MP4 export.
- Use only images, music, and stories you have permission to use.
