"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import CanonicalDashboard from "@/components/atlas-fama/DashboardView";
import CanonicalProjects from "@/components/atlas-fama/ProjectsView";
import CanonicalDecisionEngine from "@/components/atlas-fama/DecisionEngineView";
import { ResearchView, PatentsView } from "@/components/atlas-fama/ResearchViews";
import { EngineeringView, CADView, ManufacturingView } from "@/components/atlas-fama/EngineeringViews";
import { FundingView, MarketingView, LegalView } from "@/components/atlas-fama/BusinessViews";
import { AnalyticsView, SettingsView, PricingView } from "@/components/atlas-fama/MiscViews";
import CanonicalSidebar from "@/components/atlas-fama/Sidebar";
import CanonicalTopBar from "@/components/atlas-fama/TopBar";
import CanonicalAssistant from "@/components/atlas-fama/FloatingAssistant";
import { AppProvider } from "@/components/atlas-fama/app-context-compat";
import type { ViewKey } from "@/components/atlas-fama/data";

const TITLES: Record<ViewKey, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Your AI invention company at a glance" }, projects: { title: "Projects & Departments", sub: "Every invention, every AI department, one engine" }, decisions: { title: "Decision Engine", sub: "Departments disagree, Atlas decides" }, research: { title: "Research", sub: "Market intelligence, competitors, customers and SWOT" }, patents: { title: "Patents", sub: "Search, patentability, monitoring and filing strategy" }, engineering: { title: "Engineering", sub: "Simulations, materials and technical analysis" }, cad: { title: "CAD Studio", sub: "Models, STEP/STL export, blueprints and BOM" }, manufacturing: { title: "Manufacturing", sub: "Suppliers, cost analysis and prototype planning" }, funding: { title: "Funding", sub: "Grants, investors, pitch decks and projections" }, marketing: { title: "Marketing", sub: "Brand, campaigns and launch planning" }, legal: { title: "Legal", sub: "AI-drafted documents with human review checkpoints" }, documents: { title: "Documents", sub: "Every file, version and generated artifact" }, analytics: { title: "Analytics", sub: "AI activity, launch readiness and insights" }, pricing: { title: "Plans", sub: "Choose how much of the company you hire" }, settings: { title: "Settings", sub: "Profile and preferences" }, admin: { title: "Admin", sub: "System control and support" },
};

export default function AtlasCanonicalPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.authHelpers.getCurrentUser, isAuthenticated ? {} : "skip");
  const inventions = useQuery(api.journeyEngine.getUserInventions, isAuthenticated ? {} : "skip");
  const [view, setView] = useState<ViewKey>("dashboard");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const active = inventions?.find((item) => item.status === "active");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/sign-in");
  }, [isAuthenticated, isLoading, router]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); return () => document.documentElement.classList.remove("dark"); }, [dark]);

  if (isLoading || !isAuthenticated || !user) return <div className="min-h-screen bg-background" />;

  const notify = (message: string) => setNotifications((current) => [message, ...current].slice(0, 8));
  const spend = (_amount: number, message: string) => notify(message);
  const approve = (id: string) => { setApprovedIds((current) => [...current, id]); notify("Approval recorded — dependent departments unblocked"); };
  const meta = TITLES[view];
  const userName = user.name || user.email?.split("@")[0] || "Inventor";

  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-[#0A1628] dark:text-white">
        <CanonicalSidebar view={view} setView={setView} credits={0} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-60">
          <CanonicalTopBar dark={dark} toggleDark={() => setDark((value) => !value)} onMenu={() => setSidebarOpen(true)} notifications={notifications} onSignIn={() => router.push("/sign-in")} />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {view !== "dashboard" && <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight">{meta.title}</h1><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{meta.sub}</p></div>}
            <div className="animate-fade-in" key={view}>
              {view === "dashboard" && <CanonicalDashboard approvedIds={approvedIds} onApprove={approve} setView={setView} userName={userName} />}
              {view === "projects" && <CanonicalProjects />}
              {view === "decisions" && <CanonicalDecisionEngine />}
              {view === "research" && <ResearchView />}
              {view === "patents" && <PatentsView credits={0} spend={spend} />}
              {view === "engineering" && <EngineeringView />}
              {view === "cad" && <CADView credits={0} spend={spend} />}
              {view === "manufacturing" && <ManufacturingView />}
              {view === "funding" && <FundingView spend={spend} />}
              {view === "marketing" && <MarketingView />}
              {view === "legal" && <LegalView credits={0} spend={spend} generatedDocs={[]} onGenerated={(name) => notify(`${name} queued`)} />}
              {view === "analytics" && <AnalyticsView />}
              {view === "pricing" && <PricingView currentPlan={user.subscriptionTier || "free"} onSelect={(plan) => notify(`Plan selected: ${plan}`)} />}
              {view === "settings" && <SettingsView dark={dark} toggleDark={() => setDark((value) => !value)} />}
              {view === "documents" && <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Document Hub is being connected to Convex storage next; the canonical view shell is in place.</div>}
            </div>
          </main>
        </div>
        <CanonicalAssistant />
      </div>
    </AppProvider>
  );
}
