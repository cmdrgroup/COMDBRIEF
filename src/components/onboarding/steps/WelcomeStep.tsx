interface WelcomeStepProps {
  operatorName: string;
  onContinue: () => void;
  isCompleted: boolean;
  onAcknowledge: () => void;
}

const WelcomeStep = ({ operatorName, onContinue, onAcknowledge }: WelcomeStepProps) => {
  const handleCommence = () => {
    onAcknowledge();
    onContinue();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="animate-fade-in-up max-w-lg">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-command-gold rounded-sm flex items-center justify-center">
            <span className="font-heading text-2xl font-bold text-command-gold">C</span>
          </div>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-[0.15em] text-steel-white mb-3">
          Welcome to<br />The Commander's Passage
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-command-gold mb-8">
          Pre-Deployment Protocol
        </p>
        <p className="text-sm text-steel-white/70 leading-relaxed mb-8 max-w-md mx-auto">
          This briefing will prepare you for deployment. You will review your mission parameters,
          rules of engagement, and operational directives. Each section requires your acknowledgment
          before proceeding. Estimated completion time: 15–20 minutes.
        </p>
        <div className="mb-8 py-3 px-4 border border-gunmetal rounded-sm inline-block">
          <span className="font-mono text-xs text-slate-grey uppercase tracking-widest">Operator: </span>
          <span className="font-heading text-sm uppercase tracking-wider text-command-gold">{operatorName}</span>
        </div>
        <div>
          <button
            onClick={handleCommence}
            className="px-10 py-4 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-warning-red text-steel-white hover:bg-warning-red/90 transition-colors rounded-sm"
          >
            Commence Briefing →
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
