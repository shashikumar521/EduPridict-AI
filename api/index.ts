import { app } from '../server/app';

// Vercel Serverless Function handler
export default function handler(req: any, res: any) {
  // Normalize req.url in Vercel serverless environment:
  // Vercel rewrites like /api/(.*) -> /api set headers with the actual route requested
  const matchedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-vercel-matched-path'] as string) ||
    (req.headers['x-rewrite-url'] as string);

  if (matchedPath && typeof matchedPath === 'string') {
    const queryIdx = req.url ? req.url.indexOf('?') : -1;
    const queryString = queryIdx !== -1 ? req.url.slice(queryIdx) : '';
    req.url = matchedPath + (matchedPath.includes('?') ? '' : queryString);
  } else if (req.url && !req.url.startsWith('/api')) {
    // If Vercel stripped /api prefix (e.g. /auth/google -> /api/auth/google)
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return app(req, res);
}
