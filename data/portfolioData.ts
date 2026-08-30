export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'ai' | 'fullstack' | 'utility';
  description: string;
  longDescription: string;
  highlights: string[];
  tags: string[];
  techStack: string[];
  demoUrl?: string;
  githubUrl?: string;
  status: string;
  featured: boolean;
  participation?: string;
  stats?: { label: string; value: string }[];
}

export interface SkillCategory {
  title: string;
  icon: string;
  description: string;
  skills: { name: string; level: number; highlight?: boolean; tag: string }[];
}

export interface Milestone {
  year: string;
  period: string;
  title: string;
  organization: string;
  badge: string;
  badgeColor: 'emerald' | 'cyan' | 'purple' | 'amber';
  description: string;
  bullets: string[];
  skills: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  highlight: boolean;
  skillsCovered: string[];
}

export const PORTFOLIO_DATA = {
  personal: {
    name: "Piyush Singh",
    headline: "Aspiring AI/ML Engineer & Full-Stack Developer",
    tagline: "Building intelligent AI agent workflows, high-performance web applications, and privacy-first browser utilities.",
    location: "Sikandrabad / Greater Noida, UP, India",
    email: "th.piyushsingh2007@gmail.com",
    phone: "+91 95577 40764",
    linkedin: "https://linkedin.com/in/piyush-singh2007",
    linkedinHandle: "piyush-singh2007",
    github: "https://github.com/Piyush-Thakur7",
    githubHandle: "Piyush-Thakur7",
    availability: "Open to AI/ML & Software Engineering Internships",
    ambassadorBadge: "Google Student Ambassador 2026",
    summary: "BCA AI/ML student at GL Bajaj Institute of Technology & Management with hands-on experience building full-stack platforms, autonomous AI agent pipelines (Hermes, RAG, Google Cloud Run), and client-side conversion utilities. Participated and presented MVP at MSME Idea Hackathon 6.0."
  },

  stats: [
    { label: "Live Web Apps", value: "3+" },
    { label: "Google Ambassador", value: "2026" },
    { label: "Gen AI Academy", value: "APAC Cohort 3" },
    { label: "Client-Side Processing", value: "100% Offline" },
  ],

  projects: [
    {
      id: "servemate",
      title: "ServeMATE (Resence)",
      subtitle: "Gamified NGO-Donor Transparency Platform & MVP",
      category: "fullstack",
      featured: true,
      participation: "Presented at MSME Idea Hackathon 6.0 (GLBCRI)",
      status: "Student MVP / Prototype",
      description: "Gamified social impact platform connecting individual donors with verified NGOs through donation transparency, XP rewards, badges, and donor leaderboards.",
      longDescription: "ServeMATE bridges trust gaps between donors and charities. Built around donation transparency, it enables real-time progress tracking, verified NGO onboarding, donor gamification (XP points, achievement badges, leaderboards), and integrated Razorpay test payment processing.",
      highlights: [
        "Architected NGO onboarding workflows, user authentication, and interactive donation-tracking mechanics.",
        "Engineered gamification system (XP points, achievement badges, and donor leaderboards) to boost repeat contributions.",
        "Implemented JWT-based authentication and Razorpay test payment processing integration.",
        "Built MongoDB Atlas cloud backend and deployed application on Vercel and Render.",
        "Participated and presented ServeMATE under the 'Other Frontier Technologies' track at MSME Idea Hackathon 6.0 via GL Bajaj Centre for Research and Incubation (GLBCRI)."
      ],
      tags: ["Full-Stack", "Gamification", "FinTech", "Social Impact", "Hackathon MVP"],
      techStack: ["Next.js", "React", "Node.js", "MongoDB Atlas", "JWT Auth", "Razorpay API", "Tailwind CSS", "Vercel"],
      demoUrl: "https://resence.in",
      githubUrl: "https://github.com/Piyush-Thakur7",
      stats: [
        { label: "Track", value: "Frontier Tech" },
        { label: "Security", value: "JWT + Razorpay" },
        { label: "Database", value: "MongoDB Atlas" }
      ]
    },
    {
      id: "anytime-converter",
      title: "AnytimeConverter",
      subtitle: "100% Private Offline Multi-Format File Converter",
      category: "utility",
      featured: true,
      status: "Live in Production",
      description: "High-performance client-side file conversion suite running 100% offline in the browser. Zero cloud uploads, zero size caps, and complete data privacy.",
      longDescription: "AnytimeConverter delivers a private suite of document and image tools executed directly in WebAssembly and client-side JavaScript memory buffers. Files never touch a remote server, eliminating privacy risks and latency.",
      highlights: [
        "Built 8+ file processing pipelines: JPG to PDF, PDF to JPG, Merge, Split, Word to PDF, and Tesseract.js OCR text extraction.",
        "Engineered 100% client-side memory processing for instant conversion speeds with zero server costs.",
        "Integrated client-side OCR extraction with zero latency using local WebAssembly workers.",
        "Designed clean glassmorphic drag-and-drop file uploader with responsive progress meters."
      ],
      tags: ["WebAssembly", "PDF Manipulation", "OCR", "Offline-First", "Privacy-Focused"],
      techStack: ["Next.js 16", "React 19", "TypeScript", "pdf-lib", "Tesseract OCR", "Tailwind CSS v4", "mammoth", "pptxgenjs"],
      demoUrl: "https://anytimeconverter.resence.in",
      githubUrl: "https://github.com/Piyush-Thakur7",
      stats: [
        { label: "Privacy", value: "100% Client-Side" },
        { label: "Pipelines", value: "8+ File Tools" },
        { label: "Speed", value: "< 1.5s Offline" }
      ]
    },
    {
      id: "fitness-platform",
      title: "Fitness Platform",
      subtitle: "AI-Assisted Full-Stack Health & Workout Suite",
      category: "fullstack",
      featured: true,
      status: "Live in Production",
      description: "Modern full-stack fitness web application featuring intelligent workout routines, caloric analytics, and responsive tracking.",
      longDescription: "Fitness Platform provides structured workout logs, caloric balance calculators, exercise analytics, and dynamic scheduling. Built end-to-end utilizing AI-assisted rapid development workflows and deployed on edge infrastructure.",
      highlights: [
        "Designed and deployed complete responsive web application with structured fitness workflows.",
        "Leveraged modern agentic engineering and AI-assisted programming to achieve rapid production deployment.",
        "Integrated dynamic interactive workout logs, progress analytics, and responsive mobile-first UI."
      ],
      tags: ["Full-Stack", "AI-Assisted", "Health Tech", "Cloud Hosted"],
      techStack: ["React", "Next.js", "Tailwind CSS", "Vercel", "TypeScript", "REST APIs"],
      demoUrl: "https://fitness.resence.in",
      githubUrl: "https://github.com/Piyush-Thakur7",
      stats: [
        { label: "UI", value: "Mobile-First" },
        { label: "Deployment", value: "Vercel Edge" },
        { label: "Status", value: "Active Live" }
      ]
    },
    {
      id: "ai-assistant-suite",
      title: "AI Voice & Agent Automation Suite",
      subtitle: "Autonomous Local Voice AI & Multi-Model Engine",
      category: "ai",
      featured: false,
      status: "Experimental Engine",
      description: "Local speech-driven AI assistant suite powered by offline Vosk acoustic models, multi-model API gateways, and autonomous agent loops.",
      longDescription: "A developer-grade AI orchestration suite featuring offline speech recognition (Vosk small-en-us model), admin control panels, terminal chat CLI, and GUI chat clients capable of executing automated task workflows.",
      highlights: [
        "Implemented local voice transcription using Vosk offline speech recognition engine without external API reliance.",
        "Built modular Python suite including GUI chat, terminal chat interface, and administrative control panel.",
        "Experimented with agentic workflows (Hermes Agent, Google Cloud Run RAG microservices) for autonomous execution."
      ],
      tags: ["AI Agents", "Vosk Offline ASR", "Python", "Speech AI", "RAG"],
      techStack: ["Python 3", "Vosk ASR", "Google Cloud Run", "RAG", "Hermes Agent", "PyQt/Tkinter"],
      githubUrl: "https://github.com/Piyush-Thakur7",
      stats: [
        { label: "ASR", value: "Offline Vosk" },
        { label: "Architecture", value: "Agentic Loop" },
        { label: "Language", value: "Python 3.14" }
      ]
    }
  ] as Project[],

  skills: [
    {
      title: "AI, GenAI & Agentic Systems",
      icon: "Cpu",
      description: "Generative AI principles, autonomous agent workflows, and RAG architectures.",
      skills: [
        { name: "Generative AI & LLMs", level: 90, highlight: true, tag: "Core" },
        { name: "Prompt Engineering", level: 95, highlight: true, tag: "Advanced" },
        { name: "RAG & Knowledge Retrieval", level: 85, highlight: true, tag: "Applied" },
        { name: "AI Agent Workflows (Hermes)", level: 88, highlight: true, tag: "Agentic" },
        { name: "Google Cloud Run AI Deployments", level: 82, highlight: false, tag: "Cloud AI" },
        { name: "Vosk Offline Voice ASR", level: 80, highlight: false, tag: "Speech" }
      ]
    },
    {
      title: "Web & Frontend Engineering",
      icon: "Layout",
      description: "Responsive, high-velocity web apps and interactive glassmorphic UI systems.",
      skills: [
        { name: "Next.js 16 (App Router)", level: 92, highlight: true, tag: "Framework" },
        { name: "React 19", level: 90, highlight: true, tag: "Library" },
        { name: "TypeScript / JavaScript", level: 88, highlight: true, tag: "Language" },
        { name: "Tailwind CSS v4", level: 95, highlight: true, tag: "Styling" },
        { name: "HTML5 / Modern CSS", level: 95, highlight: false, tag: "Standard" },
        { name: "Three.js / WebGL Canvas", level: 80, highlight: false, tag: "3D Graphics" }
      ]
    },
    {
      title: "Backend, Databases & Security",
      icon: "Database",
      description: "API architecture, database schemas, authentication, and payment integrations.",
      skills: [
        { name: "Python", level: 85, highlight: true, tag: "Backend/ML" },
        { name: "C Programming", level: 80, highlight: false, tag: "Foundational" },
        { name: "MongoDB Atlas", level: 86, highlight: true, tag: "NoSQL" },
        { name: "SQL & Relational DBs", level: 80, highlight: false, tag: "Database" },
        { name: "JWT Auth & API Security", level: 88, highlight: true, tag: "Security" },
        { name: "Razorpay Gateway Integration", level: 85, highlight: false, tag: "FinTech" }
      ]
    },
    {
      title: "DevOps, Cloud & Tooling",
      icon: "Terminal",
      description: "Git workflows, CI/CD automation, and cloud hosting platforms.",
      skills: [
        { name: "Git & GitHub", level: 92, highlight: true, tag: "VCS" },
        { name: "Vercel & Render Hosting", level: 90, highlight: true, tag: "Deployment" },
        { name: "Google Cloud Platform", level: 82, highlight: false, tag: "Cloud" },
        { name: "AI-Assisted CI / Build Flows", level: 90, highlight: true, tag: "Productivity" },
        { name: "Linux & Terminal Workflows", level: 85, highlight: false, tag: "CLI" }
      ]
    }
  ] as SkillCategory[],

  milestones: [
    {
      year: "2026",
      period: "Present",
      title: "Google Student Ambassador 2026",
      organization: "Google Developer Communities",
      badge: "Community Leadership",
      badgeColor: "emerald",
      description: "Selected as an official Google Student Ambassador to champion developer technology, conduct peer learning sessions, and lead Google developer initiatives on campus.",
      bullets: [
        "Representing Google developer programs and modern cloud ecosystems across student communities.",
        "Facilitating hands-on workshops on Google Cloud, AI tooling, and open-source ecosystems."
      ],
      skills: ["Google Tech", "Developer Advocacy", "Campus Leadership", "Community Building"]
    },
    {
      year: "2026",
      period: "Current Cohort",
      title: "Gen AI Academy — APAC Edition (Cohort 3)",
      organization: "Google Cloud x Hack2Skill",
      badge: "Specialized AI Track",
      badgeColor: "cyan",
      description: "Selected for the intensive Google Cloud program focusing on building cutting-edge Generative AI applications and autonomous agents.",
      bullets: [
        "Hands-on development of autonomous AI agents and Retrieval-Augmented Generation (RAG) pipelines.",
        "Building and deploying scalable containerized AI services on Google Cloud Run."
      ],
      skills: ["Google Cloud Run", "RAG Architecture", "Autonomous Agents", "Vector Embeddings"]
    },
    {
      year: "2025 - 2026",
      period: "Hackathon Stage",
      title: "MSME Idea Hackathon 6.0 — Presentation",
      organization: "GL Bajaj Centre for Research & Incubation (GLBCRI)",
      badge: "Idea Pitch & Demo",
      badgeColor: "purple",
      description: "Participated and presented the ServeMATE prototype under the 'Other Frontier Technologies' track at MSME Idea Hackathon 6.0.",
      bullets: [
        "Presented PPT pitch and interactive MVP prototype demonstration to evaluation jury.",
        "Showcased gamified donor retention loops and verified NGO tracking architecture."
      ],
      skills: ["Hackathon Pitch", "Product Strategy", "Gamification", "System Demo"]
    },
    {
      year: "2024 - 2026",
      period: "Continuous",
      title: "Agentic & AI-Assisted Engineering",
      organization: "Personal Lab & Open Source",
      badge: "AI Automation",
      badgeColor: "amber",
      description: "Deep exploration of autonomous agent architectures, local speech models, and AI-accelerated full-stack development workflows.",
      bullets: [
        "Built and deployed multiple live production utilities with AI-accelerated workflows.",
        "Experimented with multi-agent orchestration frameworks (Hermes, Claude, Antigravity)."
      ],
      skills: ["Hermes Agent", "Local Vosk ASR", "Full-Stack Velocity", "Prompt Architecture"]
    }
  ] as Milestone[],

  education: [
    {
      degree: "Bachelor of Computer Applications (BCA)",
      specialization: "AI / ML Specialization (3rd Semester)",
      institution: "GL Bajaj Institute of Technology & Management, Greater Noida",
      affiliation: "Affiliated to Chaudhary Charan Singh University, Meerut",
      period: "2024 – Present",
      status: "In Progress (3rd Sem)",
      coursework: ["Data Structures & Algorithms", "Python Programming", "Machine Learning Concepts", "Database Management Systems", "Web Technologies"]
    },
    {
      degree: "Senior Secondary (Class XII)",
      specialization: "Physics, Chemistry, Biology (PCB)",
      institution: "CBSE Board",
      period: "Completed",
      score: "78.8%",
      coursework: ["Analytical Problem Solving", "Scientific Methodology", "Computer Fundamentals"]
    },
    {
      degree: "Secondary School Examination (Class X)",
      specialization: "General Science & Mathematics",
      institution: "CBSE Board",
      period: "Completed",
      score: "80.2%",
      coursework: ["Mathematics", "Science", "Information Technology"]
    }
  ],

  certifications: [
    {
      title: "Google AI Essentials Specialization",
      issuer: "Coursera (Google Career Certificates)",
      date: "2026",
      highlight: true,
      skillsCovered: ["Generative AI Principles", "AI Workplace Productivity", "Ethical AI", "Model Selection"]
    },
    {
      title: "Google Prompting Essentials Specialization",
      issuer: "Coursera (Google Career Certificates)",
      date: "2026",
      highlight: true,
      skillsCovered: ["Structured Prompting", "Few-Shot Engineering", "Persona & Context Modeling", "Chaining Tasks"]
    },
    {
      title: "Foundation Course on AI Readiness",
      issuer: "Indian Institute of Creative Technologies (IICT) & Govt. of India",
      date: "August 2026",
      highlight: true,
      skillsCovered: ["National AI Frameworks", "Emerging Tech Landscape", "Ministry of I&B Partnership", "Google & YouTube Collab"]
    }
  ] as Certification[]
};
