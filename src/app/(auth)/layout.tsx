import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your DealFlow CRM account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text">DealFlow CRM</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real Estate Deal Infrastructure Platform
          </p>
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DealFlow CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
