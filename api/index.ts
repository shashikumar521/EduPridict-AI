import { app } from '../server/app';

// Vercel Serverless Function handler
export default function handler(req: any, res: any) {
  return app(req, res);
}
