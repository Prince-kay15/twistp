import { Code2, Cpu, Camera, Radio, GraduationCap, Palette, ArrowUpRight } from "lucide-react";
import webDevImg from "@/assets/web-dev.jpg";
import saasImg from "@/assets/saas-dashboard.jpg";
import cctvImg from "@/assets/cctv.jpg";
import telecomImg from "@/assets/telecom.jpg";
import tutoringImg from "@/assets/tutoring.jpg";
import contentImg from "@/assets/content-creation.jpg";

const services = [
  {
    icon: Code2,
    title: "Web Development",
    description: "Custom websites and web applications built with modern technologies. Responsive, fast, and optimized for conversions.",
    features: ["React & Next.js", "Full-Stack Solutions", "E-commerce", "CMS Integration"],
    image: webDevImg,
    link: "https://estate-cyan-ten.vercel.app/",
  },
  {
    icon: Cpu,
    title: "Software Engineering",
    description: "Scalable software solutions tailored to your business needs. From APIs to complex enterprise systems.",
    features: ["Custom APIs", "Database Design", "Cloud Architecture", "System Integration"],
    image: saasImg,
  },
  {
    icon: Camera,
    title: "CCTV Installation",
    description: "Professional security camera systems for homes and businesses. Complete installation, configuration, and maintenance.",
    features: ["IP & Analog Systems", "Remote Monitoring", "DVR/NVR Setup", "Maintenance"],
    image: cctvImg,
  },
  {
    icon: Radio,
    title: "Telecom Installation",
    description: "Telecommunications infrastructure setup and maintenance. Network cabling, phone systems, and connectivity solutions.",
    features: ["Network Cabling", "VoIP Systems", "Fiber Optics", "Infrastructure"],
    image: telecomImg,
  },
  {
    icon: GraduationCap,
    title: "Full Stack Web Dev Tutoring",
    description: "Personalized mentoring for aspiring developers. Learn to build complete web applications from frontend to backend.",
    features: ["Frontend (HTML/CSS/JS)", "Backend & APIs", "Databases & Auth", "Full Stack Projects"],
    image: tutoringImg,
  },
  {
    icon: Palette,
    title: "Content Creation",
    description: "Creative content production including video creation, social media management, and acting. Bringing stories to life across digital platforms and film.",
    features: ["Video Production", "Social Media Management", "Acting & Film", "Digital Content"],
    image: contentImg,
    link: "https://www.tiktok.com/@exetwist",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-16 sm:py-20 lg:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            What I Do
          </span>
          <h2 className="section-heading mb-4">Services & Expertise</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
            Bridging the gap between digital innovation and physical infrastructure
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => {
            const Wrapper = service.link ? 'a' : 'div';
            const wrapperProps = service.link ? { href: service.link, target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <Wrapper
                key={index}
                {...wrapperProps}
                className="group glass-card rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 relative min-h-[300px] sm:min-h-[340px] block"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                </div>

                <div className="relative z-10 p-5 sm:p-8 flex flex-col justify-end h-full">
                  {/* Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>

                  {/* Title */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold font-display">{service.title}</h3>
                    <ArrowUpRight className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-secondary/80 backdrop-blur-sm rounded-lg text-muted-foreground"
                      >
                        {feature}
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

export default Services;
