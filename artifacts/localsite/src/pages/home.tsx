import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { CheckCircle2, Globe, MapPin, MessageCircle, Image as ImageIcon, Store } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: Globe, title: "Mobile Friendly", desc: "Looks perfect on any device, phone or desktop." },
  { icon: MessageCircle, title: "WhatsApp Button", desc: "Customers can message you in one tap." },
  { icon: MapPin, title: "Google Maps", desc: "Help customers navigate directly to your shop." },
  { icon: ImageIcon, title: "Photo Gallery", desc: "Showcase your best products beautifully." },
  { icon: Store, title: "Business Info", desc: "Opening hours, address, and contact details." },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 -z-10">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
              alt="Background" 
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background to-background" />
          </div>

          <div className="container max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                Launch your business online today
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
                Get Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Business Website</span> In Minutes
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Professional website for your shop starting at <span className="font-bold text-foreground">₹199/month</span>. No coding required. We handle everything.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-primary/25 rounded-xl" asChild>
                  <Link href="/signup">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl bg-background/50 backdrop-blur-sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold">Everything you need to grow</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We provide all the essential features to make your shop stand out online and attract more customers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-card p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-gradient-to-br from-primary to-accent p-8 rounded-2xl shadow-xl shadow-primary/20 text-white flex flex-col justify-center"
              >
                <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
                <p className="text-primary-foreground/80 mb-6 flex-1">
                  Join hundreds of small businesses already online with LocalSite.
                </p>
                <Button variant="secondary" className="w-full text-primary hover:bg-white" asChild>
                  <Link href="/signup">Get Started Now</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 border-t border-border bg-white text-center">
        <p className="text-muted-foreground">© {new Date().getFullYear()} LocalSite. All rights reserved.</p>
      </footer>
    </div>
  );
}
