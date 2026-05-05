import { Mail, Phone, MapPin, Send, MessageCircle, Loader2 } from "lucide-react";
import { FaXTwitter, FaInstagram, FaSnapchat, FaTiktok } from "react-icons/fa6";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Video } from "lucide-react";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  topic: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
});

const SLOT_MINUTES = 30;
const DAY_START_HOUR = 10;
const DAY_END_HOUR = 20;

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const fmtDayLabel = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const ContactAndBooking = () => {
  const { toast } = useToast();

  // Contact form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", service: "", tutoringType: "", contentType: "", message: "",
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", { body: formData });
      if (error) throw error;
      toast({ title: "Message sent! ✉️", description: "Thanks for reaching out. I'll get back to you soon!" });
      setFormData({ name: "", email: "", service: "", tutoringType: "", contentType: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Failed to send message", description: "Please try again or reach out via WhatsApp.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Booking state
  const today = useMemo(() => startOfDay(new Date()), []);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today]);
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [bookedTimes, setBookedTimes] = useState<Set<number>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookForm, setBookForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [success, setSuccess] = useState(false);
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const slots = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date(selectedDay);
    for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        const t = new Date(base);
        t.setHours(h, m, 0, 0);
        if (t.getTime() > Date.now() + 30 * 60 * 1000) arr.push(t);
      }
    }
    return arr;
  }, [selectedDay]);

  useEffect(() => {
    const load = async () => {
      setLoadingSlots(true);
      const { data, error } = await supabase.rpc("get_booked_slots");
      if (error) console.error(error);
      else setBookedTimes(new Set((data || []).map((r: any) => new Date(r.scheduled_at).getTime())));
      setLoadingSlots(false);
    };
    load();
  }, [selectedDay]);

  useEffect(() => { setSelectedSlot(null); }, [selectedDay]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast({ title: "Pick a time", description: "Please select an available slot.", variant: "destructive" });
      return;
    }
    const parsed = bookingSchema.safeParse(bookForm);
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-booking", {
        body: { ...parsed.data, scheduled_at: selectedSlot.toISOString(), timezone: tz },
      });
      if (error || (data as any)?.error) {
        const msg = (data as any)?.error || error?.message || "Could not submit booking";
        toast({ title: "Booking failed", description: msg, variant: "destructive" });
      } else {
        setSuccess(true);
        setBookForm({ name: "", email: "", topic: "", message: "" });
        setSelectedSlot(null);
        const { data: refreshed } = await supabase.rpc("get_booked_slots");
        setBookedTimes(new Set((refreshed || []).map((r: any) => new Date(r.scheduled_at).getTime())));
      }
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Get In Touch
          </span>
          <h2 className="section-heading mb-4">Let's Work Together</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Send a message or book a 30-minute session — whichever works for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact info sidebar */}
          <div className="space-y-8">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold font-display mb-6">Contact Information</h3>
              <div className="space-y-6">
                <a href="mailto:princekay043@gmail.com" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors"><Mail className="w-5 h-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Email</p><p className="text-foreground">princekay043@gmail.com</p></div>
                </a>
                <a href="tel:+2349126249215" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors"><Phone className="w-5 h-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Phone</p><p className="text-foreground">+234 912 624 9215</p></div>
                </a>
                <a href="https://wa.me/2349126249215?text=Hi%20my%20name%20is%20______.%20I'm%20reaching%20out%20for%20tech%20services%20including%20web%20or%20mobile%20development%2C%20software%20solutions%2C%20network%20setup%2C%20CCTV%20or%20telecom%20installation%2C%20or%20tech%20training.%20Please%20let%20me%20know%20how%20we%20can%20proceed" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors"><MessageCircle className="w-5 h-5" /></div>
                  <div><p className="text-sm text-muted-foreground">WhatsApp</p><p className="text-foreground">Chat with me</p></div>
                </a>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="p-3 rounded-xl bg-secondary"><MapPin className="w-5 h-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Location</p><p className="text-foreground">Nigeria • Available Worldwide</p></div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Follow me</p>
                <div className="flex gap-3">
                  {[
                    { icon: FaXTwitter, href: "https://x.com/princekay043", label: "Twitter" },
                    { icon: FaInstagram, href: "https://www.instagram.com/exetwist/", label: "Instagram" },
                    { icon: FaSnapchat, href: "https://www.snapchat.com/add/princekay2022", label: "Snapchat" },
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

          {/* Tabs: Message | Book */}
          <div className="glass-card rounded-2xl p-8" id="book">
            <Tabs defaultValue="message" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="message">Send a Message</TabsTrigger>
                <TabsTrigger value="book">Book a Session</TabsTrigger>
              </TabsList>

              <TabsContent value="message">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                        placeholder="John Doe" required maxLength={100} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                        placeholder="john@example.com" required maxLength={255} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Service Interested In</label>
                    <select value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value, tutoringType: "", contentType: "" })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground">
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
                      <select value={formData.tutoringType}
                        onChange={(e) => setFormData({ ...formData, tutoringType: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground" required>
                        <option value="">Select tutoring focus</option>
                        <option value="frontend">Frontend Only (HTML, CSS, JavaScript)</option>
                        <option value="backend">Backend Only (PHP, Server Logic, APIs, Databases, Auth)</option>
                        <option value="fullstack">Complete Full Stack</option>
                      </select>
                    </div>
                  )}
                  {formData.service === "content" && (
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Content Type</label>
                      <select value={formData.contentType}
                        onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground" required>
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
                    <textarea value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors resize-none text-foreground"
                      placeholder="Tell me about your project..." required maxLength={5000} />
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                    {isSubmitting ? (<>Sending...<Loader2 className="w-4 h-4 animate-spin" /></>) : (<>Send Message<Send className="w-4 h-4" /></>)}
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="book">
                {success ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">📨</div>
                    <h3 className="font-display text-2xl font-bold mb-2">Request sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Your booking is saved. I'll review it and send you the meeting link as soon as it's confirmed.
                    </p>
                    <Button onClick={() => setSuccess(false)} variant="outline">Book another</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-xs text-muted-foreground text-center">Times shown in your timezone: {tz}</p>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        <h4 className="font-display font-semibold">Pick a date</h4>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {days.map((d) => {
                          const isSel = d.getTime() === selectedDay.getTime();
                          return (
                            <button key={d.toISOString()} type="button" onClick={() => setSelectedDay(d)}
                              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                                isSel ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50"
                              }`}>
                              {fmtDayLabel(d)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <h4 className="font-display font-semibold">Available times</h4>
                      </div>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-6 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /></div>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">No more slots today. Try another day.</p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {slots.map((s) => {
                            const taken = bookedTimes.has(s.getTime());
                            const isSel = selectedSlot?.getTime() === s.getTime();
                            return (
                              <button key={s.toISOString()} type="button" disabled={taken} onClick={() => setSelectedSlot(s)}
                                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                                  taken ? "bg-muted text-muted-foreground line-through opacity-50 cursor-not-allowed border-transparent"
                                  : isSel ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card border-border hover:border-primary/50"
                                }`}>
                                {fmtTime(s)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleBookSubmit} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-primary" />
                        <h4 className="font-display font-semibold">Your details</h4>
                      </div>
                      {selectedSlot && (
                        <div className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-sm">
                          <strong>Selected:</strong> {fmtDayLabel(selectedSlot)} at {fmtTime(selectedSlot)}
                        </div>
                      )}
                      <div>
                        <Label htmlFor="bk-name">Name *</Label>
                        <Input id="bk-name" required maxLength={100} value={bookForm.name}
                          onChange={(e) => setBookForm({ ...bookForm, name: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="bk-email">Email *</Label>
                        <Input id="bk-email" type="email" required maxLength={255} value={bookForm.email}
                          onChange={(e) => setBookForm({ ...bookForm, email: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="bk-topic">Topic (optional)</Label>
                        <Input id="bk-topic" maxLength={200} value={bookForm.topic}
                          onChange={(e) => setBookForm({ ...bookForm, topic: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="bk-msg">Message (optional)</Label>
                        <Textarea id="bk-msg" maxLength={2000} rows={3} value={bookForm.message}
                          onChange={(e) => setBookForm({ ...bookForm, message: e.target.value })} />
                      </div>
                      <Button type="submit" disabled={submitting || !selectedSlot} className="w-full">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Request Session
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        You'll receive a meeting link by email once the request is approved.
                      </p>
                    </form>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactAndBooking;