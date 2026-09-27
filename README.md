# 🤖 Portfolio AI Assistant

> An AI-powered chatbot that answers questions about my skills, projects, and experience — trained on my resume, powered by an LLM, and deployed live.

**Live Demo:** [https://my-portfolio-1-0n25.onrender.com](https://my-portfolio-1-0n25.onrender.com)

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Python](https://img.shields.io/badge/backend-FastAPI-009688)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Groq](https://img.shields.io/badge/LLM-Groq-orange)
![Deployed on](https://img.shields.io/badge/deployed%20on-Render-46E3B7)

---

## 💬 What is this?

Instead of a static "About Me" page, visitors to my portfolio can **talk** to an AI assistant that knows my actual background — pulled directly from my resume — and answers naturally, like I would in an interview.

Ask it things like:
- *"What projects has Raashid built?"*
- *"What's his tech stack?"*
- *"Does he have professional work experience?"*
- *"Tell me about his education."*

The assistant is instructed to **never invent information** — if something isn't in my resume, it says so honestly instead of making things up.

---

## ✨ Features

- 🧠 **Resume-grounded answers** — the LLM only knows what's in my actual resume (parsed once, cached in memory)
- ⚡ **Real-time streaming responses** — tokens stream in as the model generates them, just like ChatGPT
- 🎨 **Clean, minimal chat UI** — built with React, styled for readability, with Markdown rendering (bold, lists, code blocks, tables, links)
- 🛡️ **Guardrails against hallucination** — a detailed system prompt keeps the assistant honest about what it does and doesn't know
- 🚀 **Fully deployed & production-ready** — separate backend/frontend services, environment-based config, CORS-secured

---

## 🏗️ Architecture

```
┌─────────────────┐         HTTPS/JSON          ┌──────────────────┐
│                  │  ────────────────────────▶  │                  │
│  React + Vite    │                              │  FastAPI Backend │
│  (Frontend)      │  ◀────────────────────────   │  (Python)        │
│                  │      Streaming response       │                  │
└─────────────────┘                               └────────┬─────────┘
                                                             │
                                                    ┌────────▼─────────┐
                                                    │   Groq API        │
                                                    │  (LLM inference)  │
                                                    └────────┬─────────┘
                                                             │
                                                    ┌────────▼─────────┐
                                                    │  my_resume.pdf     │
                                                    │  (parsed & cached) │
                                                    └────────────────────┘
```

**How it works:**
1. On first request, the backend reads `my_resume.pdf`, extracts the text, and uses an LLM call to parse it into structured JSON (name, skills, projects, experience, education, etc.)
2. That structured data is cached in memory and injected into the system prompt for every chat request
3. When a visitor sends a message, the backend streams the LLM's response back token-by-token over HTTP
4. The frontend reads the stream and renders it live, with full Markdown support

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, `react-markdown`, `remark-gfm` |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **LLM** | Groq API (`openai/gpt-oss-120b`) |
| **Resume Parsing** | `pypdf` for text extraction, LLM for structuring |
| **Package Management** | `uv` (Python), `npm` (JS) |
| **Deployment** | Render (Web Service + Static Site) |

---

## 📁 Project Structure

```
MY_PORTFOLIO/
├── Backend/
│   ├── src/
│   ├── main.py            # FastAPI app, routes, CORS, resume parsing
│   ├── my_resume.pdf       # Source resume (parsed at runtime)
│   ├── .env.example        # Environment variable template
│   ├── pyproject.toml      # Python dependencies (uv)
│   └── uv.lock
│
├── Frontend/
│   ├── src/
│   │   ├── App.jsx         # Chat UI + streaming logic
│   │   ├── App.css
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Running Locally

### Backend

```bash
cd Backend
uv sync
cp .env.example .env   # add your GROQ_API_KEY
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

> Update `API_BASE_URL` in `Frontend/src/App.jsx` if your backend runs on a different port.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | API key for Groq LLM inference — [get one here](https://console.groq.com) |

---

## 🌐 Deployment

Deployed on **Render** as two independent services:

| Service | Type | URL |
|---|---|---|
| Backend | Web Service (Python) | `https://my-portfolio-nfck.onrender.com` |
| Frontend | Static Site | `https://my-portfolio-1-0n25.onrender.com` |

Both auto-deploy on every push to `main`. CORS is explicitly configured on the backend to only accept requests from the deployed frontend origin.

**API Endpoints:**

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Health check — confirms resume was parsed |
| `GET` | `/resume` | Returns the parsed, structured resume data |
| `POST` | `/chat` | Streams an AI response to `{ "question": "..." }` |

---

## 🎯 Why I Built This

I wanted my portfolio to do more than list projects — I wanted it to demonstrate a real, end-to-end AI product: prompt engineering, streaming responses, structured data extraction, full-stack integration, and a real production deployment. This project touches all of that in one small, focused build.

---

## 📬 Contact

Have questions or want to connect? Ask the assistant on the [live site](https://my-portfolio-1-0n25.onrender.com) — or reach out to me directly.

---

<p align="center">Built with ❤️ by Mohammad Raashid</p>
