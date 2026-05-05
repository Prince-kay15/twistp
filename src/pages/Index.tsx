import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import ContactAndBooking from "@/components/ContactAndBooking";
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
        <ContactAndBooking />
        <Footer />
    </div>
  );
};

export default Index;
