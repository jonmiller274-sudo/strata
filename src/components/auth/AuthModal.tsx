"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function AuthModal({ open, onClose, redirectTo }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const callbackUrl = `${window.location.origin}/auth/callback${
    redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""
  }`;

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // If successful, browser redirects to Google — no need to handle here
  }

  async function handleMagicLink() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {magicLinkSent ? (
          /* Magic link sent confirmation */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold">Check your email</h2>
            <p className="mt-2 text-sm text-muted">
              We sent a sign-in link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Click it to continue.
            </p>
            <button
              onClick={() => {
                setMagicLinkSent(false);
                setEmail("");
              }}
              className="mt-6 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* Sign in form */
          <>
            <h2 className="text-xl font-bold">
              Sign in to publish
            </h2>
            <p className="mt-1 text-sm text-muted">
              Create a free account to save and share your artifact.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={cn(
                "mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors",
                loading
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-card-hover"
              )}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Magic link */}
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              <button
                onClick={handleMagicLink}
                disabled={!email.trim() || loading}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  email.trim() && !loading
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-card text-muted cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Send magic link
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Free plan includes 2 published artifacts with Strata branding.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
