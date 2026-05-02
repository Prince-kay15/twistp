import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Booking from "@/components/Booking";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <div className="glow-line" />
      <Services />
      <Skills />
      <div className="glow-line" />
      <Projects />
      <div className="glow-line" />
      <Booking />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
