# DL.Chiu 3D Portfolio

An interactive 3D desk portfolio. The 3D room (Three.js + React) is based on
[henryjeff/portfolio-website](https://github.com/henryjeff/portfolio-website) by Henry Heffernan (MIT).
The desktop shown on the monitor (`static/os/`) is written from scratch for this project.

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # production build into ./public
```

## Edit the content

- Monitor content: the `PROFILE` object at the top of `static/os/os.js`.
- Intro text and name: `src/Application/UI/components/InfoOverlay.tsx` and `LoadingScreen.tsx`.
- Page title and social preview: `src/index.html`.

## Deploy

Pushing to the `portfolio-3d` branch runs `.github/workflows/deploy-pages.yml`.
In the repository settings, set Pages > Source to "GitHub Actions".
Site URL: https://dl-jack-123.github.io/dl-jack-123/

## Rooms
The default scene is a bright daylight home office (window with roller blind, standing desk, flat monitor running DL-OS, laptop, mug, phone, plant). Add `?room=classic` to the URL to show the original retro CRT room. Only one room's assets are loaded per visit.

## Credits
- 3D room based on [henryjeff/portfolio-website](https://github.com/henryjeff/portfolio-website) (MIT).
- Music from [Pixabay](https://pixabay.com/music/), used under the Pixabay Content License:
  - "Suspense Background" by nastelbom (https://pixabay.com/music/suspense-suspense-suspense-background-623748/)
  - "Stylish Trailer Percussion" by audioera
  - "Inspiring Travel Acoustic" by loka_music
- 3D models for the bright room (all CC0):
  - Furniture Kit by Kenney (https://kenney.nl/assets/furniture-kit)
  - Furniture Bits by Kay Lousberg / KayKit (https://kaylousberg.itch.io/furniture-bits)
  - Potted Plant 04 by James Ray Cock, Poly Haven (https://polyhaven.com/a/potted_plant_04)
  - Window, blind, walls, desk, laptop stand, mug and phone are original Three.js primitives.
  - Machine-readable list: `static/models/room/CREDITS.json`.
