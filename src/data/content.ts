// All CV content lives here. Edit this file to update the portfolio.

export const PROFILE = {
  name: "Kerem Özdoğan",
  firstName: "Kerem",
  title: "Computer Engineer · Full-Stack Developer",
  stack: "React · Next.js · TypeScript · .NET 8",
  location: "Istanbul, Turkey · UTC+3",
  email: "keremozdogannn@gmail.com",
  site: "keremozdogan.com",
  github: "https://github.com/keremozdogan",
  githubLabel: "github.com/keremozdogan",
  linkedin: "https://www.linkedin.com/in/keremozdogan",
  linkedinLabel: "linkedin.com/in/keremozdogan",
  summary:
    "Computer Engineer (B.Sc., 2025) and co-founder / full-stack developer of dData, a multi-tenant SaaS ERP for Turkish SMBs. Builds production React/Next.js frontends and .NET 8 backends end to end. Has shipped ERP modules, a mobile app and freelance web & desktop products for paying customers, and completed three software internships.",
  funFacts: [
    "Ships features faster than he closes browser tabs.",
    "Main stat: coffee → code conversion rate.",
    "Has never met a legacy form he couldn't modernize.",
    "Believes every bug is just an undocumented feature until proven otherwise.",
  ],
};

export type Experience = {
  id: string;
  level: string; // e.g. "WORLD 2-1"
  role: string;
  company: string;
  companyUrl?: string;
  period: string;
  type: "job" | "internship" | "freelance" | "founder";
  bullets: string[];
  tags: string[];
  xp: string; // joke line
};

// Chronological — this is the order you meet them in the level.
export const EXPERIENCE: Experience[] = [
  {
    id: "exp-dsmart",
    level: "WORLD 2-1",
    role: "Software Developer Intern",
    company: "D-Smart",
    period: "Jul – Aug 2024",
    type: "internship",
    bullets: [
      "Software internship at Turkey's satellite TV and streaming platform; supported the development team with coding, testing and bug-fix tasks.",
      "Gained experience with corporate development workflows: version control, code review and ticket-based work.",
    ],
    tags: ["Git", "Code Review", "Testing", "Tickets"],
    xp: "+250 XP · Unlocked: 'Survived first code review'",
  },
  {
    id: "exp-ddata",
    level: "WORLD 2-2",
    role: "Co-Founder & Full-Stack Developer",
    company: "dData",
    companyUrl: "https://ddata.dev",
    period: "Apr 2025 – Present",
    type: "founder",
    bullets: [
      "Co-founded a multi-tenant SaaS ERP platform for Turkish SMBs and corporate customers; core team of four.",
      "Full-stack ownership across the inventory, accounting, HR, CRM and production-planning modules: React/TypeScript frontend and .NET 8 / C# backend.",
      "Design and build REST APIs, the PostgreSQL data layer and the frontend screens end to end; hands-on in every part of the product.",
      "Product highlights: AI receipt scanning (Gemini Vision), in-app AI assistant, TDHP-compliant double-entry accounting, e-invoice integration (NES Bilgi), mobile app on App Store and Google Play.",
    ],
    tags: [".NET 8", "React", "TypeScript", "PostgreSQL", "Docker", "RabbitMQ", "Redis", "Ocelot"],
    xp: "+5000 XP · Boss unlocked: 'Double-entry accounting'",
  },
  {
    id: "exp-rigosis",
    level: "WORLD 2-3",
    role: "Software & Hardware Intern",
    company: "Rigosis Bilgi Sistemleri",
    period: "Jul – Aug 2025",
    type: "internship",
    bullets: [
      "Worked across hardware and software at an IT consulting and managed-services company (monitoring, automation, cybersecurity and DevOps solutions).",
      "Supported system and infrastructure setup on the hardware side and development tasks on the software side.",
    ],
    tags: ["DevOps", "Monitoring", "Automation", "Infra"],
    xp: "+400 XP · Item found: 'Crimping tool'",
  },
  {
    id: "exp-freelance",
    level: "WORLD 2-4",
    role: "Freelance Web & Desktop Developer",
    company: "Self-employed",
    period: "2025 – Present",
    type: "freelance",
    bullets: [
      "Delivered 5 business websites and a cosmetics e-commerce site (React + .NET) for clients.",
      "Built a desktop salon management app for hairdressers (React + .NET): appointment scheduling, customer tracking, transaction summaries.",
    ],
    tags: ["React", ".NET", "E-commerce", "Desktop", "Clients"],
    xp: "+1200 XP · Skill learned: 'Invoice sending'",
  },
  {
    id: "exp-sezinsoft",
    level: "WORLD 2-5",
    role: "Software Developer Intern",
    company: "SezinSoft",
    period: "Oct – Dec 2025",
    type: "internship",
    bullets: [
      "Developed features and fixes for Logitera, SezinSoft's supply-chain ERP (stock, sales/CRM and transportation modules), in C# / .NET.",
      "Worked in a live, customer-facing ERP codebase with the core team on day-to-day development tasks.",
    ],
    tags: ["C#", ".NET", "ERP", "Supply Chain"],
    xp: "+800 XP · Achievement: 'Touched production without breaking it'",
  },
];

