import { Code2, Shield, Wifi } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border bg-secondary/50 mb-6 sm:mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-muted-foreground">Available for new projects</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display leading-tight mb-4 sm:mb-6 animate-slide-up">
            Hi, I'm <span className="text-gradient">TWIST</span>
            <br />
            Building Digital & Physical Tech
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Full-stack developer and technical installation specialist. 
            From elegant web applications to secure CCTV and telecom systems.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <a
              href="#projects"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm sm:text-base text-center hover:opacity-90 transition-all hover:scale-105 shadow-lg"
              style={{ boxShadow: "var(--glow-primary)" }}
            >
              View My Work
            </a>
            <a
              href="#services"
              className="px-6 sm:px-8 py-3 sm:py-4 border border-border text-foreground rounded-xl font-semibold text-sm sm:text-base text-center hover:border-primary/50 hover:bg-secondary/50 transition-all"
            >
              Explore Services
            </a>
          </div>

          {/* Service Icons */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-12 animate-fade-in flex-wrap" style={{ animationDelay: "0.6s" }}>
            {[
              { icon: Code2, label: "Web Development" },
              { icon: Shield, label: "CCTV Systems" },
              { icon: Wifi, label: "Telecom" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 group">
                <div className="p-3 rounded-xl bg-secondary border border-border group-hover:border-primary/50 transition-all duration-300">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[11px] sm:text-xs text-muted-foreground text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
