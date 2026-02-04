import { ExternalLink, Github } from "lucide-react";

const projects = [
  {
    title: "E-Commerce Platform",
    category: "Web Development",
    description: "Full-stack e-commerce solution with inventory management, payment processing, and real-time analytics dashboard.",
    tags: ["React", "Node.js", "PostgreSQL", "Stripe"],
    image: "gradient-1",
  },
  {
    title: "Corporate Security System",
    category: "CCTV Installation",
    description: "Complete security camera installation for a 50,000 sq ft corporate facility with 32 IP cameras and centralized monitoring.",
    tags: ["IP Cameras", "NVR", "Remote Access", "24/7 Recording"],
    image: "gradient-2",
  },
  {
    title: "SaaS Dashboard",
    category: "Software Engineering",
    description: "Analytics and reporting platform serving 10,000+ daily active users with real-time data visualization.",
    tags: ["TypeScript", "React", "GraphQL", "AWS"],
    image: "gradient-3",
  },
  {
    title: "Office Network Infrastructure",
    category: "Telecom Installation",
    description: "Complete network infrastructure setup including structured cabling, VoIP phone system, and WiFi deployment.",
    tags: ["Cat6 Cabling", "VoIP", "WiFi 6", "Fiber Backbone"],
    image: "gradient-4",
  },
];

const gradientClasses: Record<string, string> = {
  "gradient-1": "from-primary/30 via-blue-600/20 to-purple-600/30",
  "gradient-2": "from-emerald-600/30 via-teal-600/20 to-primary/30",
  "gradient-3": "from-orange-600/30 via-rose-600/20 to-primary/30",
  "gradient-4": "from-primary/30 via-indigo-600/20 to-violet-600/30",
};

const Projects = () => {
  return (
    <section id="projects" className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Portfolio
          </span>
          <h2 className="section-heading mb-4">Featured Projects</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A selection of recent work across software and technical installations
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group glass-card rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
            >
              {/* Project Image/Gradient */}
              <div className={`h-48 bg-gradient-to-br ${gradientClasses[project.image]} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                
                {/* Hover Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Github className="w-4 h-4" />
                  </button>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-lg">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold font-display mb-3 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2.5 py-1 text-xs font-medium bg-secondary rounded-md text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
