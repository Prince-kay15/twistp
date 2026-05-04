import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, Loader2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  topic: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
});

const SLOT_MINUTES = 30;
const DAY_START_HOUR = 10;
const DAY_END_HOUR = 20; // exclusive

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtDayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

const Booking = () => {
  const { toast } = useToast();
  const today = useMemo(() => startOfDay(new Date()), []);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today]);
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [bookedTimes, setBookedTimes] = useState<Set<number>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
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
      if (error) {
        console.error(error);
      } else {
        setBookedTimes(new Set((data || []).map((r: any) => new Date(r.scheduled_at).getTime())));
      }
      setLoadingSlots(false);
    };
    load();
  }, [selectedDay]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast({ title: "Pick a time", description: "Please select an available slot.", variant: "destructive" });
      return;
    }
    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-booking", {
        body: {
          ...parsed.data,
          scheduled_at: selectedSlot.toISOString(),
          timezone: tz,
        },
      });
      if (error || (data as any)?.error) {
        const msg = (data as any)?.error || error?.message || "Could not submit booking";
        toast({ title: "Booking failed", description: msg, variant: "destructive" });
      } else {
        setSuccess(true);
        setForm({ name: "", email: "", topic: "", message: "" });
        setSelectedSlot(null);
        // Refresh booked times
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
    <section id="book" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Book a <span className="text-gradient">Zoom Session</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Schedule a 30-minute call. You'll receive a meeting link once I confirm your request.
          </p>
          <p className="text-xs text-muted-foreground mt-2">Times shown in your timezone: {tz}</p>
        </div>

        {success ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">📨</div>
            <h3 className="font-display text-2xl font-bold mb-2">Request sent!</h3>
            <p className="text-muted-foreground mb-6">
              Your booking is saved. I'll review it and send you the meeting link as soon as it's confirmed.
            </p>
            <Button onClick={() => setSuccess(false)} variant="outline">Book another</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Date + slot picker */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">Pick a date</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
                {days.map((d) => {
                  const isSel = d.getTime() === selectedDay.getTime();
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => setSelectedDay(d)}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                        isSel
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      {fmtDayLabel(d)}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">Available times</h3>
              </div>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No more slots today. Try another day.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((s) => {
                    const taken = bookedTimes.has(s.getTime());
                    const isSel = selectedSlot?.getTime() === s.getTime();
                    return (
                      <button
                        key={s.toISOString()}
                        disabled={taken}
                        onClick={() => setSelectedSlot(s)}
                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-all border ${
                          taken
                            ? "bg-muted text-muted-foreground line-through opacity-50 cursor-not-allowed border-transparent"
                            : isSel
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-primary/50"
                        }`}
                      >
                        {fmtTime(s)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">Your details</h3>
              </div>
              {selectedSlot && (
                <div className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-sm">
                  <strong>Selected:</strong> {fmtDayLabel(selectedSlot)} at {fmtTime(selectedSlot)}
                </div>
              )}
              <div>
                <Label htmlFor="bk-name">Name *</Label>
                <Input id="bk-name" required maxLength={100} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="bk-email">Email *</Label>
                <Input id="bk-email" type="email" required maxLength={255} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="bk-topic">Topic (optional)</Label>
                <Input id="bk-topic" maxLength={200} value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="bk-msg">Message (optional)</Label>
                <Textarea id="bk-msg" maxLength={2000} rows={4} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })} />
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
      </div>
    </section>
  );
};

export default Booking;