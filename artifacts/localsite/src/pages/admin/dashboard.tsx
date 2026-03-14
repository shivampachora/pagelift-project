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
import { Loader2, Edit, UserCircle, Wand2, Globe } from "lucide-react";
import type { AdminUser } from "@workspace/api-client-react";

const updateSchema = z.object({
  websiteUrl: z.string().optional().nullable(),
  planPrice: z.string().optional().nullable(),
  subscriptionStatus: z.string().optional().nullable(),
  nextPaymentDate: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof updateSchema>;

function RequestTypeBadge({ type }: { type: string | null | undefined }) {
  if (!type) return <span className="text-slate-400 italic text-sm">—</span>;
  if (type === "new_website_request") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
        <Wand2 className="w-3 h-3" /> New Request
      </span>
    );
  }
  if (type === "existing_website_link") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
        <Globe className="w-3 h-3" /> Link Existing
      </span>
    );
  }
  return <span className="text-slate-500 text-sm">{type}</span>;
}

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
          description: (error as any)?.response?.data?.error || "Could not update user",
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
        planPrice: editingUser.planPrice || "",
        subscriptionStatus: editingUser.subscriptionStatus || "PENDING",
        nextPaymentDate: editingUser.nextPaymentDate
          ? format(parseISO(editingUser.nextPaymentDate), "yyyy-MM-dd")
          : "",
      });
    }
  }, [editingUser, form]);

  const onSubmit = (values: FormValues) => {
    if (!editingUser) return;
    updateMutation.mutate({
      id: editingUser.id,
      data: {
        websiteUrl: values.websiteUrl || null,
        planPrice: values.planPrice || null,
        subscriptionStatus: values.subscriptionStatus || null,
        nextPaymentDate: values.nextPaymentDate ? new Date(values.nextPaymentDate).toISOString() : null,
      }
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
        <div className="container max-w-[1400px] mx-auto px-4">
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
                    <TableHead className="min-w-[160px]">Name</TableHead>
                    <TableHead className="min-w-[130px]">Mobile Number</TableHead>
                    <TableHead className="min-w-[160px]">Business Name</TableHead>
                    <TableHead className="min-w-[140px]">Request Type</TableHead>
                    <TableHead className="min-w-[180px]">Website URL</TableHead>
                    <TableHead className="min-w-[100px]">Plan</TableHead>
                    <TableHead className="min-w-[130px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Next Payment</TableHead>
                    <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!users?.length ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        No users found in the database.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-700 text-sm">{user.phone}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-800 text-sm">{user.businessName}</span>
                        </TableCell>
                        <TableCell>
                          <RequestTypeBadge type={user.requestType} />
                        </TableCell>
                        <TableCell>
                          {user.websiteUrl ? (
                            <a
                              href={user.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm truncate block max-w-[160px]"
                              title={user.websiteUrl}
                            >
                              {user.websiteUrl.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.planPrice
                            ? <span className="font-semibold text-slate-800">{user.planPrice}</span>
                            : <span className="text-slate-400 text-sm">—</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${getStatusColor(user.subscriptionStatus)} border-0 font-medium text-xs`}>
                            {user.subscriptionStatus?.replace(/_/g, ' ') || 'PENDING'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {user.nextPaymentDate ? format(parseISO(user.nextPaymentDate), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1.5" /> Edit
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
              Update subscription details for <span className="font-semibold">{editingUser?.businessName}</span>
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
