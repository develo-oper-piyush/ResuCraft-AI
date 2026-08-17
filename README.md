# 🚀 ResuCraft AI - Dynamic AI Portfolio & Resume Generator

> **Transform flat resumes into intelligent, ATS-optimized, interactive digital portfolios and professional documents.**

ResuCraft AI is an advanced, full-stack Next.js application powered by Gemini 1.5, Groq LLMs, LangChain RAG, Cloudinary, Neon PostgreSQL, and Drizzle ORM. It enables job seekers to upload existing PDF resumes, perform deep ATS analysis, generate job-tailored content using Retrieval-Augmented Generation (RAG), and export beautiful PDF/LaTeX resumes.

---

## 📑 Table of Contents

- [✨ Core Capabilities \& Skills](#-core-capabilities--skills)
- [📁 Project Structure](#-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔑 Environment Variables Setup](#-environment-variables-setup)
- [⚙️ Installation Guide](#️-installation-guide)
- [🗄️ Database Setup](#️-database-setup)
- [🚀 Running the Application](#-running-the-application)
- [📡 API Endpoints Reference](#-api-endpoints-reference)
- [📖 Usage Guide](#-usage-guide)
- [📄 License](#-license)

---

## ✨ Core Capabilities & Skills

ResuCraft AI equips users with a suite of AI-driven capabilities and interactive tools:

### 1. 🤖 AI PDF Resume Parsing & Extraction
- **PDF Extraction**: Reads PDF resumes using `pdf-parse` and extracts clean plaintext.
- **Cloudinary Storage**: Securely uploads PDF documents to Cloudinary cloud storage.
- **Local Fallback**: Fallback storage mechanism in `data/uploads/` for offline/development resilience.

### 2. 📊 ATS Compatibility & Impact Score Analysis
- **Dual AI Engine**: Supports Google Gemini 1.5 Pro/Flash and Groq (Llama 3 70B/8B models).
- **Comprehensive Score Metric**: Calculates overall ATS Match Score (0–100), ATS readability, formatting flags, and structural feedback.
- **Section Breakdown**: Scores Contact Info, Summary, Experience, Education, Skills, and Projects independently.
- **Keyword & Action Word Analysis**: Highlights missing industry keywords, quantifies impact metrics, and recommends high-impact action verbs.
- **Visual Analytics**: Rendered with custom interactive charts, progress rings, and wobble cards (`analysis-charts.tsx`).

### 3. 🎯 RAG (Retrieval-Augmented Generation) Job Tailoring
- **LangChain Integration**: Built-in vector search / chunking engine in `lib/ai/rag-chain.ts`.
- **Target Role Optimization**: Rewrites resume bullet points, professional summary, and skills matrix to match specific Job Descriptions.
- **Real-Time Contextual Assistant**: Interactive RAG endpoint (`/api/rag/generate`) that generates job-tailored bullet points on demand.

### 4. 🎨 Interactive Resume Builder & LaTeX Templates
- **Modern WYSIWYG Builder**: Real-time form controls with live preview modes (`app/build/page.tsx`).
- **LaTeX Template Engine**: Supports crisp, classic, and high-impact LaTeX-rendered designs (`latex-resume-template.tsx`).
- **Dynamic Themes**: Sleek dark mode, dynamic color palettes, glassmorphism UI, and smooth scroll animations (GSAP & Lenis).

### 5. 📥 Multi-Format Exporting (PDF & LaTeX)
- **High-Fidelity PDF Export**: Client-side and server-side PDF generation using `jspdf`, `html2pdf.js`, and `html2canvas`.
- **LaTeX Source Code**: Download ready-to-compile raw `.tex` source files.

---

## 📁 Project Structure

```text
Resume Generator/
├── app/                        # Next.js 14 App Router (Pages & API Routes)
│   ├── analyze/                # Resume analysis views
│   │   ├── [id]/               # Individual resume analysis detail page
│   │   │   └── page.tsx
│   │   ├── loading.tsx         # Skeleton loading state for analysis
│   │   └── page.tsx            # Main resume upload & analysis dashboard
│   ├── api/                    # Serverless API routes
│   │   ├── analyze/            # POST: Triggers Gemini/Groq resume analysis
│   │   │   └── route.ts
│   │   ├── auth/               # NextAuth.js authentication endpoints
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── rag/                # Retrieval-Augmented Generation API
│   │   │   └── generate/
│   │   │       └── route.ts    # POST: Generates tailored content using job descriptions
│   │   ├── resumes/            # Resume management endpoints
│   │   │   ├── pdf/            # PDF rendering / export API
│   │   │   │   └── route.ts
│   │   │   └── route.ts        # GET / POST: Fetch and save resume documents
│   │   └── upload/             # POST: Handles PDF upload, Cloudinary sync, & text parsing
│   │       └── route.ts
│   ├── auth/                   # Authentication pages
│   │   ├── error/              # Auth error redirect page
│   │   └── page.tsx            # Sign in / Sign up page container
│   ├── build/                  # Resume builder section
│   │   ├── [id]/               # Resume editing page for specific resume ID
│   │   │   └── page.tsx
│   │   ├── loading.tsx         # Skeleton builder loader
│   │   └── page.tsx            # Main resume builder interface
│   ├── dashboard/              # User dashboard & resume collection
│   │   ├── loading.tsx
│   │   └── page.tsx            # Dashboard listing uploaded & generated resumes
│   ├── login/                  # Login route
│   │   └── page.tsx
│   ├── profile/                # User profile settings
│   │   └── page.tsx
│   ├── signup/                 # Registration route
│   │   └── page.tsx
│   ├── apple-icon.png          # Apple touch icon
│   ├── favicon.ico             # Browser favicon
│   ├── globals.css             # Global CSS styles & Tailwind directives
│   ├── icon.png                # App icon
│   ├── layout.tsx              # Root HTML Layout with NextAuth & Theme Providers
│   ├── loading.tsx             # Global loading fallback UI
│   └── page.tsx                # Landing Page with Prisma Hero, Wobble Cards, & GSAP
├── components/                 # UI Components
│   ├── providers/              # React Context Providers (SessionProvider, ThemeProvider)
│   └── ui/                     # Reusable UI & Layout Components
│       ├── resume-templates/   # Resume Design Templates
│       │   ├── index.tsx       # Standard modern resume template rendering engine
│       │   └── latex-resume-template.tsx # Professional LaTeX resume template
│       ├── analysis-charts.tsx # Rechart / Visual ATS breakdown components
│       ├── chip-card.tsx       # Skill / Tag chip cards
│       ├── landing-button.tsx  # Animated CTA buttons
│       ├── modern-login-signup.tsx # Glassmorphism auth modal/form
│       ├── prisma-hero.tsx     # 3D interactive hero section
│       ├── skeleton.tsx        # Loading skeleton placeholers
│       ├── smooth-cursor.tsx   # Custom dynamic cursor effect
│       ├── stateful-button.tsx # Interactive loading state button
│       └── wobble-card.tsx     # 3D wobble hover cards
├── data/                       # Local data storage & fallback mock data
│   ├── uploads/                # Local storage folder for uploaded PDF files
│   └── resumes.json            # Mock JSON seed data for offline resume testing
├── lib/                        # Core Utilities, Database & AI Client Libraries
│   ├── ai/                     # AI & RAG Integration Module
│   │   ├── gemini-groq-client.ts # Multi-LLM provider client (Gemini 1.5 & Groq)
│   │   └── rag-chain.ts        # LangChain RAG pipeline for job tailoring
│   ├── db/                     # Database Schema & Drizzle ORM
│   │   ├── index.ts            # Drizzle ORM client connected to Neon Postgres
│   │   └── schema.ts           # Database tables schema (users, resumes, embeddings)
│   ├── supabase/               # Supabase SSR & client initialization
│   ├── auth.ts                 # NextAuth credentials & provider options
│   ├── cloudinary.ts           # Cloudinary SDK configuration & upload helpers
│   ├── local-storage.ts        # Browser local storage backup sync
│   └── pdf-parser.ts           # PDF parsing utility wrapper
├── public/                     # Static assets (images, logos, SVGs)
├── scripts/                    # Database administration scripts
│   └── setup-supabase-tables.mjs # SQL migration script for Supabase tables
├── types/                      # TypeScript declarations
│   └── html2pdf.js.d.ts        # Type definition for html2pdf.js library
├── .env.local                  # Environment variables file (DO NOT COMMIT)
├── .gitignore                  # Git ignore directives
├── middleware.ts               # Next.js middleware for route protection & authentication
├── next.config.mjs             # Next.js configuration settings
├── package.json                # Project dependencies & npm scripts
├── postcss.config.js           # PostCSS configuration for Tailwind CSS
├── tailwind.config.js          # Tailwind CSS theme & custom animation config
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Animations & 3D** | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), [Lenis](https://lenis.darkroom.engineering/), [Three.js](https://threejs.org/) |
| **AI & RAG Engine** | [Google Gemini AI API](https://ai.google.dev/), [Groq Cloud SDK](https://groq.com/), [LangChain](https://www.langchain.com/) |
| **Database & ORM** | [Neon PostgreSQL](https://neon.tech/), [Supabase](https://supabase.com/), [Drizzle ORM](https://orm.drizzle.team/) |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) & Supabase Auth SSR |
| **Media & Storage** | [Cloudinary](https://cloudinary.com/) |
| **PDF Processing** | `pdf-parse`, `html2pdf.js`, `jspdf`, `html2canvas` |

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the project root directory and configure the following keys:

```env
# AI Models Configuration
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
AI_PROVIDER=gemini # Option: 'gemini' or 'groq'

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Supabase Storage & Database Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Authentication Configuration (NextAuth)
NEXTAUTH_SECRET=your_nextauth_secret_key_string
NEXTAUTH_URL=http://localhost:3000
```

---

## ⚙️ Installation Guide

Follow these step-by-step instructions to install and configure ResuCraft AI on your local environment:

### Prerequisites

Ensure you have the following software installed on your machine:
- **Node.js**: `v18.17.0` or higher
- **npm** (v9+) or **yarn** or **pnpm**
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/develo-oper-piyush/ResuCraftAI.git
cd ResuCraftAI
```

### 2. Install Project Dependencies

Install all core dependencies and dev tools:

```bash
npm install
```

---

## 🗄️ Database Setup

ResuCraft AI supports both **Neon PostgreSQL** (via Drizzle ORM) and **Supabase**.

### Option A: Setting up Neon PostgreSQL with Drizzle ORM

1. Ensure `DATABASE_URL` is set in `.env.local`.
2. Push database schema migrations to Neon:

```bash
npx drizzle-kit push
```

### Option B: Setting up Supabase SQL Tables

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and navigate to the **SQL Editor**.
2. Run the script provided in `scripts/setup-supabase-tables.mjs` or execute the following SQL:

```sql
-- Uploaded Resumes Table
CREATE TABLE IF NOT EXISTS public.uploaded_resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL DEFAULT '',
  cloudinary_id TEXT,
  parsed_text TEXT NOT NULL DEFAULT '',
  analysis_json JSONB,
  target_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Resumes Table
CREATE TABLE IF NOT EXISTS public.generated_resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template_id TEXT NOT NULL DEFAULT 'modern-minimal',
  content_json JSONB NOT NULL DEFAULT '{}',
  export_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Running the Application

### Development Server

Start the local development server with hot-reloading enabled:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

### Production Build & Launch

To build the application for production and verify TypeScript and linting:

```bash
# 1. Generate optimized production build
npm run build

# 2. Start production server
npm run start
```

---

## 📡 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/upload` | `POST` | Uploads PDF resume, extracts plaintext with `pdf-parse`, uploads to Cloudinary, and stores record in DB. |
| `/api/analyze` | `POST` | Runs AI analysis (Gemini/Groq) on resume text against job requirements to calculate ATS score and suggestions. |
| `/api/rag/generate` | `POST` | Uses LangChain vector chunking & RAG to tailor resume content and bullet points to job descriptions. |
| `/api/resumes` | `GET` / `POST` | Fetches saved resumes or creates/updates generated resume JSON data. |
| `/api/resumes/pdf` | `POST` | Renders and downloads formatted resume as a PDF file. |
| `/api/auth/[...nextauth]` | `GET` / `POST` | NextAuth.js authentication router (Sign in, Sign out, Session management). |

---

## 📖 Usage Guide

1. **Upload Resume**: Navigate to `/analyze` or `/dashboard` and upload an existing `.pdf` resume file.
2. **Review ATS Analytics**: View detailed score breakdowns, missing keywords, and structural improvement suggestions on `/analyze/[id]`.
3. **Tailor for Target Jobs**: Use the RAG AI feature to optimize your resume bullets against specific target job descriptions.
4. **Customize & Export**: Edit sections inside the live Resume Builder (`/build/[id]`) and export your resume as a pixel-perfect **PDF** or raw **LaTeX** source file.

---

## 📄 License

This project is released under the **MIT License**.
