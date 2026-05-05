import { Mail, Phone, MapPin, Send, MessageCircle, Loader2, Calendar as CalendarIcon, Clock, X, RefreshCw, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { FaXTwitter, FaInstagram, FaSnapchat, FaTiktok } from "react-icons/fa6";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const SLOT_MINUTES = 30;
const DAY_START_HOUR = 10;
const DAY_END_HOUR = 20;
const STORAGE_KEY = "twist_my_bookings";

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const fmtDayLabel = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

type StoredBooking = { id: string; token: string };
type RemoteBooking = {
  id: string; name: string; email: string; topic: string | null; message: string | null;
  scheduled_at: string; timezone: string; status: string; meeting_link: string | null;
};

const ContactAndBooking = () => {
  const { toast } = useToast();

  const today = useMemo(() => startOfDay(new Date()), []);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today]);
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [bookedTimes, setBookedTimes] = useState<Set<number>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", service: "", tutoringType: "", contentType: "", message: "",
  });

  // My requests
  const [myStored, setMyStored] = useState<StoredBooking[]>([]);
  const [myBookings, setMyBookings] = useState<RemoteBooking[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const loadStored = (): StoredBooking[] => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  };
  const saveStored = (list: StoredBooking[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setMyStored(list);
  };

  const refreshMyBookings = useCallback(async () => {
    const stored = loadStored();
    setMyStored(stored);
    if (stored.length === 0) { setMyBookings([]); return; }
    setLoadingMine(true);
    const results: RemoteBooking[] = [];
    const valid: StoredBooking[] = [];
    for (const item of stored) {
      const { data } = await supabase.functions.invoke("booking-status", {
        body: { action: "get", id: item.id, token: item.token },
      });
      if (data?.booking) {
        results.push(data.booking);
        valid.push(item);
      }
    }
    if (valid.length !== stored.length) saveStored(valid);
    results.sort((a, b) => +new Date(b.scheduled_at) - +new Date(a.scheduled_at));
    setMyBookings(results);
    setLoadingMine(false);
  }, []);

  useEffect(() => { refreshMyBookings(); }, [refreshMyBookings]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast({ title: "Pick a time", description: "Please select an available slot below.", variant: "destructive" });
      return;
    }
    if (!form.service) {
      toast({ title: "Select a service", description: "Please tell me what you need.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const serviceLabel: Record<string, string> = {
      web: "Web Development", software: "Software Engineering", cctv: "CCTV Installation",
      telecom: "Telecom Installation", tutoring: "Full Stack Web Dev Tutoring", content: "Content Creation",
    };
    let topic = serviceLabel[form.service] || form.service;
    if (form.service === "tutoring" && form.tutoringType) topic += ` — ${form.tutoringType}`;
    if (form.service === "content" && form.contentType) topic += ` — ${form.contentType}`;

    try {
      const { data, error } = await supabase.functions.invoke("create-booking", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          topic,
          message: form.message,
          scheduled_at: selectedSlot.toISOString(),
          timezone: tz,
        },
      });
      if (error || (data as any)?.error) {
        const msg = (data as any)?.error || error?.message || "Could not submit";
        toast({ title: "Submission failed", description: msg, variant: "destructive" });
      } else {
        const id = (data as any).id;
        const token = (data as any).approval_token;
        if (id && token) {
          const updated = [{ id, token }, ...loadStored().filter(s => s.id !== id)];
          saveStored(updated);
          await refreshMyBookings();
        }
        setSuccess(true);
        setForm({ name: "", email: "", service: "", tutoringType: "", contentType: "", message: "" });
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

  const handleCancel = async (b: RemoteBooking) => {
    const stored = loadStored().find(s => s.id === b.id);
    if (!stored) return;
    if (!confirm("Cancel this booking request?")) return;
    const { data, error } = await supabase.functions.invoke("booking-status", {
      body: { action: "cancel", id: b.id, token: stored.token },
    });
    if (error || (data as any)?.error) {
      toast({ title: "Could not cancel", description: (data as any)?.error || error?.message || "", variant: "destructive" });
    } else {
      toast({ title: "Cancelled", description: "Your booking request was cancelled." });
      refreshMyBookings();
    }
  };

  const handleReschedule = (b: RemoteBooking) => {
    handleCancel(b).then(() => {
      document.getElementById("book-slot")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string; Icon: any }> = {
      pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-500 border-amber-500/30", Icon: Hourglass },
      accepted: { label: "Confirmed", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", Icon: CheckCircle2 },
      declined: { label: "Declined", cls: "bg-destructive/10 text-destructive border-destructive/30", Icon: XCircle },
      cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground border-border", Icon: X },
    };
    const s = map[status] || map.pending;
    const I = s.Icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${s.cls}`}>
        <I className="w-3 h-3" /> {s.label}
      </span>
    );
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">Get In Touch</span>
          <h2 className="section-heading mb-4">Let's Work Together</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tell me about your project and pick a time — I'll review and confirm with a meeting link.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Sidebar: contact info + my requests */}
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
                <a href="https://wa.me/2349126249215?text=Hi%20my%20name%20is%20______.%20I'm%20reaching%20out%20for%20tech%20services" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group">
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

            {/* My Requests */}
            {myStored.length > 0 && (
              <div className="glass-card rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold font-display">My Requests</h3>
                  <button onClick={refreshMyBookings} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Refresh">
                    <RefreshCw className={`w-4 h-4 ${loadingMine ? "animate-spin" : ""}`} />
                  </button>
                </div>
                {myBookings.length === 0 && !loadingMine ? (
                  <p className="text-sm text-muted-foreground">No requests found.</p>
                ) : (
                  <div className="space-y-3">
                    {myBookings.map((b) => {
                      const dt = new Date(b.scheduled_at);
                      return (
                        <div key={b.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{b.topic || "Session"}</p>
                              <p className="text-xs text-muted-foreground">{fmtDayLabel(dt)} at {fmtTime(dt)}</p>
                            </div>
                            <StatusBadge status={b.status} />
                          </div>
                          {b.status === "accepted" && b.meeting_link && (
                            <a href={b.meeting_link} target="_blank" rel="noopener noreferrer"
                              className="block text-xs text-primary hover:underline truncate mb-2">
                              Join meeting →
                            </a>
                          )}
                          {b.status === "pending" && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleReschedule(b)}
                                className="text-xs px-3 py-1.5 rounded-md border border-border hover:border-primary/50 transition-colors">
                                Reschedule
                              </button>
                              <button onClick={() => handleCancel(b)}
                                className="text-xs px-3 py-1.5 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Combined form */}
          <div className="glass-card rounded-2xl p-8" id="book">
            {success ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📨</div>
                <h3 className="font-display text-2xl font-bold mb-2">Request sent!</h3>
                <p className="text-muted-foreground mb-6">
                  Your request is saved. I'll review it and email you a meeting link once confirmed. Track its status in <strong>My Requests</strong>.
                </p>
                <Button onClick={() => setSuccess(false)} variant="outline">Send another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-semibold font-display">Send a Request</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      placeholder="John Doe" required maxLength={100} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      placeholder="john@example.com" required maxLength={255} />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Service Interested In</label>
                  <select value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value, tutoringType: "", contentType: "" })}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
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
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground" required>
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

                {/* Booking section */}
                <div id="book-slot" className="pt-2 border-t border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h4 className="font-display font-semibold">Pick a date & time</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Times shown in your timezone: {tz}</p>

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

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Available times</span>
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
                  {selectedSlot && (
                    <div className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-sm">
                      <strong>Selected:</strong> {fmtDayLabel(selectedSlot)} at {fmtTime(selectedSlot)}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Message</label>
                  <textarea value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-primary focus:outline-none transition-colors resize-none text-foreground"
                    placeholder="Tell me about your project..." required maxLength={2000} />
                </div>

                <button type="submit" disabled={submitting || !selectedSlot}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {submitting ? (<>Submitting...<Loader2 className="w-4 h-4 animate-spin" /></>) : (<>Send Request<Send className="w-4 h-4" /></>)}
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  You'll receive a meeting link by email once the request is approved.
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