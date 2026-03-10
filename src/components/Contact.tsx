import { Mail, Phone, MapPin, Send, MessageCircle, Loader2 } from "lucide-react";
import { FaXTwitter, FaInstagram, FaSnapchat, FaTiktok } from "react-icons/fa6";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    tutoringType: "",
    contentType: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Message sent! ✉️",
        description: "Thanks for reaching out. I'll get back to you soon!",
      });

      setFormData({ name: "", email: "", service: "", tutoringType: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again or reach out via WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <a href="mailto:princekay043@gmail.com" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">princekay043@gmail.com</p>
                  </div>
                </a>

                <a href="tel:+2349126249215" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground">+234 912 624 9215</p>
                  </div>
                </a>

                <a href="https://wa.me/2349126249215?text=Hi%20my%20name%20is%20______.%20I'm%20reaching%20out%20for%20tech%20services%20including%20web%20or%20mobile%20development%2C%20software%20solutions%2C%20network%20setup%2C%20CCTV%20or%20telecom%20installation%2C%20or%20tech%20training.%20Please%20let%20me%20know%20how%20we%20can%20proceed" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="text-foreground">Chat with me</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="p-3 rounded-xl bg-secondary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-foreground">Nigeria • Available Worldwide</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Follow me</p>
                <div className="flex gap-3">
                  {[
                    { icon: FaXTwitter, href: "https://x.com/princekay043", label: "Twitter" },
                    { icon: FaInstagram, href: "https://www.instagram.com/exetwist/", label: "Instagram" },
                    { icon: FaSnapchat, href: "https://www.snapchat.com/add/princekay2022", label: "Snapchat" },
                    { icon: FaTiktok, href: "https://www.tiktok.com/@exetwist", label: "TikTok" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
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
                    maxLength={100}
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
                    maxLength={255}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Service Interested In</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value, tutoringType: "" })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                >
                  <option value="">Select a service</option>
                  <option value="web">Web Development</option>
                  <option value="software">Software Engineering</option>
                  <option value="cctv">CCTV Installation</option>
                  <option value="telecom">Telecom Installation</option>
                  <option value="tutoring">Full Stack Web Dev Tutoring</option>
                  <option value="content">Content Creation</option>
                </select>
              </div>

              {formData.service === "tutoring" && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Tutoring Focus</label>
                  <select
                    value={formData.tutoringType}
                    onChange={(e) => setFormData({ ...formData, tutoringType: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    required
                  >
                    <option value="">Select tutoring focus</option>
                    <option value="frontend">Frontend Only (HTML, CSS, JavaScript)</option>
                    <option value="backend">Backend Only (PHP, Server Logic, APIs, Databases, Auth)</option>
                    <option value="fullstack">Complete Full Stack</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors resize-none text-foreground"
                  placeholder="Tell me about your project..."
                  required
                  maxLength={5000}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    Sending...
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
