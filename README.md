# Gemma Chatbot — Local AI Chat with Angular & Python

A full-stack chatbot application powered by Google's **Gemma 3 4B** model running entirely on your machine via [Ollama](https://ollama.com). No API keys, no cloud, no telemetry — 100% private.

![screenshot placeholder](https://placehold.co/860x480/0d0d0d/7c6af5?text=Gemma+Chatbot)

---

## Features

- **Real-time streaming** — responses stream token by token via Server-Sent Events (SSE)
- **Multi-turn conversations** — full chat history is sent with every request
- **Completely local** — inference runs on your hardware, nothing is sent externally
- **Configurable model** — swap to any Ollama model via a single environment variable
- **Modern UI** — dark-themed Angular 17 frontend with auto-resizing input

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 (standalone components), TypeScript |
| Backend | Python 3.11+, FastAPI |
| AI Runtime | Ollama |
| AI Model | Gemma 4 (`gemma4:latest`) |
| Streaming | Server-Sent Events (SSE) |  

---

## Prerequisites

Make sure the following are installed before proceeding:

| Tool | Version | Install |
|---|---|---|
| Python | 3.11+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Angular CLI | 17+ | `npm install -g @angular/cli` |
| Ollama | latest | [ollama.com](https://ollama.com/) |

---

## Installation

### 1. Pull the Gemma model

Start Ollama and pull the model (≈3 GB download):

```bash
ollama pull gemma3:4b
```

> You can verify it works with: `ollama run gemma3:4b "Hello!"`

---

### 2. Backend setup

```bash
cd Back

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables (optional)
cp .env.example .env
```

---

### 3. Frontend setup

```bash
cd Front
npm install
```

---

## Running the App

You need two terminals open simultaneously.

### Terminal 1 — Start the backend

```bash
cd Back
venv\Scripts\activate        # Windows
# or: source venv/bin/activate  # macOS / Linux

uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
You can check `http://localhost:8000/health` to confirm it is running.

### Terminal 2 — Start the frontend

```bash
cd Front
ng serve
```

Open your browser at **[http://localhost:4200](http://localhost:4200)**.

---

## Usage

1. Type a message in the input box at the bottom
2. Press **Enter** to send (or click the send button)
3. Use **Shift + Enter** to insert a new line without sending
4. The model's response streams in real time, token by token
5. Click **New Chat** to clear the conversation history

---

## Project Structure

```
gemma-chatbot/
│
├── Back/
│   ├── main.py              # FastAPI app — /chat (SSE) and /health endpoints
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variable template
│
├── Front/
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/
│   │   │   │   └── message.model.ts      # Message interface
│   │   │   ├── services/
│   │   │   │   └── chat.service.ts       # Streaming fetch via SSE
│   │   │   ├── app.component.ts          # Root component + chat logic
│   │   │   ├── app.component.html        # Chat UI template
│   │   │   └── app.component.css         # Dark theme styles
│   │   ├── main.ts                       # Angular bootstrap
│   │   ├── index.html
│   │   └── styles.css                    # Global reset
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.app.json
│
└── README.md
```

---

## Configuration

Copy `Back/.env.example` to `Back/.env` and edit as needed:

```env
OLLAMA_HOST=http://localhost:11434   # Ollama server address
OLLAMA_MODEL=gemma4:latest               # Any model available in your Ollama
FRONTEND_URL=http://localhost:4200   # Allowed CORS origin
```

To use a different model, change `OLLAMA_MODEL`. For example:

```env
OLLAMA_MODEL=llama3.2:3b
OLLAMA_MODEL=phi3:mini
OLLAMA_MODEL=mistral:7b
```

Run `ollama list` to see all locally available models.

---

## How It Works

```
User types message
      │
      ▼
Angular sends POST /chat
(full conversation history)
      │
      ▼
FastAPI receives request
      │
      ▼
Python Ollama client calls
local Ollama server (port 11434)
      │
      ▼
Gemma runs inference on CPU/GPU
      │
      ▼
Tokens stream back as SSE events
(data: {"content": "..."})
      │
      ▼
Angular reads the stream
and appends tokens to the UI
```

### Key implementation details

- **Streaming**: The backend uses FastAPI's `StreamingResponse` with `media_type="text/event-stream"`. Each token is wrapped as an SSE `data:` line.
- **Frontend streaming**: Angular uses the native `fetch` API with `ReadableStream` to consume the SSE stream — this allows POST requests with a body (which `EventSource` does not support).
- **Conversation context**: Every request sends the full message history so the model maintains context across turns.
- **Angular 17**: Uses standalone components and the new built-in control flow (`@if`, `@for`).

---

## API Reference

### `POST /chat`

Send a conversation and receive a streamed response.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Response:** `text/event-stream`
```
data: {"content": "Hi"}
data: {"content": " there"}
data: {"content": "!"}
data: [DONE]
```

### `GET /health`

Returns the current status and configured model.

```json
{ "status": "ok", "model": "gemma4:latest", "ollama_host": "http://localhost:11434" }
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Error: could not reach Ollama` | Make sure Ollama is running: `ollama serve` |
| Model not found | Pull it first: `ollama pull gemma3:4b` |
| CORS error in browser | Ensure `FRONTEND_URL` in `.env` matches the Angular dev server URL |
| Slow responses | Gemma 4 runs on CPU by default; a GPU will be significantly faster |
| Port already in use | Change the port in `uvicorn main:app --port <PORT>` and update `apiUrl` in `chat.service.ts` |

---

## License

MIT — feel free to use, modify, and distribute.
