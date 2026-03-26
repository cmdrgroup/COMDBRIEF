import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("GHL webhook received:", JSON.stringify(body));

    // Extract operator identifiers - GHL sends these in various formats
    const email = body.email || body.contact?.email || body.fields?.email;
    const firstName = body.first_name || body.contact?.firstName || body.fields?.first_name || body.firstName;
    const lastName = body.last_name || body.contact?.lastName || body.fields?.last_name || body.lastName;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "No email found in webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Strip out metadata fields, keep only intake form answers
    const metaFields = ["email", "first_name", "last_name", "firstName", "lastName", "contact", "fields", "id", "contactId", "locationId", "type", "timestamp"];
    const intakeData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!metaFields.includes(key)) {
        intakeData[key] = value;
      }
    }
    // Also pull in nested fields if present
    if (body.fields && typeof body.fields === "object") {
      for (const [key, value] of Object.entries(body.fields)) {
        if (!["email", "first_name", "last_name"].includes(key)) {
          intakeData[key] = value;
        }
      }
    }

    // Find operator by email
    const { data: operator, error: findError } = await supabase
      .from("operators")
      .select("id, first_name, last_name")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (findError) {
      console.error("Error finding operator:", findError);
      throw new Error(`Database error: ${findError.message}`);
    }

    let operatorId: string;
    let operatorName: string;

    if (operator) {
      // Update existing operator with intake data
      const { error: updateError } = await supabase
        .from("operators")
        .update({ intake_data: intakeData })
        .eq("id", operator.id);

      if (updateError) throw new Error(`Update error: ${updateError.message}`);

      operatorId = operator.id;
      operatorName = `${operator.first_name} ${operator.last_name}`;
      console.log(`Updated intake_data for operator ${operatorId}`);
    } else {
      // Create new operator
      const slug = `${(firstName || "op").toLowerCase()}-${(lastName || "new").toLowerCase().charAt(0)}-${Math.random().toString(36).slice(2, 8)}`;
      
      const { data: newOp, error: insertError } = await supabase
        .from("operators")
        .insert({
          email: email.toLowerCase().trim(),
          first_name: firstName || "New",
          last_name: lastName || "Operator",
          slug,
          intake_data: intakeData,
          status: "not_started",
        })
        .select("id, first_name, last_name")
        .single();

      if (insertError) throw new Error(`Insert error: ${insertError.message}`);

      operatorId = newOp.id;
      operatorName = `${newOp.first_name} ${newOp.last_name}`;
      console.log(`Created new operator ${operatorId} from webhook`);
    }

    // Auto-generate charges from intake data
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let chargesGenerated = false;

    if (LOVABLE_API_KEY && Object.keys(intakeData).length > 0) {
      try {
        const generateUrl = `${supabaseUrl}/functions/v1/generate-charges`;
        const chargeResponse = await fetch(generateUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            intakeData,
            operatorName,
          }),
        });

        if (chargeResponse.ok) {
          const chargeResult = await chargeResponse.json();
          const charges = chargeResult.charges || [];

          if (charges.length > 0) {
            const chargeRows = charges.map((c: Record<string, unknown>, i: number) => ({
              operator_id: operatorId,
              category: c.category,
              statement: c.statement,
              charge_level: c.chargeLevel || 5,
              priority_rank: c.priorityRank || null,
              sort_order: i,
              status: "not_started",
            }));

            const { error: chargeInsertError } = await supabase
              .from("charge_items")
              .insert(chargeRows);

            if (chargeInsertError) {
              console.error("Error inserting charges:", chargeInsertError);
            } else {
              chargesGenerated = true;
              console.log(`Generated ${charges.length} charges for operator ${operatorId}`);
            }
          }
        } else {
          console.error("Charge generation failed:", await chargeResponse.text());
        }
      } catch (genErr) {
        console.error("Charge generation error:", genErr);
      }
    }

    // Auto-load default roadmap template
    let roadmapLoaded = false;
    try {
      // Check if roadmap items already exist
      const { data: existingItems } = await supabase
        .from("roadmap_items")
        .select("id")
        .eq("operator_id", operatorId)
        .limit(1);

      if (!existingItems || existingItems.length === 0) {
        const defaultItems = [
          { phase: "phase_1", title: "Complete Pre-Deployment Manual Review", description: "Read and acknowledge all onboarding materials", icon: "📋", target_week: 1 },
          { phase: "phase_1", title: "Complete Mind Clearing Inventory Review", description: "Review all charges with Command during deployment call", icon: "🧠", target_week: 1 },
          { phase: "phase_1", title: "Install Morning Battle Rhythm", description: "Begin daily 05:00 wake + morning protocol", icon: "⏰", target_week: 1 },
          { phase: "phase_1", title: "Submit First SITREP", description: "Complete and submit first daily situation report", icon: "📝", target_week: 1 },
          { phase: "phase_1", title: "Complete Time Audit", description: "Track all time for 7 days, identify leakage points", icon: "⏱️", target_week: 2 },
          { phase: "phase_1", title: "First Clearing Session (BIG #1)", description: "Conduct first dedicated clearing operation on primary charge", icon: "🎯", target_week: 2 },
          { phase: "phase_1", title: "Define 90-Day Strategic Objectives", description: "Lock in 3–5 measurable objectives for the Passage", icon: "🗺️", target_week: 3 },
          { phase: "phase_1", title: "Establish KPI Dashboard", description: "Define and begin tracking 5 core business metrics", icon: "📊", target_week: 3 },
          { phase: "phase_1", title: "Complete Command Foundations Assessment", description: "Self-assessment across all 5 Command Centers", icon: "🏛️", target_week: 4 },
          { phase: "phase_2", title: "Strategic Positioning Analysis", description: "Analyse current market position and competitive landscape", icon: "🔍", target_week: 5 },
          { phase: "phase_2", title: "Mission Targeting Workshop", description: "Define ideal client avatar and value proposition", icon: "🎯", target_week: 6 },
          { phase: "phase_2", title: "Delegation Audit", description: "Map all tasks, identify delegation opportunities", icon: "👥", target_week: 6 },
          { phase: "phase_2", title: "Revenue Architecture Review", description: "Analyse revenue streams, identify strategic focus areas", icon: "💰", target_week: 7 },
          { phase: "phase_2", title: "Strategic Command Positioning", description: "Define your role as strategic leader vs tactical operator", icon: "🏗️", target_week: 8 },
          { phase: "phase_3", title: "Time Command Implementation", description: "Restructure calendar around strategic priorities", icon: "⏰", target_week: 9 },
          { phase: "phase_3", title: "Fear & Edge Operations", description: "Execute on identified fear-based charges with clearing protocols", icon: "⚔️", target_week: 10 },
          { phase: "phase_3", title: "Environment Audit & Optimization", description: "Audit physical, digital, and relational environments", icon: "🏠", target_week: 10 },
          { phase: "phase_3", title: "90-Day Review & Recalibration", description: "Review progress against objectives, adjust tactical approach", icon: "📊", target_week: 11 },
          { phase: "phase_4", title: "Pre-Passage Integration", description: "Consolidate all learnings and systems before Passage completion", icon: "🔄", target_week: 12 },
          { phase: "phase_4", title: "Advanced Command Deployment", description: "Implement advanced leadership frameworks", icon: "⭐", target_week: 12 },
          { phase: "phase_4", title: "Post-Passage Transition Plan", description: "Define ongoing rhythm and accountability structure", icon: "🚀", target_week: 12 },
        ];

        const roadmapRows = defaultItems.map((item, i) => ({
          operator_id: operatorId,
          phase: item.phase,
          item_type: "standard",
          title: item.title,
          description: item.description,
          icon: item.icon,
          target_week: item.target_week,
          sort_order: i,
        }));

        const { error: roadmapError } = await supabase
          .from("roadmap_items")
          .insert(roadmapRows);

        if (roadmapError) {
          console.error("Error inserting roadmap:", roadmapError);
        } else {
          roadmapLoaded = true;
          console.log(`Loaded ${roadmapRows.length} roadmap items for operator ${operatorId}`);
        }
      } else {
        console.log("Roadmap already exists, skipping template load");
      }
    } catch (roadmapErr) {
      console.error("Roadmap loading error:", roadmapErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        operator_id: operatorId,
        charges_generated: chargesGenerated,
        roadmap_loaded: roadmapLoaded,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ghl-webhook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
