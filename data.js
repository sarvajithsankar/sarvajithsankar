/**
 * Sarvajith Sankar — Portfolio Configuration & Data Store
 * All portfolio content is centralized here for easy editing and maintenance.
 * No build step required — loaded dynamically via vanilla JS.
 */

const PORTFOLIO_DATA = {
  profile: {
    name: "Sarvajith Sankar",
    title: "AI Engineer & ML Systems Developer",
    tagline: "I build AI systems that actually do things.",
    subtitle: "CS student @ VIT Vellore | LLMs · Agents · Backend",
    bio: [
      "I am a Computer Science student at VIT Vellore (pursuing a dual-degree B.S. in Data Science at IIT Madras) specializing in AI engineering and backend systems.",
      "My technical work centers on LLM orchestration, stateful agent memory architectures, Model Context Protocol (MCP) tooling, and defensive AI security middleware.",
      "Currently building autonomous multi-agent research architectures at Maveric Systems, with an uncompromised focus on reliable, deterministic systems that do actual work in production."
    ],
    avatarUrl: "./avatar.jpg",
    roles: [
      "AI Engineer",
      "ML Researcher",
      "Backend Dev",
      "Agent Architect"
    ],
    statusBadge: {
      text: "Currently building AI agents @ Maveric Systems",
      live: true
    },
    location: "Vellore / Chennai / Bengaluru, India",
    targetRoles: "AI Engineering / ML Engineering / SWE Internships",
    preferredLocation: "Bengaluru preferred (Open to Remote / Hybrid)",
    links: {
      email: "sarvajith2knot8@gmail.com",
      github: "https://github.com/sarvajithsankar",
      linkedin: "https://linkedin.com/in/sarvajithsankar",
      resume: "[PLACEHOLDER - Resume.pdf]"
    }
  },

  // 1. Currently Building (Active Focus Card)
  currentlyBuilding: {
    title: "Autonomous AI Research Agent",
    organization: "Maveric Systems Limited",
    role: "AI Engineering Intern",
    location: "Chennai, India",
    period: "Jun 2026 – Present",
    valueProp: "Multi-agent research architecture automating deep technical and financial intelligence synthesis.",
    description: "Architecting a context-aware research pipeline that leverages multi-source RAG, query decomposition, and stateful agent memory loops. Implements persistent checkpointing and custom MCP tools to eliminate hallucination in complex domain reports.",
    stack: ["LangGraph", "MCP", "Persistent Memory", "Multi-Agent Workflows", "Python", "FastAPI"],
    milestone: {
      label: "Architecture & Tool Routing Phase",
      progressPercent: 75,
      statusNote: "Multi-node state graph active; benchmarking tool selection latency"
    }
  },

  // 2. Featured Projects (Exactly 3 product-style cards)
  featuredProjects: [
    {
      id: "tenet-ai",
      title: "TENET-AI",
      category: "AI Security Middleware",
      contextBadge: "SSoC Season 5",
      valueProp: "Defensive security middleware protecting LLM endpoints from prompt injection and adversarial jailbreaks.",
      description: "Engineered real-time semantic input validation, token-level sanitizer hooks, and adversarial heuristic scanning to intercept injection payloads before they reach generative agent execution pipelines.",
      capabilities: [
        "Real-time heuristic & semantic prompt jailbreak interception",
        "Token-level sanitizer middleware for OpenAI/Claude/Gemini APIs",
        "Deterministic rule-based + embedding-based hybrid threat scanning"
      ],
      stack: ["Python", "LLM Security", "Middleware", "Regex", "FastAPI"],
      githubUrl: "https://github.com/sarvajithsankar/TENET-AI",
      demoUrl: "[PLACEHOLDER - Live Demo in Progress]",
      metrics: "[ADD REAL DATA: Latency overhead / % attack block rate]"
    },
    {
      id: "vit-smart-assistant",
      title: "VIT Smart Assistant",
      category: "Document Intelligence RAG",
      contextBadge: "Campus AI Initiative",
      valueProp: "Semantically-grounded document intelligence and question-answering assistant for institutional knowledge bases.",
      description: "Integrated the Gemini API with ChromaDB vector store and an interactive Streamlit UI, enabling accurate document chunk retrieval, verified inline citations, and context-aware query resolution.",
      capabilities: [
        "Dense vector similarity search with ChromaDB embedding collections",
        "Automated PDF & tabular document parsing with verified source citations",
        "Conversational memory retention across multi-turn user dialogues"
      ],
      stack: ["Python", "Gemini API", "ChromaDB", "Streamlit", "RAG"],
      githubUrl: "https://github.com/sarvajithsankar/RAG-Assistant",
      demoUrl: "[PLACEHOLDER - Streamlit Cloud App]",
      metrics: "[ADD REAL DATA: Document corpus size / query response time]"
    },
    {
      id: "schema-matching",
      title: "Semantic Schema Matching",
      category: "Federated Database Research",
      contextBadge: "Database Systems Research",
      valueProp: "Dense neural column-matching engine to automate schema alignment across heterogeneous databases.",
      description: "Utilized sentence transformer embeddings and semantic similarity metrics to map column semantics rather than raw string names, resolving synonyms and homonyms across federated database layers.",
      capabilities: [
        "Bi-encoder neural representations for column metadata & sample values",
        "Cosine similarity thresholding to align virtual schema partitions",
        "Bypasses manual mapping rules in federated data integration pipelines"
      ],
      stack: ["Python", "PyTorch", "Transformers", "SQL", "Embeddings"],
      githubUrl: "https://github.com/sarvajithsankar/schema-matching",
      demoUrl: "[PLACEHOLDER - Research Notebook & API]",
      metrics: "[ADD REAL DATA: Column alignment accuracy % / schema count]"
    }
  ],

  // 3. Interactive Architecture (System Flow Diagram Nodes)
  architectureFlow: {
    headline: "Interactive Agent Architecture",
    subheadline: "Click or hover any node to inspect systems-level execution dynamics in autonomous AI workflows.",
    nodes: [
      {
        id: "user",
        step: "01",
        label: "User / Client",
        sub: "Prompt & Task Input",
        icon: "user",
        summary: "Initiates natural language queries, multi-turn dialogue, or automated event-driven triggers.",
        details: "Provides raw task objectives, domain documents, or multimodal constraints via REST API or interactive UI interface.",
        inputs: "Natural language query, session ID, user credentials",
        outputs: "Raw task payload, payload metadata"
      },
      {
        id: "agent",
        step: "02",
        label: "AI Agent Core",
        sub: "LLM Reasoning Engine",
        icon: "cpu",
        summary: "Main reasoning kernel running iterative ReAct loops and task decomposition.",
        details: "Analyzes prompt intent, evaluates safety boundaries, consults system instructions, and formulates step-by-step execution strategies.",
        inputs: "Task payload, conversation history, system prompt",
        outputs: "Chain-of-thought steps, tool invocation proposals"
      },
      {
        id: "orchestrator",
        step: "03",
        label: "Planner / Memory / Router",
        sub: "LangGraph State Machine",
        icon: "git-branch",
        summary: "Stateful orchestration layer managing short/long-term memory and conditional tool routing.",
        details: "Maintains graph state across turns, queries semantic vector stores for episodic recall, and deterministically routes sub-tasks to specialized handlers.",
        inputs: "Proposed plan, persistent state graph, vector embeddings",
        outputs: "Dispatched MCP tool calls, updated state checkpoint"
      },
      {
        id: "tools",
        step: "04",
        label: "MCP Tools & Backends",
        sub: "Model Context Protocol",
        icon: "tool",
        summary: "Standardized tools executing verified external actions, API queries, and computation.",
        details: "Executes database lookups, code sandbox interpreters, live web search, and internal enterprise services under strict permission controls.",
        inputs: "Structured tool parameters, API auth tokens",
        outputs: "Raw JSON execution payloads, error codes, search chunks"
      },
      {
        id: "result",
        step: "05",
        label: "Synthesized Output",
        sub: "Verified Response",
        icon: "check-circle",
        summary: "Final response synthesized with citation grounding and safety compliance checks.",
        details: "Grounds tool outputs back into fluent natural language, attaches traceable source references, and passes output security filters before client delivery.",
        inputs: "Aggregated tool results, citation map, security policies",
        outputs: "Production-ready response with verified citations"
      }
    ]
  },

  // 4. AI Lab (Experiments & Benchmarks)
  aiLab: [
    {
      id: "rag-vs-finetuning",
      title: "RAG vs Fine-Tuning Benchmarks",
      tag: "Domain Adaptation",
      summary: "Empirical evaluation comparing retrieval-augmented generation against domain fine-tuned checkpoints for dynamic knowledge bases.",
      finding: "RAG achieved near-zero hallucination on rapidly mutating datasets at a fraction of training compute; fine-tuning remained superior for enforcing rigid syntactic schema formats.",
      metricsNote: "Benchmarking latency vs hallucination rate [ADD REAL DATA]",
      metrics: [
        { label: "Grounding Accuracy", val: "[ADD %]" },
        { label: "Update Latency", val: "< 100ms (Vector Upsert)" },
        { label: "Token Efficiency", val: "[ADD DATA]" }
      ]
    },
    {
      id: "prompt-injection-defense",
      title: "Prompt Injection & Jailbreak Defense",
      tag: "LLM Security",
      summary: "Designing multi-layered middleware to intercept direct, indirect, and payload-splitting prompt injection attacks before agent tool execution.",
      finding: "Dual-stage verification (regex token filter + semantic distance thresholding) filtered malicious system override attempts with sub-20ms latency impact.",
      metricsNote: "SSoC S5 TENET-AI research baseline [ADD REAL DATA]",
      metrics: [
        { label: "Attack Interception", val: "[ADD %]" },
        { label: "Middleware Latency", val: "[ADD <20ms]" },
        { label: "False Positive Rate", val: "[ADD <1%]" }
      ]
    },
    {
      id: "agent-memory-architectures",
      title: "Hierarchical Agent Memory Architecture",
      tag: "Autonomous Agents",
      summary: "Investigating sliding-window short-term buffer + ChromaDB episodic memory indexing for long-running autonomous research agents.",
      finding: "Semantic vector recall combined with dynamic token budget trimming prevented context window overflow across 50+ continuous reasoning cycles.",
      metricsNote: "Tested on Maveric Systems research workflows [ADD REAL DATA]",
      metrics: [
        { label: "Max Conversation Turns", val: "50+ Cycles" },
        { label: "Context Retention", val: "[ADD %]" },
        { label: "Memory Retrieval P95", val: "[ADD ms]" }
      ]
    }
  ],

  // 5. Engineering Stack (Grouped by capability)
  stackGroups: [
    {
      category: "AI Engineering & Orchestration",
      description: "Frameworks, agent orchestration tools, and LLM reasoning pipelines.",
      skills: [
        { name: "LangGraph", level: "Primary" },
        { name: "LangChain", level: "Primary" },
        { name: "Model Context Protocol (MCP)", level: "Primary" },
        { name: "LLM APIs (Gemini, Claude, OpenAI)", level: "Primary" },
        { name: "Python", level: "Core" },
        { name: "ChromaDB / Vector Search", level: "Core" },
        { name: "PyTorch & Transformers", level: "Core" },
        { name: "RAG Architectures", level: "Core" }
      ]
    },
    {
      category: "Backend & Systems",
      description: "High-performance APIs, database schemas, and microservice infrastructure.",
      skills: [
        { name: "FastAPI", level: "Core" },
        { name: "PostgreSQL", level: "Core" },
        { name: "REST API Design", level: "Core" },
        { name: "System Architecture", level: "Core" },
        { name: "SQL & Relational Modeling", level: "Core" },
        { name: "Authentication & Security", level: "Intermediate" }
      ]
    },
    {
      category: "Dev Tools & Foundations",
      description: "Core computer science fundamentals, developer workflows, and toolchains.",
      skills: [
        { name: "Java & DSA", level: "Core" },
        { name: "Git & GitHub Actions", level: "Core" },
        { name: "Docker", level: "Intermediate" },
        { name: "Flutter", level: "Intermediate" },
        { name: "Linux / Shell Scripting", level: "Core" },
        { name: "C / C++ (Foundations)", level: "Academic" }
      ]
    }
  ],

  // 6. Proof of Work (Compact Metrics Row — strictly real numbers or [ADD])
  proofOfWork: [
    {
      metric: "[ADD]",
      label: "GitHub Repositories",
      note: "Public code & prototypes"
    },
    {
      metric: "[ADD]",
      label: "LeetCode Problems",
      note: "DSA & algorithmic problem solving"
    },
    {
      metric: "SSoC S5",
      label: "Open Source Contributor",
      note: "Social Summer of Code Season 5"
    },
    {
      metric: "6 Verified",
      label: "Certifications",
      note: "Cisco, Google Cloud, Forage, Kaggle"
    }
  ],

  // Certifications list for reference
  certifications: [
    {
      title: "Mastercard Cybersecurity Job Simulation",
      issuer: "Forage",
      date: "May 2026",
      desc: "Security posture auditing, threat analysis, and incident response planning."
    },
    {
      title: "Introduction to Cybersecurity",
      issuer: "Cisco Networking Academy",
      date: "Apr 2026",
      desc: "Network defense architecture, cryptography principles, and systems hardening."
    },
    {
      title: "Open Source Contributor — TENET-AI",
      issuer: "SSoC Season 5",
      date: "2026",
      desc: "Defensive LLM security middleware contributions and sanitizer modules."
    },
    {
      title: "Pandas Data Analysis Certification",
      issuer: "Kaggle",
      date: "2026",
      desc: "Data processing pipelines, matrix manipulation, indexing, and feature engineering."
    },
    {
      title: "Google Cloud Foundations",
      issuer: "Google Cloud",
      date: "2026",
      desc: "GCP infrastructure: IAM, Compute Engine, BigQuery, and networking topologies."
    },
    {
      title: "Cloud Architecture & Network Simulation",
      issuer: "Verizon / Forage",
      date: "2026",
      desc: "Enterprise cloud migration strategies and resilient network configurations."
    }
  ],

  // 7. Learning Timeline
  learningTimeline: [
    {
      year: "2025",
      title: "Core Foundations & Systems",
      bullets: [
        "Java, Data Structures & Algorithms, Object-Oriented Design at VIT Vellore",
        "Foundational Data Science, statistics, and mathematics at IIT Madras",
        "Web development fundamentals and responsive UI architecture"
      ]
    },
    {
      year: "2026",
      title: "AI Engineering, LLMs & Agent Architectures",
      bullets: [
        "Advanced Python, FastAPI, and asynchronous backend development",
        "LangChain, LangGraph state machines, and multi-agent workflow orchestration",
        "Building TENET-AI (SSoC S5) for defensive LLM prompt injection protection",
        "AI Engineering Intern @ Maveric Systems: Autonomous research agent development"
      ]
    },
    {
      year: "Future / Next Focus",
      title: "[Next Focus: Distributed Inference & Low-Latency Agents]",
      bullets: [
        "Distributed LLM serving pipelines and Triton Inference Server optimization",
        "High-throughput asynchronous Model Context Protocol (MCP) agent clusters",
        "Multi-modal agentic workflows combining vision, audio, and deterministic tooling"
      ]
    }
  ]
};

// Make available in browser global scope and Node.js
if (typeof window !== "undefined") {
  window.PORTFOLIO_DATA = PORTFOLIO_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = PORTFOLIO_DATA;
}
