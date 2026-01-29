import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, password, uploadId, milestoneId, fileUrl, fileType, firstId, caption, photoUrl } = await req.json();
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminPassword || password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Invalid password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === "verify") {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("family_uploads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ uploads: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "approve" && uploadId) {
      const { error } = await supabase
        .from("family_uploads")
        .update({ approved: true })
        .eq("id", uploadId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reject" && uploadId) {
      const { error } = await supabase
        .from("family_uploads")
        .update({ approved: false })
        .eq("id", uploadId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete" && uploadId) {
      const { error } = await supabase
        .from("family_uploads")
        .delete()
        .eq("id", uploadId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Milestone actions
    if (action === "list_milestones") {
      const { data, error } = await supabase
        .from("milestones")
        .select("*, milestone_media(*)")
        .order("month_number", { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ milestones: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "add_milestone_media" && milestoneId && fileUrl && fileType) {
      const { data, error } = await supabase
        .from("milestone_media")
        .insert({
          milestone_id: milestoneId,
          file_url: fileUrl,
          file_type: fileType,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, media: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete_milestone_media" && uploadId) {
      const { error } = await supabase
        .from("milestone_media")
        .delete()
        .eq("id", uploadId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_milestone_caption" && milestoneId) {
      const { error } = await supabase
        .from("milestones")
        .update({ caption: caption || null, updated_at: new Date().toISOString() })
        .eq("id", milestoneId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Baby Firsts actions
    if (action === "list_firsts") {
      const { data, error } = await supabase
        .from("baby_firsts")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ firsts: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_first" && firstId) {
      const updates: Record<string, string | null> = {};
      if (caption !== undefined) updates.caption = caption || null;
      if (photoUrl !== undefined) updates.photo_url = photoUrl || null;
      updates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("baby_firsts")
        .update(updates)
        .eq("id", firstId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
