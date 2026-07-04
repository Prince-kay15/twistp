export type WebProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  thumbnail: string;
  livePreview: string;
  visitWebsite: string;
};

export const webProjects: WebProject[] = [
  {
    id: "estate-cyan",
    title: "Estate Cyan",
    category: "E-Commerce",
    description:
      "Full-stack real estate marketplace with property listings, search filters, and agent contact flow.",
    technologies: ["React", "Vite", "Tailwind CSS", "Vercel"],
    thumbnail: "https://api.microlink.io/?url=https://estate-cyan-ten.vercel.app/&screenshot=true&meta=false&embed=screenshot.url",
    livePreview: "https://estate-cyan-ten.vercel.app/",
    visitWebsite: "https://estate-cyan-ten.vercel.app/",
  },
  {
    id: "agrotrade",
    title: "Agrotrade",
    category: "E-Commerce",
    description:
      "Agricultural marketplace connecting farmers and buyers across Africa for poultry, fish, livestock, and vet supplies.",
    technologies: ["React", "Next.js", "Tailwind CSS", "Vercel"],
    thumbnail: "https://api.microlink.io/?url=https://agrotrade-ten.vercel.app/&screenshot=true&meta=false&embed=screenshot.url",
    livePreview: "https://agrotrade-ten.vercel.app/",
    visitWebsite: "https://agrotrade-ten.vercel.app/",
  },
  {
    id: "investment-pi",
    title: "Investment Pi",
    category: "Landing Page",
    description:
      "Prestigious investment company landing page showcasing global financial services, wealth management, and advisory.",
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    thumbnail: "https://api.microlink.io/?url=https://investment-pi-ten.vercel.app/&screenshot=true&meta=false&embed=screenshot.url",
    livePreview: "https://investment-pi-ten.vercel.app/",
    visitWebsite: "https://investment-pi-ten.vercel.app/",
  },
  {
    id: "apex-learn",
    title: "Apex Learn",
    category: "Web App",
    description:
      "Online learning platform offering tech courses with interactive projects, real-time simulations, and personalized feedback.",
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    thumbnail: "https://api.microlink.io/?url=https://apex-learn-ten.vercel.app/&screenshot=true&meta=false&embed=screenshot.url",
    livePreview: "https://apex-learn-ten.vercel.app/",
    visitWebsite: "https://apex-learn-ten.vercel.app/",
  },
];

export const webCategories = [
  "All",
  "E-Commerce",
  "SaaS",
  "Portfolio",
  "Landing Page",
  "Web App",
];
