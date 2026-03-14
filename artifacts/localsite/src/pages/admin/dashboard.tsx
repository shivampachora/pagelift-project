import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { AdminNavbar } from "@/components/layout/admin-navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminGetUsers, useAdminUpdateUser } from "@workspace/api-client-react";
import { getAdminGetUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, UserCircle } from "lucide-react";
import type { AdminUser } from "@workspace/api-client-react";

const updateSchema = z.object({
  websiteUrl: z.string().optional().nullable(),
  planPrice: z.string().optional().nullable(),
  subscriptionStatus: z.string().optional().nullable(),
  nextPaymentDate: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof updateSchema>;

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const { data: users, isLoading, error } = useAdminGetUsers({
    query: { retry: false }
  });

  useEffect(() => {
    if (!isLoading && error) {
      setLocation("/admin/login");
    }
  }, [error, isLoading, setLocation]);

  const updateMutation = useAdminUpdateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
        toast({ title: "User updated successfully" });
        setEditingUser(null);
      },
      onError: (error) => {
        toast({ 
          title: "Update failed", 
          description: error.response?.data?.error || "Could not update user",
          variant: "destructive" 
        });
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      websiteUrl: "",
      planPrice: "",
      subscriptionStatus: "",
      nextPaymentDate: "",
    }
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        websiteUrl: editingUser.websiteUrl || "",
        planPrice: editingUser.planPrice || "₹199",
        subscriptionStatus: editingUser.subscriptionStatus || "PENDING",
        nextPaymentDate: editingUser.nextPaymentDate 
          ? format(parseISO(editingUser.nextPaymentDate), "yyyy-MM-dd") 
          : "",
      });
    }
  }, [editingUser, form]);

  const onSubmit = (values: FormValues) => {
    if (!editingUser) return;
    
    // Convert empty strings to null for backend
    const dataToSubmit = {
      websiteUrl: values.websiteUrl || null,
      planPrice: values.planPrice || null,
      subscriptionStatus: values.subscriptionStatus || null,
      // If date is provided, append time to make it a valid ISO timestamp if required, 
      // or backend accepts date strings. The schema expects a string.
      nextPaymentDate: values.nextPaymentDate ? new Date(values.nextPaymentDate).toISOString() : null,
    };

    updateMutation.mutate({ 
      id: editingUser.id, 
      data: dataToSubmit 
    });
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (status === "ACTIVE") return "bg-green-100 text-green-700";
    if (status === "READY_FOR_PAYMENT") return "bg-yellow-100 text-yellow-700";
    if (status === "EXPIRED") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AdminNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AdminNavbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">Users Management</h1>
              <p className="text-muted-foreground mt-1">Manage subscriptions, plan prices, and statuses.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-700">{users?.length || 0} Total Users</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Website URL</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!users?.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No users found in the database.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="font-medium text-slate-900">{user.businessName}</div>
                          <div className="text-sm text-slate-500">{user.name} • {user.email}</div>
                        </TableCell>
                        <TableCell>
                          {user.websiteUrl ? (
                            <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {user.websiteUrl.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.planPrice ? <span className="font-medium">{user.planPrice}</span> : <span className="text-slate-400">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${getStatusColor(user.subscriptionStatus)} border-0 font-medium`}>
                            {user.subscriptionStatus?.replace(/_/g, ' ') || 'PENDING'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.nextPaymentDate ? format(parseISO(user.nextPaymentDate), "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update subscription details for {editingUser?.businessName}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="planPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Price</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="₹199">₹199 / month</SelectItem>
                          <SelectItem value="₹299">₹299 / month</SelectItem>
                          <SelectItem value="₹499">₹499 / month</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subscriptionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="READY_FOR_PAYMENT">Ready For Payment</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="EXPIRED">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nextPaymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
