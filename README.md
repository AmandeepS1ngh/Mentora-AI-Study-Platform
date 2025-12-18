# 📚 Mentora - AI-Powered Study Platform

An intelligent study companion with AI-powered task management, personalized study plans, and document Q&A.

## ✨ Features

- **📅 Smart Calendar** - Natural language task creation with Google Calendar sync
- **📖 Study Plan Generator** - AI-generated personalized learning schedules
- **💬 Document Q&A (RAG)** - Upload PDFs and ask questions about them
- **🤖 AI Chat Assistant** - Create tasks by chatting naturally

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- [Supabase](https://supabase.com) account
- [Groq](https://console.groq.com) API key
- Google Cloud Console project (for Calendar sync)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/Mentora_Agentic_AI.git
cd Mentora_Agentic_AI

# Install all dependencies
cd frontend && npm install && cd ..
cd calendar-agent && npm install && cd ..
cd rag-backend && npm install && cd ..
```

### 2. Configure Environment

Copy example env files and add your API keys:

```bash
# Calendar Agent
cp calendar-agent/.env.example calendar-agent/.env

# RAG Backend  
cp rag-backend/.env.example rag-backend/.env
```

### 3. Setup Database

Run the SQL schema in your Supabase project:
- Go to Supabase Dashboard → SQL Editor
- Copy & run contents of `calendar-agent/schema.sql`

### 4. Start Development Servers

```bash
# Terminal 1 - Frontend (http://localhost:3000)
cd frontend && npm run dev

# Terminal 2 - Calendar Agent (http://localhost:3001)
cd calendar-agent && npm run dev

# Terminal 3 - RAG Backend (http://localhost:3000 or 3002)
cd rag-backend && npm run dev
```

## 📁 Project Structure

```
Mentora_Agentic_AI/
├── frontend/           # Next.js frontend
│   ├── app/           # Pages (landing, calendar, chat, study-plan, docs)
│   └── components/    # React components
│
├── calendar-agent/     # Calendar & Study Plan API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   └── services/  # Business logic
│   └── schema.sql     # Database schema
│
└── rag-backend/        # Document Q&A API
    └── src/
        └── services/  # RAG pipeline
```

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Shadcn/UI |
| **Backend** | Node.js, Express |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Groq (Llama 3), Local embeddings |
| **Integrations** | Google Calendar API |

## 📝 Environment Variables

### calendar-agent/.env
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/calendar/oauth/callback
```

### rag-backend/.env
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_key
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by Amandeep Singh**
