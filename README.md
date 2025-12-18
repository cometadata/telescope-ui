# Telescope UI

Next.js application for exploring arXiv works enriched with COMET data.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with:

```
TYPESENSE_HOST=your-host.a1.typesense.net
TYPESENSE_API_KEY=your-api-key
```

## Testing

```bash
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # E2E tests (Playwright)
npm test                 # All tests
```

## Deployment

Deployed via Vercel. Branch → environment mapping:

- `dev` → Preview (dev.telescope-ui.vercel.app)
- `staging` → Preview (staging.telescope-ui.vercel.app)
- `main` + tag `v*` → Production

## Branch Workflow

1. Create feature branch from `dev`
2. Open PR to `dev` (CI must pass)
3. Merge to `dev`
4. PR from `dev` → `staging` when ready
5. PR from `staging` → `main` when ready
6. Create tag (e.g., `v1.0.0`) on `main` for production deploy
