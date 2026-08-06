import { Mail, Phone, MapPin, Send, MessageCircle, Loader2 } from "lucide-react";
import { FaXTwitter, FaInstagram, FaSnapchat, FaTiktok } from "react-icons/fa6";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const ContactAndBooking = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", service: "", tutoringType: "", contentType: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service) {
      toast({ title: "Select a service", description: "Please tell me what you need.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          service: form.service,
          tutoringType: form.tutoringType || undefined,
          contentType: form.contentType || undefined,
          message: form.message,
        },
      });
      if (error || (data as any)?.error) {
        const msg = (data as any)?.error || error?.message || "Could not submit";
        toast({ title: "Submission failed", description: msg, variant: "destructive" });
      } else {
        setSuccess(true);
        setForm({ name: "", email: "", service: "", tutoringType: "", contentType: "", message: "" });
      }
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">Get In Touch</span>
          <h2 className="section-heading mb-4">Let's Work Together</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
            Tell me about your project and I'll get back to you by email.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <div className="space-y-6 sm:space-y-8">
            <div className="glass-card rounded-2xl p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold font-display mb-5 sm:mb-6">Contact Information</h3>
              <div className="space-y-4 sm:space-y-6">
                <a href="mailto:princekay043@gmail.com" className="flex items-center gap-3 sm:gap-4 text-muted-foreground hover:text-primary transition-colors group min-w-0">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors"><Mail className="w-5 h-5" /></div>
                  <div className="min-w-0"><p className="text-sm text-muted-foreground">Email</p><p className="text-foreground text-sm sm:text-base truncate">princekay043@gmail.com</p></div>
                </a>
                <a href="tel:+2349126249215" className="flex items-center gap-3 sm:gap-4 text-muted-foreground hover:text-primary transition-colors group min-w-0">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors"><Phone className="w-5 h-5" /></div>
                  <div className="min-w-0"><p className="text-sm text-muted-foreground">Phone</p><p className="text-foreground text-sm sm:text-base">+234 912 624 9215</p></div>
                </a>
                <a href="https://wa.me/2349126249215?text=Hi%20my%20name%20is%20______.%20I'm%20reaching%20out%20for%20tech%20services" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 sm:gap-4 text-muted-foreground hover:text-primary transition-colors group min-w-0">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors"><MessageCircle className="w-5 h-5" /></div>
                  <div className="min-w-0"><p className="text-sm text-muted-foreground">WhatsApp</p><p className="text-foreground text-sm sm:text-base">Chat with me</p></div>
                </a>
                <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground min-w-0">
                  <div className="p-3 rounded-xl bg-secondary"><MapPin className="w-5 h-5" /></div>
                  <div className="min-w-0"><p className="text-sm text-muted-foreground">Location</p><p className="text-foreground text-sm sm:text-base">Nigeria • Available Worldwide</p></div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Follow me</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[
                    { icon: FaXTwitter, href: "https://x.com/princekay043", label: "Twitter" },
                    { icon: FaInstagram, href: "https://www.instagram.com/exetwist/", label: "Instagram" },
                    { icon: FaSnapchat, href: "https://www.snapchat.com/@realprincekay", label: "Snapchat" },
                    { icon: FaTiktok, href: "https://www.tiktok.com/@exetwist", label: "TikTok" },
                  ].map((social, index) => (
                    <a key={index} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                      className="p-3 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition-all">
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 sm:p-8" id="book">
            {success ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-5xl mb-4">📨</div>
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-2">Message sent!</h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  Thanks for reaching out. I'll review your request and get back to you by email shortly.
                </p>
                <Button onClick={() => setSuccess(false)} variant="outline">Send another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold font-display">Send a Request</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      placeholder="John Doe" required maxLength={100} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      placeholder="john@example.com" required maxLength={255} />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Service Interested In</label>
                  <select value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value, tutoringType: "", contentType: "" })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    required>
                    <option value="">Select a service</option>
                    <option value="web">Web Development</option>
                    <option value="software">Software Engineering</option>
                    <option value="cctv">CCTV Installation</option>
                    <option value="telecom">Telecom Installation</option>
                    <option value="tutoring">Full Stack Web Dev Tutoring</option>
                    <option value="content">Content Creation</option>
                  </select>
                </div>

                {form.service === "tutoring" && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Tutoring Focus</label>
                    <select value={form.tutoringType}
                      onChange={(e) => setForm({ ...form, tutoringType: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground" required>
                      <option value="">Select tutoring focus</option>
                      <option value="frontend">Frontend Only (HTML, CSS, JavaScript)</option>
                      <option value="backend">Backend Only (PHP, Server Logic, APIs, Databases, Auth)</option>
                      <option value="fullstack">Complete Full Stack</option>
                    </select>
                  </div>
                )}

                {form.service === "content" && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Content Type</label>
                    <select value={form.contentType}
                      onChange={(e) => setForm({ ...form, contentType: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground" required>
                      <option value="">Select content type</option>
                      <option value="collaboration">Collaboration</option>
                      <option value="sponsor">Sponsor</option>
                      <option value="modeling">Modeling</option>
                      <option value="brand_advert">Brand Advert</option>
                      <option value="ambassadorship">Ambassadorship</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Message</label>
                  <textarea value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors resize-none text-foreground"
                    placeholder="Tell me about your project..." required maxLength={2000} />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3 sm:py-4 text-sm sm:text-base bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {submitting ? (<>Sending...<Loader2 className="w-4 h-4 animate-spin" /></>) : (<>Send Request<Send className="w-4 h-4" /></>)}
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  I'll reply to your email as soon as possible.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactAndBooking;
