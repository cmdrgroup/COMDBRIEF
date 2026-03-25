import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOperatorBySlug, updateOperatorStep, getCompletedSteps, getCurrentStep } from "@/lib/operators";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

const OnboardPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  const { data: operator, isLoading, error } = useQuery({
    queryKey: ["operator", slug],
    queryFn: () => getOperatorBySlug(slug!),
    enabled: !!slug,
  });

  const stepMutation = useMutation({
    mutationFn: ({ step, signatureName }: { step: number; signatureName?: string }) =>
      updateOperatorStep(operator!.id, step, signatureName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operator", slug] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-command-gold rounded-sm flex items-center justify-center">
            <span className="font-heading text-xl font-bold text-command-gold">C</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-slate-grey">Loading briefing...</p>
        </div>
      </div>
    );
  }

  if (error || !operator) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl uppercase tracking-widest text-warning-red mb-2">Access Denied</h1>
          <p className="text-sm text-slate-grey">Invalid or expired onboarding link.</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingFlow
      operatorName={`${operator.first_name} ${operator.last_name}`}
      operatorId={operator.id}
      initialStep={getCurrentStep(operator)}
      initialCompleted={getCompletedSteps(operator)}
      onStepComplete={(step) => stepMutation.mutate({ step })}
      onSignature={(name) => stepMutation.mutate({ step: 8, signatureName: name })}
    />
  );
};

export default OnboardPage;