export type Skill = {
  id: string;
  name: string;
  group: "Frontend" | "Backend" | "Tools";
  level: number; // 0-100
  rarity: "LEGENDARY" | "EPIC" | "RARE" | "COMMON";
  quip: string;
};

export const SKILLS: Skill[] = [
  { id: "react", name: "React", group: "Frontend", level: 95, rarity: "LEGENDARY", quip: "Hooks, no strings attached." },
  { id: "nextjs", name: "Next.js", group: "Frontend", level: 90, rarity: "LEGENDARY", quip: "Server components? Already there." },
  { id: "typescript", name: "TypeScript", group: "Frontend", level: 92, rarity: "LEGENDARY", quip: "`any` is a four-letter word." },
  { id: "javascript", name: "JavaScript", group: "Frontend", level: 90, rarity: "EPIC", quip: "== never, === always." },
  { id: "htmlcss", name: "HTML / CSS", group: "Frontend", level: 88, rarity: "EPIC", quip: "Centers divs on the first try." },
  { id: "csharp", name: "C#", group: "Backend", level: 78, rarity: "EPIC", quip: "LINQ is love." },
  { id: "dotnet", name: ".NET 8", group: "Backend", level: 78, rarity: "EPIC", quip: "Minimal APIs, maximal output." },
  { id: "efcore", name: "EF Core", group: "Backend", level: 72, rarity: "RARE", quip: "Migrations: add, update, pray." },
  { id: "rest", name: "REST APIs", group: "Backend", level: 80, rarity: "EPIC", quip: "Returns 200 OK, means it." },
  { id: "postgres", name: "PostgreSQL", group: "Backend", level: 74, rarity: "RARE", quip: "Indexes everything. Even feelings." },
  { id: "git", name: "Git", group: "Tools", level: 85, rarity: "EPIC", quip: "Rebases with confidence." },
  { id: "docker", name: "Docker", group: "Tools", level: 72, rarity: "RARE", quip: "Works on my machine — and yours." },
  { id: "rider", name: "JetBrains Rider", group: "Tools", level: 82, rarity: "RARE", quip: "Refactor → Rename → Repeat." },
];

export type Project = {
  id: string;
  name: string;
  short: string;
  description: string;
  stack: string[];
  url?: string;
  urlLabel?: string;
  status: "LIVE" | "SHIPPED" | "IN DEV";
  container: string; // docker-style container name shown on the door
};

export const PROJECTS: Project[] = [
  {
    id: "proj-ddata",
    name: "dData ERP",
    short: "Multi-tenant SaaS ERP for Turkish SMBs",
    description:
      "Multi-tenant SaaS ERP with inventory, accounting, HR, CRM and production-planning modules. AI receipt scanning (Gemini Vision), in-app AI assistant, TDHP-compliant double-entry accounting, e-invoice integration and a mobile app on App Store & Google Play.",
    stack: ["React", "TypeScript", ".NET 8", "PostgreSQL", "Docker", "RabbitMQ", "Redis"],
    url: "https://ddata.dev",
    urlLabel: "ddata.dev",
    status: "LIVE",
    container: "ddata-erp",
  },
  {
    id: "proj-salon",
    name: "Salon Management Desktop App",
    short: "Appointments, customers, daily totals — for hairdressers",
    description:
      "Desktop application for hair salons: appointment scheduling, customer tracking and transaction summaries. Built for a real salon that uses it every day.",
    stack: ["React", ".NET", "Desktop"],
    status: "SHIPPED",
    container: "salon-app",
  },
  {
    id: "proj-cosmetics",
    name: "Cosmetics E-commerce",
    short: "Catalog, cart and checkout for a client",
    description:
      "E-commerce website for a cosmetics brand: product catalog, cart and checkout flow, delivered end to end for a paying client.",
    stack: ["React", ".NET", "REST API"],
    status: "SHIPPED",
    container: "shop-cosmetics",
  },
  {
    id: "proj-sites",
    name: "Business Websites ×5",
    short: "Responsive sites for small-business clients",
    description:
      "Five responsive business websites for small-business clients — design to deployment, with SEO basics and contact flows.",
    stack: ["React", "Next.js", "HTML/CSS"],
    status: "SHIPPED",
    container: "client-sites",
  },
];

export const EDUCATION = {
  degree: "B.Sc. Computer Engineering (English-medium)",
  school: "Üsküdar University, Istanbul",
  period: "Graduated Sep 2025",
  quip: "Final boss defeated: Graduation Project.",
};

export const LANGUAGES = [
  { name: "Turkish", level: "Native", bar: 100 },
  { name: "English", level: "Intermediate (B1) · degree completed in English", bar: 65 },
];

export const CONTROLS = [
  { keys: "← → / A D", action: "Move" },
  { keys: "SPACE / ↑ / W", action: "Jump" },
  { keys: "X / SHIFT / F", action: "Throw code" },
  { keys: "ENTER / E", action: "Read sign · open door" },
  { keys: "ESC / P", action: "Pause" },
  { keys: "M", action: "Mute" },
];

export const WORLD_NAMES = ["START", "EXPERIENCE", "SKILLS", "PROJECTS", "EDUCATION", "DEPLOY"];
