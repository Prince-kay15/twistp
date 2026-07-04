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
];

export const webCategories = [
  "All",
  "E-Commerce",
  "SaaS",
  "Portfolio",
  "Landing Page",
  "Web App",
];