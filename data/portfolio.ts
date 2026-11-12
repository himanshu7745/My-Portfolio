/* ------------------------------------------------------------------
   All portfolio content lives here. Edit this file to update the site.
   ------------------------------------------------------------------ */

export type LinkItem = { label: string; url: string };

export type Project = {
  slug: string;
  name: string;
  kind: string;
  period: string;
  summary: string;
  points: string[];
  tech: string[];
  repo?: string;
  live?: LinkItem;
};

export type Job = {
  slug: string;
  role: string;
  org: string;
  period: string;
  mode: string;
  points: string[];
  tech: string[];
};

export const profile = {
  name: "Himanshu Mishra",
  firstName: "Himanshu",
  handle: "himanshu",
  role: "Software Developer",
  roleDetail: "Backend · Android · Competitive Programming",
  location: "Hoshiarpur, India",
  avatar: "/avatar.jpg",
  resume: "/Himanshu_Mishra_Resume.pdf",
  tagline: "I build software that keeps working when the network doesn't.",
  bio:
    "I like systems with sharp edges: backend APIs that move data reliably, Android apps that sync over plain Wi-Fi, " +
    "sandboxed code runners, and identity fixes merged into Keycloak. Most evenings I'm solving problems on Codeforces.",
  education: {
    degree: "B.E. in Information Technology",
    school: "UIET, Panjab University",
    years: "Aug 2023 – May 2027",
    cgpa: "8.48",
  },
  links: {
    github: { label: "himanshu7745", url: "https://github.com/himanshu7745" },
    linkedin: { label: "himanshu-mishra", url: "https://www.linkedin.com/in/himanshu-mishra-08b76228a" },
    email: { label: "mishrahimanshu0076@gmail.com", url: "mailto:mishrahimanshu0076@gmail.com" },
    phone: { label: "+91 95595 37785", url: "tel:+919559537785" },
    leetcode: { label: "Himanshu0076", url: "https://leetcode.com/u/Himanshu0076/" },
    codeforces: { label: "Himanshu0076", url: "https://codeforces.com/profile/Himanshu0076" },
  },
};

/** Usernames used by /api/* routes for live stats. */
export const handles = {
  github: "himanshu7745",
  leetcode: "Himanshu0076",
  codeforces: "Himanshu0076",
};

export const status: { open: boolean; rows: [string, string][] } = {
  open: true,
  rows: [
    ["Building", "Backend APIs @ Shortsqueeze"],
    ["Contributing", "Keycloak (Red Hat)"],
    ["Learning", "System Design"],
  ],
};

export const quotes = [
  { text: "Talk is cheap. Show me the code.", by: "Linus Torvalds" },
  { text: "Make it work, make it right, make it fast.", by: "Kent Beck" },
  { text: "Simplicity is prerequisite for reliability.", by: "Edsger Dijkstra" },
  { text: "First, solve the problem. Then, write the code.", by: "John Johnson" },
  { text: "Programs must be written for people to read.", by: "Harold Abelson" },
  { text: "Premature optimization is the root of all evil.", by: "Donald Knuth" },
];

export const reading = [
  { title: "System Design Primer", meta: "GitHub · System Design", url: "https://github.com/donnemartin/system-design-primer" },
  { title: "CP-Algorithms", meta: "cp-algorithms.com · DSA", url: "https://cp-algorithms.com/" },
  { title: "The Twelve-Factor App", meta: "12factor.net · Backend", url: "https://12factor.net/" },
  { title: "OAuth 2.0", meta: "oauth.net · Security", url: "https://oauth.net/2/" },
];

/**
 * Music widget. Put a Spotify embed URL in `spotifyEmbed`
 * (e.g. "https://open.spotify.com/embed/playlist/<id>") to show a real player.
 */
export const music = {
  spotifyEmbed: "",
  title: "Deep Focus",
  artist: "coding playlist",
  tracks: ["Compile & Chill", "Segfault Serenade", "Off-by-One", "Merge Conflict"],
};

