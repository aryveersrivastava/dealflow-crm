"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Building2, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const steps = [
  { title: "Personal Info", icon: User },
  { title: "Brokerage", icon: Building2 },
  { title: "Welcome", icon: Check },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    brokerageName: "",
    city: "",
    reraNumber: "",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleComplete() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Onboarding failed");
        return;
      }

      setCurrentStep(2);
      toast.success("Welcome to DealFlow CRM!");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              i <= currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i <= currentStep ? "font-medium" : "text-muted-foreground"}`}>
              {step.title}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-8 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1" />

      {/* Step 1: Personal Info */}
      {currentStep === 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <Button
              className="w-full"
              onClick={() => setCurrentStep(1)}
              disabled={!formData.fullName || !formData.phone}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Brokerage */}
      {currentStep === 1 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Brokerage Information</CardTitle>
            <CardDescription>Set up your brokerage workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brokerageName">Brokerage Name</Label>
              <Input id="brokerageName" value={formData.brokerageName} onChange={(e) => updateField("brokerageName", e.target.value)} placeholder="ABC Realty" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Mumbai" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reraNumber">RERA Number (Optional)</Label>
              <Input id="reraNumber" value={formData.reraNumber} onChange={(e) => updateField("reraNumber", e.target.value)} placeholder="RERA registration" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleComplete}
                disabled={!formData.brokerageName || !formData.city || isLoading}
              >
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</> : "Complete Setup"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Welcome */}
      {currentStep === 2 && (
        <Card className="glass-card text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="h-10 w-10 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">Welcome to DealFlow CRM!</CardTitle>
            <CardDescription className="text-base">
              Your brokerage workspace is ready. Let&apos;s start closing deals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={() => router.push("/dashboard")}>
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
