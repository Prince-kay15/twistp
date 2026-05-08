import { ExternalLink } from "lucide-react";
import webDevImg from "@/assets/web-dev.jpg";
import cctvImg from "@/assets/cctv.jpg";
import saasImg from "@/assets/saas-dashboard.jpg";
import telecomImg from "@/assets/telecom.jpg";
import contentImg from "@/assets/content-creation.jpg";

const projects = [
  {
    title: "E-Commerce Platform",
    category: "Web Development",
    description: "Full-stack e-commerce solution with inventory management, payment processing, and real-time analytics dashboard.",
    tags: ["React", "Node.js", "PostgreSQL", "Stripe"],
    image: webDevImg,
    link: "https://estate-cyan-ten.vercel.app/",
  },
  {
    title: "Corporate Security System",
    category: "CCTV Installation",
    description: "Complete security camera installation for a 50,000 sq ft corporate facility with 32 IP cameras and centralized monitoring.",
    tags: ["IP Cameras", "NVR", "Remote Access", "24/7 Recording"],
    image: cctvImg,
  },
  {
    title: "SaaS Dashboard",
    category: "Software Engineering",
    description: "Analytics and reporting platform serving 10,000+ daily active users with real-time data visualization.",
    tags: ["TypeScript", "React", "GraphQL", "AWS"],
    image: saasImg,
  },
  {
    title: "Office Network Infrastructure",
    category: "Telecom Installation",
    description: "Complete network infrastructure setup including structured cabling, VoIP phone system, and WiFi deployment.",
    tags: ["Cat6 Cabling", "VoIP", "WiFi 6", "Fiber Backbone"],
    image: telecomImg,
  },
  {
    title: "Brand Campaign & Content Production",
    category: "Content Creation",
    description: "End-to-end content production for brand campaigns including video shoots, social media strategy, and talent collaboration.",
    tags: ["Video Production", "Social Media", "Acting", "Brand Partnerships"],
    image: contentImg,
    link: "https://www.tiktok.com/@exetwist",
  },
];

const Projects = () => {
  return (
    <section id="projects" className="py-16 sm:py-20 lg:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Portfolio
          </span>
          <h2 className="section-heading mb-4">Featured Projects</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
            A selection of recent work across software and technical installations
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto">
          {projects.map((project, index) => {
            const Wrapper = project.link ? 'a' : 'div';
            const wrapperProps = project.link ? { href: project.link, target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <Wrapper
                key={index}
                {...wrapperProps}
                className="group glass-card rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 block"
              >
                {/* Project Image */}
                <div className="h-40 sm:h-48 relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  
                  {/* Hover Actions */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="p-2.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                    <span className="px-3 py-1.5 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-lg">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold font-display mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 sm:mb-4 leading-relaxed">
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
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;
