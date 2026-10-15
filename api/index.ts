import { app } from '../server/app';

// Vercel Serverless Function handler
export default async function handler(req: any, res: any) {
  try {
    // 1. Prevent body-parser from hanging on Vercel:
    // When Vercel's Node runtime pre-parses the incoming request body, the stream is already consumed.
    // Setting req._body = true informs body-parser that the body has already been received, preventing
    // the request from hanging and timing out with FUNCTION_INVOCATION_FAILED.
    if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
      try {
        req.body = JSON.parse(req.body);
        req._body = true;
      } catch {
        // Leave unparsed if invalid JSON
      }
    } else if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
      req._body = true;
    }

    // 2. Comprehensive URL route normalization for Vercel rewrites:
    const rawUrl = req.url || '';
    let queryRoute: string | null = null;
    if (rawUrl.includes('?')) {
      try {
        const u = new URL(rawUrl, 'http://localhost');
        queryRoute = u.searchParams.get('__route');
      } catch {}
    }

    const matchedPath =
      queryRoute ||
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-vercel-matched-path'] as string) ||
      (req.headers['x-rewrite-url'] as string) ||
      (req.originalUrl && req.originalUrl.startsWith('/api') ? req.originalUrl : '');

    if (matchedPath && typeof matchedPath === 'string') {
      const queryIdx = rawUrl ? rawUrl.indexOf('?') : -1;
      const queryString = queryIdx !== -1 ? rawUrl.slice(queryIdx) : '';
      req.url = matchedPath + (matchedPath.includes('?') ? '' : queryString);
    } else if (req.url && !req.url.startsWith('/api')) {
      // If Vercel stripped /api prefix (e.g. /auth/google -> /api/auth/google)
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    // 3. Keep the serverless lambda invocation alive until the Express response completes
    return await new Promise<void>((resolve, reject) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      res.on('error', reject);

      app(req, res, (err?: any) => {
        if (err) {
          console.error('[EduPredict Vercel Handler Error]:', err);
          if (!res.headersSent) {
            res.status(500).json({
              error: 'Serverless execution error: ' + (err?.message || 'Internal error')
            });
          }
          resolve();
        }
      });
    });
  } catch (fatalErr: any) {
    console.error('[EduPredict Vercel Fatal Error]:', fatalErr);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Serverless invocation error: ' + (fatalErr?.message || 'Internal error')
      });
    }
  }
}

