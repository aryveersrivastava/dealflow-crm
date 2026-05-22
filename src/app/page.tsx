import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  ClipboardList,
  Zap,
  KanbanSquare,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  Shield,
  Globe,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "DealFlow CRM — Real Estate Deal Infrastructure Platform",
  description:
    "Scalable requirement-driven Real Estate Deal Infrastructure Platform. Digitize broker workflows, buyer requirements, property matching, CRM pipelines, and deal execution.",
};

const features = [
  {
    icon: ClipboardList,
    title: "Requirement Marketplace",
    description:
      "Post and discover buyer requirements. Connect demand with supply across your brokerage network.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Smart Matching Engine",
    description:
      "AI-ready weighted scoring algorithm matches properties to requirements across 5 dimensions automatically.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: KanbanSquare,
    title: "CRM Pipeline",
    description:
      "Visual Kanban deal pipeline from lead to close. Track follow-ups, site visits, and negotiations.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Broker Collaboration",
    description:
      "Share listings, co-broke deals, and collaborate with your team through an activity feed.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time KPIs, conversion metrics, agent leaderboards, and revenue pipeline insights.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Shield,
    title: "Multi-Tenant SaaS",
    description:
      "Enterprise-grade tenant isolation with dual-layer security. Each brokerage gets its own workspace.",
    color: "from-rose-500 to-red-500",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    description: "For small teams getting started",
    features: [
      "Up to 5 users",
      "100 property listings",
      "50 requirements",
      "Basic matching",
      "CRM pipeline",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹4,999",
    period: "/month",
    description: "For growing brokerages",
    features: [
      "Up to 25 users",
      "Unlimited listings",
      "Unlimited requirements",
      "Advanced matching",
      "Analytics dashboard",
      "Email notifications",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large brokerage networks",
    features: [
      "Unlimited users",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantees",
      "White-label options",
      "API access",
      "Custom workflows",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">DealFlow CRM</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
              Sign In
            </Link>
            <Link href="/signup" className={cn(buttonVariants())}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            🚀 Built for Modern Real Estate Brokerages
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Transform Your{" "}
            <span className="gradient-text">Real Estate</span>{" "}
            Business
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The only platform that connects buyer requirements with properties,
            manages your deal pipeline, and powers broker collaboration — all in
            one scalable SaaS solution.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base")}>
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Watch Demo
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Free forever plan available
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to close more deals
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              From requirement discovery to deal closure, DealFlow CRM digitizes every step of the broker workflow.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover-lift"
              >
                <CardHeader>
                  <div
                    className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "500+", label: "Brokerages" },
              { value: "10K+", label: "Properties Listed" },
              { value: "5K+", label: "Deals Closed" },
              { value: "98%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold gradient-text sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free and scale as your brokerage grows.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${
                  tier.highlighted
                    ? "border-primary shadow-lg scale-105 ring-1 ring-primary/20"
                    : "border-border/50"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ variant: tier.highlighted ? "default" : "outline" }),
                      "w-full mt-8"
                    )}
                  >
                    {tier.cta}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your brokerage?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join 500+ brokerages already using DealFlow CRM to close more deals.
          </p>
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 px-8 text-base")}>
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Zap className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">DealFlow CRM</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DealFlow CRM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
