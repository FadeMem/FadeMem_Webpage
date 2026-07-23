# FadeMem Project Page

Official project page for **FadeMem: Distance-Aware Memory Consolidation for Autoregressive Video Diffusion**.

The site presents the method overview, selected long-video results, matched comparisons, and training-free versus light fine-tuning examples at 60, 120, and 240 seconds.

## Local development

Requires Node.js 20 or newer.

```bash
npm ci
npm run dev
```

Before publishing, validate the curated data and build the production site:

```bash
npm run validate
npm run build
```

## Deployment

GitHub Pages deployment is configured in `.github/workflows/deploy.yml`. Pushes to `main` validate the curated assets, build the Vite application, and publish the `dist` directory through GitHub Actions.

The repository intentionally contains only the media referenced by the public page. Original experiment videos, server inventories, internal review reports, and processing logs are not part of this repository.

