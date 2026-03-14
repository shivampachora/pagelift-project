import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRequestWebsite, useConnectWebsite } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Globe, Wand2, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

type ActionType = null | "new" | "connect";

const requestSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
});

const connectSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  websiteUrl: z.string().url("Please enter a valid URL (e.g. https://example.com)"),
});

export default function ChooseWebsiteAction() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [action, setAction] = useState<ActionType>(null);

  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { businessName: "" },
  });

  const connectForm = useForm<z.infer<typeof connectSchema>>({
    resolver: zodResolver(connectSchema),
    defaultValues: { businessName: "", websiteUrl: "" },
  });

  const requestMutation = useRequestWebsite({
    mutation: {
      onSuccess: () => {
        toast({ title: "Request submitted!", description: "Our team will contact you shortly." });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Submission failed",
          description: (error as any)?.response?.data?.error || "Please try again",
          variant: "destructive",
        });
      },
    },
  });

  const connectMutation = useConnectWebsite({
    mutation: {
      onSuccess: () => {
        toast({ title: "Connection request sent!", description: "We'll verify and update your dashboard." });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Submission failed",
          description: (error as any)?.response?.data?.error || "Please try again",
          variant: "destructive",
        });
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {!action ? (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    Account created
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">What would you like to do?</h1>
                  <p className="text-muted-foreground mt-2 text-base">Choose an option to get started with your business website.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Option 1 */}
                  <button
                    onClick={() => setAction("new")}
                    className="group w-full text-left bg-white border border-border/60 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Wand2 className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-foreground">Request My Business Website</h2>
                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                          Let our team create a professional website for your business.
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                    </div>
                    <div className="mt-5 ml-19">
                      <span className="inline-block bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg">
                        Continue
                      </span>
                    </div>
                  </button>

                  {/* Option 2 */}
                  <button
                    onClick={() => setAction("connect")}
                    className="group w-full text-left bg-white border border-border/60 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <Globe className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-foreground">Connect My Existing Website</h2>
                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                          Already have a website from us? Link it to your dashboard.
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                    </div>
                    <div className="mt-5">
                      <span className="inline-block bg-white border border-border text-foreground text-sm font-semibold px-5 py-2 rounded-lg group-hover:border-primary/40 transition-colors">
                        Continue
                      </span>
                    </div>
                  </button>
                </div>
              </motion.div>
            ) : action === "new" ? (
              <motion.div
                key="new-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl border border-border/60 shadow-lg p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wand2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">Request Your Website</h1>
                      <p className="text-muted-foreground text-sm">Our team will build a professional site for you.</p>
                    </div>
                  </div>

                  <Form {...requestForm}>
                    <form onSubmit={requestForm.handleSubmit((v) => requestMutation.mutate({ data: v }))} className="space-y-5">
                      <FormField
                        control={requestForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sharma Electronics" {...field} className="h-11 bg-slate-50/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setAction(null)}>
                          Back
                        </Button>
                        <Button type="submit" className="flex-1 h-11" disabled={requestMutation.isPending}>
                          {requestMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="connect-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl border border-border/60 shadow-lg p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">Connect Your Website</h1>
                      <p className="text-muted-foreground text-sm">Link your existing website to your dashboard.</p>
                    </div>
                  </div>

                  <Form {...connectForm}>
                    <form onSubmit={connectForm.handleSubmit((v) => connectMutation.mutate({ data: v }))} className="space-y-5">
                      <FormField
                        control={connectForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sharma Electronics" {...field} className="h-11 bg-slate-50/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={connectForm.control}
                        name="websiteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourbusiness.com" {...field} className="h-11 bg-slate-50/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setAction(null)}>
                          Back
                        </Button>
                        <Button type="submit" className="flex-1 h-11" disabled={connectMutation.isPending}>
                          {connectMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Request"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
