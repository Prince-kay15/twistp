import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Check, X, ExternalLink } from "lucide-react";

type Booking = {
  id: string;
  name: string;
  email: string;
  topic: string | null;
  message: string | null;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  status: string;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  approval_token: string;
  created_at: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const admin = !!roles?.some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await loadBookings();
      setLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("scheduled_at", { ascending: true });
    if (error) {
      toast({ title: "Load failed", description: error.message, variant: "destructive" });
    } else {
      setBookings((data as Booking[]) || []);
    }
  };

  const handleAction = async (b: Booking, action: "accept" | "decline") => {
    setActingId(b.id);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-booking?id=${b.id}&token=${b.approval_token}&action=${action}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      toast({ title: action === "accept" ? "Accepted" : "Declined", description: "User has been emailed." });
      await loadBookings();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActingId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Not authorized</h1>
          <p className="text-muted-foreground">
            Your account doesn't have admin access. Ask the site owner to grant the <code>admin</code> role to your user.
          </p>
          <Button onClick={handleSignOut} variant="outline"><LogOut className="w-4 h-4 mr-2" />Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">Bookings</h1>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />Sign out
          </Button>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
            No bookings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const dt = new Date(b.scheduled_at);
              const statusColor =
                b.status === "accepted" ? "text-green-500" :
                b.status === "declined" ? "text-red-500" :
                b.status === "cancelled" ? "text-muted-foreground" : "text-yellow-500";
              return (
                <div key={b.id} className="glass-card rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display text-lg font-semibold">{b.name}</h3>
                        <span className={`text-xs uppercase font-bold ${statusColor}`}>{b.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{b.email}</p>
                      <p className="text-sm mt-2">
                        <strong>{dt.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</strong>
                        <span className="text-muted-foreground"> · {b.timezone}</span>
                      </p>
                      {b.topic && <p className="text-sm mt-1"><strong>Topic:</strong> {b.topic}</p>}
                      {b.message && <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">{b.message}</p>}
                      {b.zoom_join_url && (
                        <a
                          href={b.zoom_start_url || b.zoom_join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                        >
                          Open Zoom <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction(b, "accept")}
                          disabled={actingId === b.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />Accept</>}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(b, "decline")}
                          disabled={actingId === b.id}
                        >
                          <X className="w-4 h-4 mr-1" />Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;