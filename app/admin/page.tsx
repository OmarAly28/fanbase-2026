import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function approve(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await supabaseAdmin.from("events").update({ status: "approved" }).eq("id", id);
}

async function reject(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await supabaseAdmin.from("events").update({ status: "rejected" }).eq("id", id);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!key || key !== process.env.ADMIN_KEY) return notFound();

  const { data: pending } = await supabaseAdmin
    .from("events")
    .select("id,title,match_label,starts_at,venue_name,status")
    .eq("status", "pending")
    .order("starts_at", { ascending: true });

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Admin: Pending events</h1>

      {!pending || pending.length === 0 ? (
        <p style={{ marginTop: 16 }}>No pending events.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {pending.map((e) => {
            const label = e.match_label?.trim() ? e.match_label : e.title;
            return (
              <div key={e.id} style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 900 }}>{label}</div>
                <div style={{ opacity: 0.85, marginTop: 6 }}>{e.venue_name}</div>
                <div style={{ opacity: 0.75, marginTop: 6 }}>
                  {new Date(e.starts_at).toLocaleString()}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <form action={approve}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit">Approve</button>
                  </form>

                  <form action={reject}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit">Reject</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
