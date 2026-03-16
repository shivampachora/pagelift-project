import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export function Navbar() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({ query: { retry: false, refetchOnWindowFocus: false } });
  
  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.clear();
        setLocation("/");
      }
    }
  });

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md">
            <Globe className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">PageLift</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground hidden md:block">
                {user.businessName}
              </span>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="shadow-md shadow-primary/20" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
