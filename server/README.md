Server quick notes

- Run `npm install` in `server/` then `npm run dev` to start the Express server.
- Set `OPENAI_API_KEY` in `.env` or environment before running.
- The server exposes POST /recommend which expects JSON { prompt: string, products: Array } and returns { recommendedIds: Array, modelText: string, explanation?: string }
