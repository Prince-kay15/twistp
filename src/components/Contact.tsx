import { Mail, Phone, MapPin, Send, Linkedin, Github, Twitter } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <section id="contact" className="py-24 relative">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Get In Touch
          </span>
          <h2 className="section-heading mb-4">Let's Work Together</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind? Let's discuss how I can help bring your vision to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold font-display mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <a href="mailto:hello@example.com" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">hello@example.com</p>
                  </div>
                </a>

                <a href="tel:+1234567890" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground">+1 (234) 567-890</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="p-3 rounded-xl bg-secondary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-foreground">Available Worldwide</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Follow me</p>
                <div className="flex gap-3">
                  {[
                    { icon: Linkedin, href: "#" },
                    { icon: Github, href: "#" },
                    { icon: Twitter, href: "#" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="p-3 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-semibold font-display mb-6">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Service Interested In</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                >
                  <option value="">Select a service</option>
                  <option value="web">Web Development</option>
                  <option value="software">Software Engineering</option>
                  <option value="cctv">CCTV Installation</option>
                  <option value="telecom">Telecom Installation</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors resize-none text-foreground"
                  placeholder="Tell me about your project..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                Send Message
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
