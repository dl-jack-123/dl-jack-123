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