export const projects: Project[] = [
  {
    slug: "listen-buddy",
    name: "Listen Buddy",
    kind: "Android · Networking",
    period: "Nov 2025 – Feb 2026",
    summary: "Wi-Fi synchronised music streaming with no internet dependency.",
    points: [
      "Phones on the same Wi-Fi find each other through UDP peer discovery.",
      "Audio streams over reliable TCP sockets, so every device plays in sync.",
      "Kotlin coroutines on an MVVM architecture.",
    ],
    tech: ["Kotlin", "UDP", "TCP", "Coroutines", "MVVM"],
    repo: "https://github.com/himanshu7745/Listen-Buddy",
    live: { label: "Demo", url: "https://tinyurl.com/yj53k2a2" },
  },
  {
    slug: "scms",
    name: "AI Student Complaint System",
    kind: "Full-stack · AI",
    period: "Jul 2025 – Oct 2025",
    summary: "Role-based complaint workflow with escalations, SLA tracking and LLM triage.",
    points: [
      "Complaints escalate through role-based stages, with an SLA timer on each.",
      "Few-shot prompting with an LLM predicts severity and routes each complaint to the right department.",
    ],
    tech: ["Spring Boot", "PostgreSQL", "LLMs"],
    repo: "https://github.com/himanshu7745/SCMS",
    live: { label: "Website", url: "https://scms-rose.vercel.app" },
  },
  {
    slug: "interview-prep",
    name: "Interview Preparation Platform",
    kind: "Backend · Realtime",
    period: "Feb 2025 – Apr 2025",
    summary: "Mock interviews with a sandboxed judge, a shared editor and video calls.",
    points: [
      "A Docker-based execution engine runs each submission in an ephemeral, isolated container and returns verdicts in real time.",
      "Collaborative editor over WebSockets, plus peer-to-peer video with WebRTC.",
    ],
    tech: ["Spring Boot", "PostgreSQL", "Docker", "WebSockets", "WebRTC"],
    repo: "https://github.com/himanshu7745/interview_prep",
  },
];

export const jobs: Job[] = [
  {
    slug: "shortsqueeze",
    role: "Software Developer Intern",
    org: "Shortsqueeze Pvt. Ltd.",
    period: "Sep 2026 – Present",
    mode: "Remote",
    points: [
      "Develop and maintain backend APIs and product features, with a focus on reliable data flow and API integration.",
      "Debug and test features, chasing down edge cases to make them more reliable.",
    ],
    tech: ["Backend APIs", "Integration", "Testing"],
  },
  {
    slug: "ricoz",
    role: "Software Developer Intern",
    org: "Ricoz",
    period: "Jun 2025 – Jul 2025",
    mode: "Remote",
    points: [
      "Built the Book My Studio Android app with Kotlin and Jetpack Compose.",
      "Integrated APIs with Retrofit and ran async work on Kotlin Coroutines.",
      "Responsive screens following Material Design and the MVVM pattern.",
    ],
    tech: ["Kotlin", "Jetpack Compose", "Retrofit", "MVVM"],
  },
];

export const openSource = {
  project: "Keycloak",
  org: "Red Hat",
  period: "Sep 2026 – Present",
  url: "https://github.com/keycloak/keycloak",
  summary: "Open-source identity and access management. 2 merged production fixes across OAuth/OIDC and client registration.",
  fixes: [
    {
      title: "Client-secret disclosure in Dynamic Client Registration",
      tag: "Security",
      text: "Confidential client secrets are now masked for view-clients users. manage-clients users and registration-token holders keep access.",
    },
    {
      title: "OIDC scope regression on token refresh",
      tag: "OIDC",
      text: "The openid scope is now kept when a refresh request narrows the requested scope.",
    },
  ],
};

/** Fallback numbers from the resume, shown when live stats can't be fetched. */
export const cpFallback = {
  leetcode: { rating: 1898, badge: "Knight", note: "Top 4% worldwide" },
  codeforces: { maxRating: 1484, rank: "Specialist", note: "Top 4% in India" },
};

export const achievements = [
  {
    title: "Meta Hacker Cup",
    stat: "Top 1,600",
    text: "Ranked in the top 1,600 of 13,500+ participants worldwide.",
    url: "https://www.facebook.com/codingcompetitions/hacker-cup/2025/certificate/405490089235669",
  },
  { title: "LeetCode Knight", stat: "1898", text: "Peak contest rating 1898, top 4% worldwide.", url: "https://leetcode.com/u/Himanshu0076/" },
  { title: "Codeforces Specialist", stat: "1484", text: "Max rating 1484, top 4% in India.", url: "https://codeforces.com/profile/Himanshu0076" },
  { title: "ACM ICPC Asia Kanpur Prelims", stat: "#1123", text: "Ranked 1123 of 2,500+ participants." },
];

export const leadership = [
  {
    role: "Mentor — Official Technical Society",
    org: "Panjab University SSG Regional Centre",
    period: "Jul 2024 – Present",
    points: [
      "Mentored 50+ students in C/C++ through structured workshops and hands-on coding sessions.",
      "Organised 10+ coding contests on HackerRank and ran peer-learning problem-solving groups.",
      "Curated competitive programming resources for juniors.",
    ],
  },
];

export const skills: Record<string, string[]> = {
  Languages: ["C", "C++", "Java", "Kotlin", "SQL"],
  Databases: ["PostgreSQL", "MongoDB", "MySQL", "Firebase"],
  Frameworks: ["Spring Boot", "Jetpack Compose", "Tailwind CSS", "MVVM"],
  Tools: ["Git", "Linux", "Docker", "IntelliJ", "Android Studio", "Postman"],
};
