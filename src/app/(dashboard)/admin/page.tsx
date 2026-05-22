import type { Metadata } from "next";
import { Shield, Users, Building2, AlertTriangle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/analytics/kpi-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Platform administration and management",
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Panel" description="Platform administration and management" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Users" value="24" icon={Users} />
        <KpiCard title="Brokerages" value="3" icon={Building2} />
        <KpiCard title="Active Listings" value="156" icon={BarChart3} />
        <KpiCard title="Flagged Items" value="2" icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "User Management", description: "Manage users, roles, and permissions", href: "/admin/users", icon: Users },
          { title: "Brokerage Management", description: "Manage brokerage firms and plans", href: "/admin/brokerages", icon: Building2 },
          { title: "Content Moderation", description: "Review flagged properties", href: "/admin/moderation", icon: AlertTriangle },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-all hover:shadow-md hover-lift cursor-pointer h-full">
              <CardHeader>
                <div className="rounded-lg bg-primary/10 p-3 w-fit">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
