import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Eye, Search } from "lucide-react";
import { webProjects, webCategories } from "@/data/webProjects";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PAGE_SIZE = 9;

const WebProjects = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return webProjects.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(0, currentPage * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to portfolio
          </Link>

          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
              Web Development
            </span>
            <h1 className="section-heading mb-4">Website Portfolio</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              A collection of websites and web apps built end-to-end. Explore live previews or visit them directly.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 mb-8 sm:mb-10">
            <div className="relative max-w-xl mx-auto w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search projects, tech, keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {webCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {visible.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No projects match your search.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {visible.map((project) => (
                <article
                  key={project.id}
                  className="group glass-card rounded-2xl overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-500 flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden bg-secondary">
                    <img
                      src={project.thumbnail}
                      alt={`${project.title} thumbnail`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-lg">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
                    <h2 className="text-lg font-semibold font-display group-hover:text-primary transition-colors">
                      {project.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-[11px] font-medium bg-secondary rounded-md text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <a
                        href={project.livePreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border hover:border-primary hover:text-primary transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Live Preview
                      </a>
                      <a
                        href={project.visitWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Visit Website
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:border-primary hover:text-primary transition-all"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WebProjects;