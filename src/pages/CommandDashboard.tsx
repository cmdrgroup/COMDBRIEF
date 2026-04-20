import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Copy, Eye, Check, Users, Clock, CheckCircle2, AlertCircle, LogOut, ListChecks, Phone, Target, MapPin } from "lucide-react";
import { getAllOperators, createOperator, getCompletedCount, type Operator } from "@/lib/operators";
import { STEP_NAMES } from "@/data/onboardingContent";
import { supabase } from "@/integrations/supabase/client";
import OperatorDetail from "@/components/dashboard/OperatorDetail";
import DeploymentCallScreen from "@/components/dashboard/DeploymentCallScreen";

type View = "operators" | "call";

const CommandDashboard = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("operators");
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [callOperatorId, setCallOperatorId] = useState<string | undefined>();
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = newFirst.trim().length > 0 && newLast.trim().length > 0 && isValidEmail(newEmail);

  const { data: operators = [], isLoading } = useQuery({
    queryKey: ["operators"],
    queryFn: getAllOperators,
  });

  const createMutation = useMutation({
    mutationFn: () => createOperator(newFirst, newLast, newEmail),
    onSuccess: (op) => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      setShowAddForm(false);
      setNewFirst(""); setNewLast(""); setNewEmail("");
      navigator.clipboard.writeText(`${window.location.origin}/onboard/${op.slug}`);
      setCopiedId(op.id);
      setTimeout(() => setCopiedId(null), 3000);
    },
  });

  const stats = {
    total: operators.length,
    completed: operators.filter((o) => o.status === "complete").length,
    inProgress: operators.filter((o) => o.status === "in_progress").length,
    notStarted: operators.filter((o) => o.status === "not_started").length,
  };

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/onboard/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      complete: "bg-field-green/20 text-field-green border-field-green/30",
      in_progress: "bg-command-gold/20 text-command-gold border-command-gold/30",
      not_started: "bg-gunmetal text-slate-grey border-gunmetal",
    };
    const labels: Record<string, string> = { complete: "COMPLETE", in_progress: "IN PROGRESS", not_started: "NOT STARTED" };
    return (
      <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm border ${styles[status] || styles.not_started}`}>
        {labels[status] || "UNKNOWN"}
      </span>
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/command/login";
  };

  if (view === "call") {
    return <DeploymentCallScreen operatorId={callOperatorId} onBack={() => setView("operators")} />;
  }

  const sideNavItems = [
    { key: "operators" as View, label: "👥 All Operators", icon: Users },
    { key: "call" as View, label: "📞 Call Prep", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="classified-strip flex items-center justify-between">
        <span>⬛ COMMAND DASHBOARD — CMDR GROUP — OPERATOR STATUS</span>
        <button onClick={handleLogout} className="flex items-center gap-1 text-slate-grey hover:text-steel-white transition-colors">
          <LogOut className="w-3 h-3" />
          <span className="text-[10px] uppercase tracking-widest">Logout</span>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 border-r border-gunmetal min-h-[calc(100vh-2rem)] p-3 space-y-1">
          {sideNavItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setView(item.key); if (item.key === "call") setCallOperatorId(undefined); }}
              className={`w-full text-left px-3 py-2 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors ${
                view === item.key ? "bg-command-gold/10 text-command-gold" : "text-slate-grey hover:text-steel-white hover:bg-tactical-steel/30"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="section-header">Command Dashboard</h1>
              <p className="text-sm text-slate-grey mt-1">Operator deployment status overview</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-warning-red text-steel-white font-heading text-xs uppercase tracking-widest hover:bg-warning-red/90 transition-colors rounded-sm"
            >
              <Plus className="w-4 h-4" /> Add Operator
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Operators", value: stats.total, icon: Users, color: "text-steel-white" },
              { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-field-green" },
              { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-command-gold" },
              { label: "Not Started", value: stats.notStarted, icon: AlertCircle, color: "text-slate-grey" },
            ].map((stat) => (
              <div key={stat.label} className="directive-card">
                <div className="flex items-center gap-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="font-heading text-2xl font-bold text-steel-white">{stat.value}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-grey">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="directive-card mb-6 animate-fade-in-up">
              <h3 className="font-heading text-sm uppercase tracking-wider text-command-gold mb-4">Add New Operator</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={newFirst} onChange={(e) => setNewFirst(e.target.value)} placeholder="First Name" className="bg-background border border-gunmetal rounded-sm px-3 py-2 text-sm text-steel-white focus:outline-none focus:border-command-gold" />
                <input value={newLast} onChange={(e) => setNewLast(e.target.value)} placeholder="Last Name" className="bg-background border border-gunmetal rounded-sm px-3 py-2 text-sm text-steel-white focus:outline-none focus:border-command-gold" />
                <div className="flex flex-col">
                  <input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Email"
                    className={`bg-background border rounded-sm px-3 py-2 text-sm text-steel-white focus:outline-none focus:border-command-gold ${
                      newEmail && !isValidEmail(newEmail) ? "border-warning-red" : "border-gunmetal"
                    }`}
                  />
                  {newEmail && !isValidEmail(newEmail) && (
                    <span className="text-warning-red text-xs mt-1">Invalid email format</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!canSubmit || createMutation.isPending}
                className="mt-4 px-6 py-2 bg-command-gold text-background font-heading text-xs uppercase tracking-widest hover:bg-command-gold/90 transition-colors rounded-sm disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Generate Link"}
              </button>
            </div>
          )}

          {/* Operator Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="font-mono text-xs text-slate-grey uppercase tracking-widest">Loading operators...</p>
            </div>
          ) : operators.length === 0 ? (
            <div className="directive-card text-center py-12">
              <p className="text-slate-grey mb-2">No operators yet.</p>
              <p className="text-xs text-slate-grey">Click "Add Operator" to create the first onboarding link.</p>
            </div>
          ) : (
            <div className="directive-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gunmetal">
                    {["Name", "Email", "Enrolled", "Status", "Progress", "Last Active", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 font-mono text-[10px] uppercase tracking-widest text-slate-grey">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {operators.map((op) => {
                    const completedCount = getCompletedCount(op);
                    return (
                      <tr key={op.id} className="border-b border-gunmetal/50 hover:bg-tactical-steel/30 transition-colors">
                        <td className="py-3 px-3 font-heading text-sm tracking-wider text-steel-white">
                          {op.first_name} {op.last_name}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-grey">{op.email}</td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-grey">
                          {new Date(op.enrolled_at).toLocaleDateString("en-AU")}
                        </td>
                        <td className="py-3 px-3">{statusBadge(op.status)}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gunmetal rounded-full overflow-hidden">
                              <div
                                className="h-full bg-command-gold rounded-full transition-all"
                                style={{ width: `${(completedCount / 10) * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-grey">{completedCount}/10</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-grey">
                          {op.last_active_at
                            ? new Date(op.last_active_at).toLocaleDateString("en-AU", { day: "2-digit", month: "short" })
                            : "—"}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelectedOperator(op)} className="p-1.5 hover:bg-gunmetal rounded-sm transition-colors" title="View Details">
                              <Eye className="w-3.5 h-3.5 text-slate-grey" />
                            </button>
                            <button onClick={() => { setCallOperatorId(op.id); setView("call"); }} className="p-1.5 hover:bg-gunmetal rounded-sm transition-colors" title="Call Prep">
                              <Phone className="w-3.5 h-3.5 text-slate-grey" />
                            </button>
                            <button onClick={() => copyLink(op.slug, op.id)} className="p-1.5 hover:bg-gunmetal rounded-sm transition-colors" title="Copy Link">
                              {copiedId === op.id ? <Check className="w-3.5 h-3.5 text-field-green" /> : <Copy className="w-3.5 h-3.5 text-slate-grey" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Operator Detail Modal */}
          {selectedOperator && (
            <OperatorDetail
              operator={selectedOperator}
              onClose={() => setSelectedOperator(null)}
            />
          )}
        </div>
      </div>
      <div className="noise-overlay" />
    </div>
  );
};

export default CommandDashboard;
