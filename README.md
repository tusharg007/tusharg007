<p align="center">
  <img
    src="./assets/profile-banner.gif"
    width="100%"
    alt="Tushar Ghosh — AI engineering, agentic AI and data science"
  />
</p>

<h1 align="center">Hi, I'm Tushar Ghosh</h1>

<p align="center">
  <strong>AI Engineer building reliable agents, RAG systems, and data-driven ML products.</strong>
</p>

<p align="center">
  B.Tech CSE — Data Science & Analytics at IIIT Nagpur · Graduating 2027
</p>

<p align="center">
  Open to 6-month internships in AI Engineering, Agentic AI, Applied AI and Data Science across India.
</p>

<p align="center">
  <a href="https://tushar-portfolio-taupe.vercel.app">
    <img src="https://img.shields.io/badge/Portfolio-View%20My%20Work-FFD84D?style=flat-square&logo=vercel&logoColor=111111" alt="Portfolio"/>
  </a>
  <a href="mailto:tg304429@gmail.com">
    <img src="https://img.shields.io/badge/Email-Let's%20Connect-D14836?style=flat-square&logo=gmail&logoColor=white" alt="Email"/>
  </a>
  <a href="https://linkedin.com/in/tushar-ghosh-a3355124a/">
    <img src="https://img.shields.io/badge/LinkedIn-Tushar%20Ghosh-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
</p>

---

## What I Build

- **Agentic AI systems:** LangGraph workflows, multi-agent routing, tool orchestration, memory, grounding, evaluation and failure handling.
- **Production-oriented GenAI products:** RAG pipelines, vector search, full-stack interfaces, REST APIs, authentication, persistent storage and deployment.
- **Data science systems:** forecasting, anomaly detection, classification, clustering, feature engineering and decision-support applications.

I focus on building dependable end-to-end systems rather than isolated model demonstrations.

---

# Featured Work

## 1. CortexAI — Full-Stack Multi-Agent AI Workspace

[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/tusharg007/Cortex)

A full-stack AI workspace built around a LangGraph supervisor that routes requests to specialized agents for conversation, web research, coding, document creation, presentation generation, image generation, vision analysis and PDF question answering.

**Engineering highlights**

- React and Vite workspace with an Express API gateway and independently packaged backend services
- LangGraph supervisor with explicit and automatically classified agent routing
- PDF RAG using document parsing, recursive chunking, Google embeddings and Qdrant vector search
- MongoDB conversation persistence with Redis-backed recent memory
- Groq, Gemini and OpenRouter integrations for workload-specific model execution
- PDF, presentation, image and code-artifact delivery using AWS S3 presigned URLs

**Stack:** `React` `Node.js` `Express` `LangGraph` `LangChain` `MongoDB` `Redis` `Qdrant` `Groq` `Gemini` `AWS S3`

> Status: substantial locally runnable engineering prototype; final production cloud deployment is a future milestone.

---

## 2. Internal RFP Analyst — Evidence-Grounded LangGraph Agent

[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/tusharg007/Internal-RFP-Analyst)

A tool-orchestrated document intelligence agent that analyzes target RFPs against an internal case-study corpus and generates evidence-backed requirements, comparisons and proposal outputs.

**Engineering highlights**

- LangGraph StateGraph with intent routing, tool planning, scoped retrieval and final-answer synthesis
- Separate target-RFP and internal case-study corpora using ChromaDB metadata filters
- Requirement extraction, case-study ranking, project comparison and proposal-generation tools
- Page-level citations, prompt-budget controls, grounding verification and a bounded repair pass
- Automated validation through **119 passing tests**, deterministic offline evaluation and real knowledge-base evaluation harnesses
- GitHub Actions continuous integration

**Stack:** `Python` `LangGraph` `LangChain` `ChromaDB` `FastEmbed` `PyMuPDF` `Groq` `Gemini` `Streamlit` `pytest`

---

## 3. SifraAI — Deployed Voice-Enabled AI Assistant Platform

