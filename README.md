# Product Recommender

Small example app: React frontend that displays a list of products and an Express server that calls OpenAI to generate product recommendations.

Features

- React + Vite frontend
- Express server proxy to OpenAI (server-side uses OPENAI_API_KEY)
- User can type preferences (e.g., "I want a phone under $500"), hit Recommend, and the AI will return recommended products from the list.

Security

- Keep your OpenAI API key secret. Set it in the server environment (see `.env.example`).

Quick start

1. Start server

```bash
# from project root
cd server
npm install
# set OPENAI_API_KEY in environment, e.g. in a .env file
npm run dev
```

2. Start client

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 and try the app.

Notes

- The server expects a JSON response from the model listing product ids to recommend. The prompt is constrained to ask the model to only return JSON.
- If you don't have an OpenAI API key you can still use the frontend to filter locally (no AI) by modifying code.

Files

- `client/` - React frontend
- `server/` - Express server that forwards to OpenAI

Enjoy!
