import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminGetUsersQueryKey } from "@workspace/api-client-react";

export function AdminNavbar() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
        setLocation("/admin/login");
      }
    }
  });

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-slate-900 text-white">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          <span className="font-display font-bold text-xl tracking-tight">LocalSite <span className="font-normal text-slate-400">Admin</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            End Admin Session
          </Button>
        </div>
      </div>
    </nav>
  );
}
