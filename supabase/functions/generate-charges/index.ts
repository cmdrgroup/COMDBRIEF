import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are building a Mind Clearing Charge Inventory for a male business owner entering a leadership transformation program. Based on their intake form answers below, generate specific, personal charge statements across all 10 emotional categories.

RULES:
- Each statement must be written in first person
- Each statement must be specific to THIS person's situation — not generic
- Use the exact prefix format for each category (see below)
- Generate 3-8 statements per category depending on data relevance
- If the intake data doesn't clearly support charges in a category, generate 1-2 and mark them as "inferred"
- Identify the top 3 highest-priority charges across all categories and label them BIG #1, BIG #2, BIG #3
- Rate each charge 1-10 based on likely intensity from the intake data

CATEGORIES AND PREFIXES:
😬 Fear & Anxiety → "I fear..."
😟 Self Doubt → "I doubt..." / "I question..."
🤬 Frustration → "I'm frustrated that..."
😡 Anger → "I feel angry that..." / "I feel angry at..."
😔 Depression → "I feel..." / "I believe..."
😒 Resentment → "I resent..."
😣 Guilt & Shame → "I feel guilty for..." / "I feel ashamed that..."
💔 Grief & Loss → "I grieve..." / "I mourn the loss of..."
👁️ Judgment → "I judge myself for..." / "I judge others for..."
❤️ Infatuation → "I'm attached to..." / "I'm infatuated with the idea of..."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intakeData, operatorName } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!intakeData || Object.keys(intakeData).length === 0) {
      return new Response(
        JSON.stringify({ error: "No intake data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `OPERATOR NAME: ${operatorName || "Unknown"}

INTAKE FORM DATA:
${JSON.stringify(intakeData, null, 2)}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_charges",
                description:
                  "Generate a structured charge inventory from intake data",
                parameters: {
                  type: "object",
                  properties: {
                    charges: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: {
                            type: "string",
                            enum: [
                              "fear_anxiety",
                              "self_doubt",
                              "frustration",
                              "anger",
                              "depression",
                              "resentment",
                              "guilt_shame",
                              "grief_loss",
                              "judgment",
                              "infatuation",
                            ],
                          },
                          statement: { type: "string" },
                          chargeLevel: { type: "number", minimum: 1, maximum: 10 },
                          inferred: { type: "boolean" },
                          priorityRank: {
                            type: "number",
                            minimum: 1,
                            maximum: 3,
                            description: "Only set for top 3 priority charges",
                          },
                        },
                        required: [
                          "category",
                          "statement",
                          "chargeLevel",
                          "inferred",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["charges"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_charges" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured output returned from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-charges error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
