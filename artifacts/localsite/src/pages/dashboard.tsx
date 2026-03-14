import { useEffect } from "react";
import { useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe, useGetDashboard, useActivateSubscription } from "@workspace/api-client-react";
import { getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, CreditCard, Clock, Globe, Loader2, Rocket, CheckCircle2, LinkIcon, Hourglass } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, error: userError } = useGetMe({
    query: { retry: false }
  });

  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboard({
    query: { enabled: !!user, retry: false }
  });

  const activateMutation = useActivateSubscription({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        toast({ title: "Subscription Activated", description: "Your website is now live for 30 days." });
      },
      onError: (error) => {
        toast({
          title: "Activation failed",
          description: (error as any)?.response?.data?.error || "Could not activate",
          variant: "destructive"
        });
      }
    }
  });

  useEffect(() => {
    if (!isUserLoading && (userError || !user)) {
      setLocation("/login");
    }
  }, [user, userError, isUserLoading, setLocation]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
      </div>
    );
  }

  const isLoading = isDashboardLoading;
  const hasPlan = dashboard?.planPrice && dashboard?.subscriptionStatus;
  const isReadyForPayment = dashboard?.subscriptionStatus === "READY_FOR_PAYMENT";
  const requestType = dashboard?.requestType;

  const getStatusColor = (status: string | null | undefined) => {
    if (status === "ACTIVE") return "bg-green-500/10 text-green-700 border-green-500/20";
    if (status === "READY_FOR_PAYMENT") return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    if (status === "EXPIRED") return "bg-red-500/10 text-red-700 border-red-500/20";
    return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  };

  const renderPendingState = () => {
    if (requestType === "new_website_request") {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-100">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Website Request Received</h3>
          <p className="text-blue-700/80 max-w-md mx-auto leading-relaxed">
            Your request has been submitted successfully. Our team will review your business details and contact you shortly to prepare your website.
          </p>
        </div>
      );
    }
    if (requestType === "existing_website_link") {
      return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 text-center border border-indigo-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <LinkIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Website Connection Request Sent</h3>
          <p className="text-indigo-700/80 max-w-md mx-auto leading-relaxed">
            We are verifying your website details. Once approved, your dashboard will be updated with your active plan.
          </p>
        </div>
      );
    }
    // No request type yet — generic state
    return (
      <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Hourglass className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">We're preparing your website</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your website is being set up. Your subscription plan will be assigned soon.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/dashboard-pattern.png)`, opacity: 0.4 }}
      />
      <Navbar />

      <main className="flex-1 py-12 relative z-10">
        <div className="container max-w-4xl mx-auto px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your business website and subscription</p>
          </header>

          {isLoading ? (
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm space-y-6">
              <Skeleton className="h-8 w-1/3" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border/60 shadow-lg overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 border-b border-border/40 pb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 flex-wrap">
                      {dashboard?.businessName}
                      {dashboard?.subscriptionStatus && (
                        <Badge variant="outline" className={`${getStatusColor(dashboard.subscriptionStatus)} px-3 py-1 font-semibold`}>
                          {dashboard.subscriptionStatus.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </h2>

                    {dashboard?.websiteUrl ? (
                      <div className="mt-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <a
                          href={dashboard.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline inline-flex items-center gap-1.5"
                        >
                          {dashboard.websiteUrl}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-5 h-5" />
                        <span>Website URL not assigned yet</span>
                      </div>
                    )}
                  </div>

                  {isReadyForPayment && (
                    <Button
                      size="lg"
                      onClick={() => activateMutation.mutate()}
                      disabled={activateMutation.isPending}
                      className="shrink-0 bg-gradient-to-r from-primary to-accent shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      {activateMutation.isPending
                        ? <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        : <Rocket className="w-5 h-5 mr-2" />}
                      Activate Subscription
                    </Button>
                  )}
                </div>

                {!hasPlan ? (
                  renderPendingState()
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Plan Details
                      </div>
                      <div className="text-2xl font-bold">{dashboard.planPrice}/month</div>
                      <p className="text-sm text-muted-foreground">Professional Business Plan</p>
                    </div>

                    {dashboard.nextPaymentDate && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Next Payment
                        </div>
                        <div className="text-2xl font-bold">
                          {format(parseISO(dashboard.nextPaymentDate), "MMMM d, yyyy")}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {dashboard.subscriptionStatus === "ACTIVE" ? "Auto-renews securely" : "Awaiting payment"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {dashboard?.subscriptionStatus === "ACTIVE" && (
                <div className="bg-green-50/50 border-t border-green-100 p-6 flex items-center justify-center text-green-800 font-medium">
                  Your website is live and active. Your subscription is up to date!
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
