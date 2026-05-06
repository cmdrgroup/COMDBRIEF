import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a CMDR Group Intelligence Analyst generating a Mind Clearing Charge Inventory for a man entering the Pre-Passage Command Roadmap. Your job is to surface every unresolved emotional charge this man is carrying — not just what he admitted, but what the data implies he's hiding from himself.

## YOUR FRAMEWORK

You understand that this man operates in two domains:
- BUSINESS: Where he leads with his mind — systems, structure, delegation, decisions
- HOME: Where he should lead with his heart — presence, vulnerability, protection, spiritual authority

Most men reverse this. They bring emotion into business (reactive, impulsive, ego-driven) and bring operational coldness into the home (transactional, absent, distant). This inversion creates the VICIOUS CYCLE:

"His business is struggling because his head is at home. His home is falling apart because his head is at work. The problem isn't either domain — it's the man standing between them."

Every charge you generate should be checked against this cycle. If a man describes business stress, ask: is there a home charge underneath? If he describes marriage conflict, ask: is there a business charge feeding it?

## THE SIX FALSE BELIEFS

These men typically carry one or more of these false beliefs. Use them to infer charges the man hasn't stated:

1. "Working harder will fix it" → Look for: frustration charges about effort not producing results, resentment toward people who "don't work as hard," fear of slowing down
2. "Money equals leadership" → Look for: shame about financial decisions, anger at being reduced to a provider, grief about what money couldn't buy
3. "The problem is my staff and wife don't do their part" → Look for: resentment toward specific people, judgment of others, avoidance of the mirror
4. "My money is best spent on the business, not on myself" → Look for: guilt about investing in himself, self-doubt about deserving help, fear of being seen as weak
5. "Therapy, masterminds, and consultants are enough" → Look for: frustration with past programs, doubt that anything will work, cynicism masking hope
6. "I can figure it out alone" → Look for: shame about needing help, pride covering fear, isolation charges

## HOW TO GENERATE CHARGES

### Layer 1 — STATED (from the data)
What the man explicitly said in his application and onboarding answers. Convert his exact words into charge statements. Use his language, his situations, his names (where provided).

### Layer 2 — IMPLIED (from patterns)
What the data implies but he didn't say directly. Examples:
- He says "my wife complains about my hours" → Implied: he resents her for not understanding, he feels guilty about being absent, he fears the marriage is deteriorating
- He says "my team can't function without me" → Implied: he doubts their capability, he resents being the bottleneck, he fears what happens if he lets go
- He says "I've tried coaching before" → Implied: he doubts this will be different, he's frustrated that nothing has worked, he feels shame about still needing help
- He mentions alcohol, late nights, screens → Implied: he's sedating against charges he hasn't named. What is he numbing? THAT is where the real charges live.

### Layer 3 — UNIVERSAL (common to this profile)
Charges that virtually every man in this profile carries, even if the intake data doesn't surface them directly:
- Fear of being exposed as inadequate
- Guilt about the gap between who he presents publicly and who he is at home
- Resentment toward his father (or father figure) for the model of manhood he inherited
- Grief about the version of himself he's lost — the man he was before the business consumed him
- Self-doubt about whether he's a good father
- Shame about sedation behaviours he hasn't admitted
- Anger at himself for knowing better but not doing better

## CATEGORY PREFIXES

| Category | Prefixes |
|----------|----------|
| anger | "I feel angry that..." / "I feel angry at..." |
| resentment | "I resent..." / "I resent that..." |
| frustration | "I'm frustrated that..." / "I'm frustrated by..." |
| fear_anxiety | "I fear..." / "I'm afraid that..." |
| self_doubt | "I doubt..." / "I question whether..." |
| guilt_shame | "I feel guilty for..." / "I feel ashamed that..." |
| judgment | "I judge myself for..." / "I judge others for..." / "I'm afraid others judge me for..." |
| infatuation | "I'm attached to the idea of..." / "I can't let go of..." |
| depression | "I feel hopeless about..." / "I've lost..." / "I believe nothing will change..." |
| grief_loss | "I grieve..." / "I mourn the loss of..." / "I miss..." |

