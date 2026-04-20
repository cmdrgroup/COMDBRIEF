import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Operator = Database["public"]["Tables"]["operators"]["Row"];

export async function getOperatorBySlug(slug: string): Promise<Operator | null> {
  const { data, error } = await supabase
    .from("operators")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllOperators(): Promise<Operator[]> {
  const { data, error } = await supabase
    .from("operators")
    .select("*")
    .order("enrolled_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createOperator(firstName: string, lastName: string, email: string): Promise<Operator> {
  const slug = `${firstName.toLowerCase()}-${lastName.charAt(0).toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;
  const { data, error } = await supabase
    .from("operators")
    .insert({ first_name: firstName, last_name: lastName, email, slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOperatorStep(operatorId: string, stepNumber: number, signatureName?: string) {
  const updates: Record<string, unknown> = {
    [`step_${stepNumber}_completed`]: true,
    [`step_${stepNumber}_completed_at`]: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  };

  // Determine status
  if (stepNumber === 9) {
    updates.status = "complete";
    if (signatureName) updates.signature_name = signatureName;
  } else if (stepNumber === 0) {
    updates.status = "in_progress";
  }

  const { error } = await supabase
    .from("operators")
    .update(updates as any)
    .eq("id", operatorId);
  if (error) throw error;
}

export async function overrideStep(operatorId: string, stepNumber: number) {
  return updateOperatorStep(operatorId, stepNumber);
}

export function getCompletedSteps(operator: Operator): boolean[] {
  return [
    operator.step_0_completed,
    operator.step_1_completed,
    operator.step_2_completed,
    operator.step_3_completed,
    operator.step_4_completed,
    operator.step_5_completed,
    operator.step_6_completed,
    operator.step_7_completed,
    operator.step_8_completed,
    (operator as Record<string, unknown>).step_9_completed as boolean ?? false,
  ];
}

export function getCurrentStep(operator: Operator): number {
  const completed = getCompletedSteps(operator);
  const firstIncomplete = completed.findIndex((c) => !c);
  return firstIncomplete === -1 ? 9 : firstIncomplete;
}

export function getCompletedCount(operator: Operator): number {
  return getCompletedSteps(operator).filter(Boolean).length;
}