[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/tusharg007/SifraAI)
[![Live App](https://img.shields.io/badge/Live-Open%20Application-16A34A?style=flat-square&logo=render)](https://sifraai.onrender.com)

A deployed platform that allows businesses to configure, personalize and embed branded voice-enabled AI assistants on third-party websites.

**Engineering highlights**

- React dashboard and Node.js/Express APIs with MongoDB persistence
- Lightweight embeddable JavaScript widget
- Browser speech recognition and speech synthesis through the Web Speech API
- Gemini responses grounded in saved business context
- Deterministic website-navigation routing before LLM invocation
- Firebase Google authentication, JWT-protected routes, usage limits and Razorpay payments
- Independently deployed frontend and backend services on Render

**Stack:** `React` `JavaScript` `Node.js` `Express` `MongoDB` `Gemini` `Firebase` `Web Speech API` `Razorpay` `Render`

---

# Selected AI and Data Science Systems

| Project | What it demonstrates | Evidence |
|---|---|---|
| [Financial Document Intelligence](https://github.com/tusharg007/financial-document-intelligence-rag) | Hybrid RAG over SEC 10-K and 10-Q filings using dense retrieval, BM25, reciprocal-rank fusion, metadata filtering and cross-encoder reranking | Current curated evaluation reports **92.6% citation coverage** and **100% SEC source-URL coverage** |
| [RideIQ NYC Demand Forecasting](https://github.com/tusharg007/rideiq-nyc-demand-forecasting) | Leakage-safe demand forecasting, fleet-allocation simulation and route clustering over NYC TLC data | **9.55M trips**, WAPE reduced from **21.3% to 18.2%**, and **15,741 fewer unmet pickups** in simulation |
| [AI Platform Reliability Copilot](https://github.com/tusharg007/ai-platform-reliability-copilot) | Runbook retrieval, service-log analysis, anomaly detection and structured incident intelligence | FastAPI, Streamlit, rolling baselines, optional Isolation Forest, Docker and GitHub Actions |

> The Reliability Copilot uses synthetic service logs and metrics and is presented as a portfolio engineering system, not a production monitoring deployment.

---

# Technical Toolkit

| Area | Technologies |
|---|---|
| **Agentic AI and GenAI** | LangGraph, LangChain, LLMs, RAG, tool calling, multi-agent workflows, prompt engineering, grounding, evaluation, guardrails, embeddings, hybrid retrieval, reranking |
| **Backend and AI Products** | Python, JavaScript, FastAPI, Node.js, Express, React, REST APIs, Pydantic, SQLAlchemy, asynchronous workflows, webhooks |
| **Data and Infrastructure** | MongoDB, PostgreSQL, Redis, SQLite, ChromaDB, Qdrant, Docker, GitHub Actions, AWS S3, Render |
| **Data Science and ML** | SQL, Pandas, NumPy, scikit-learn, forecasting, anomaly detection, classification, clustering, feature engineering, model evaluation |
| **AI Providers and Models** | Groq, Gemini, Llama, OpenRouter, Sentence Transformers, BM25, cross-encoders |

---

# About Me

I am a B.Tech CSE student at the Indian Institute of Information Technology, Nagpur, specializing in Data Science and Analytics and graduating in 2027.

My work focuses on building dependable AI systems—from LangGraph agents and evidence-grounded RAG pipelines to deployed full-stack AI products and evaluated machine-learning workflows. I enjoy working across experimentation, backend engineering, evaluation and product delivery.

I am currently seeking a six-month internship where I can contribute to:

- AI Engineering
- Agentic AI and LLM systems
- Applied AI and GenAI products
- Data Science and Machine Learning

---

## GitHub Activity

<p align="center">
  <img
    src="https://github-readme-activity-graph.vercel.app/graph?username=tusharg007&theme=github-compact&hide_border=true&area=true"
    width="100%"
    alt="Tushar Ghosh GitHub contribution activity"
  />
</p>

<p align="center">
  <img
    src="https://komarev.com/ghpvc/?username=tusharg007&label=Profile%20Views&color=0e75b6&style=flat"
    alt="GitHub profile views"
  />
</p>

---

## Contact

- **Email:** [tg304429@gmail.com](mailto:tg304429@gmail.com)
- **Portfolio:** [tushar-portfolio-taupe.vercel.app](https://tushar-portfolio-taupe.vercel.app)
- **LinkedIn:** [linkedin.com/in/tushar-ghosh-a3355124a](https://linkedin.com/in/tushar-ghosh-a3355124a/)
- **GitHub:** [github.com/tusharg007](https://github.com/tusharg007)