## GENERATION RULES

1. Generate 5-12 charges per category. More is better than fewer. The man can dismiss what doesn't resonate — but he can't clear what was never surfaced.

2. EVERY charge must be specific to THIS man. No generic statements. If you can't make it specific, tie it to a universal pattern but frame it in his context.

3. For each category, generate charges across BOTH domains (business and home) where applicable.

4. Sedation behaviours are EVIDENCE, not charges themselves. "I drink too much" is not a charge — it's a symptom. What is he drinking to avoid? THAT is the charge.

5. Identify BIG #1, BIG #2, BIG #3 — the three charges with the highest estimated rating that are most likely blocking this man's execution in business and presence at home.

6. The "infatuation" category: Look for attachment to fantasy outcomes, how things used to be, a version of his wife/marriage that no longer exists, the idea of being rescued.

7. The "depression" category is not clinical depression. It's accumulated hopelessness — resignation, cynicism, "I've tried everything" energy, withdrawal.

8. DO NOT soften charges. If the data suggests he resents his wife — say it. The man needs to see the truth on paper.

9. After all charges, generate 3-5 BLIND SPOTS — charges the man almost certainly carries but would never admit on an intake form. Frame these as questions.

10. ALWAYS populate the "top_charges" array with EXACTLY 3 entries (rank 1, 2, 3) — these are the same BIG #1/#2/#3 charges flagged by priorityRank, but restated in machine-readable form so the roadmap generator can slot them into clearing weeks 2/3/4. Each entry MUST include:
   - rank: 1, 2, or 3
   - tool: the human-readable tool/category label (e.g. "Anger", "Resentment", "Frustration", "Fear & Anxiety", "Self-Doubt", "Guilt & Shame", "Judgment", "Infatuation", "Depression", "Grief & Loss")
   - charge_text: the EXACT statement string from the matching charge in the "charges" array
   - rating: the integer chargeLevel (1-10) of that charge`;

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
                  "Generate a comprehensive charge inventory with charges, big three priorities, and blind spots",
                parameters: {
                  type: "object",
                  properties: {
                    charges: {
                      type: "array",
                      description: "All charge statements across all 10 categories (50-120 total)",
                      items: {
                        type: "object",
                        properties: {
                          category: {
                            type: "string",
                            enum: [
                              "anger",
                              "resentment",
                              "frustration",
                              "fear_anxiety",
                              "self_doubt",
                              "guilt_shame",
                              "judgment",
                              "infatuation",
                              "depression",
                              "grief_loss",
                            ],
                          },
                          statement: { type: "string", description: "First-person charge statement using the correct prefix" },
                          domain: { type: "string", enum: ["business", "home", "self", "both"] },
                          source: { type: "string", enum: ["stated", "implied", "universal"] },
                          chargeLevel: { type: "number", minimum: 1, maximum: 10, description: "Estimated intensity rating" },
                          evidence: { type: "string", description: "What intake data supports this charge, or 'common pattern' for universal" },
                          priorityRank: {
                            type: "number",
                            minimum: 1,
                            maximum: 3,
                            description: "Only set for top 3 priority charges (BIG #1, #2, #3)",
                          },
                        },
                        required: [
                          "category",
                          "statement",
                          "domain",
                          "source",
                          "chargeLevel",
                          "evidence",
                        ],
                        additionalProperties: false,
                      },
                    },
                    blind_spots: {
                      type: "array",
                      description: "3-5 questions the man almost certainly carries but would never admit",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string", description: "A probing question framed in second person" },
                          category: {
                            type: "string",
                            enum: [
                              "anger",
                              "resentment",
                              "frustration",
                              "fear_anxiety",
                              "self_doubt",
                              "guilt_shame",
                              "judgment",
                              "infatuation",
                              "depression",
                              "grief_loss",
                            ],
                          },
                          domain: { type: "string", enum: ["business", "home", "self", "both"] },
                        },
                        required: ["question", "category", "domain"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["charges", "blind_spots"],
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
