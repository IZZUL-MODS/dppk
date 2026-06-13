"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Copy, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TokenManagerProps {
  onTokenSaved?: () => void;
}

export default function TokenManager({ onTokenSaved }: TokenManagerProps) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const res = await fetch("/api/token");
      const data = await res.json();
      setHasToken(data.hasToken);
    } catch (error) {
      console.error("Failed to check token:", error);
    }
  };

  const saveToken = async () => {
    if (!token.trim()) {
      setMessage({ type: "error", text: "Token cannot be empty" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Token saved successfully!" });
        setToken("");
        setHasToken(true);
        onTokenSaved?.();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save token" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteToken = async () => {
    if (!confirm("Are you sure you want to delete the stored token?")) return;

    try {
      const res = await fetch("/api/token", { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Token deleted successfully!" });
        setHasToken(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete token" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Vercel Token</h3>
          <p className="text-xs text-muted-foreground">
            {hasToken ? "✓ Token configured" : "⚡ Token not configured"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your Vercel API token"
            className="w-full px-4 py-2.5 pr-20 rounded-xl bg-card/50 border border-primary/30 
              text-foreground placeholder:text-muted-foreground focus:outline-none 
              focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
          <button
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
          >
            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveToken}
            disabled={isSaving || !token.trim()}
            className="flex-1 py-2 rounded-xl bg-primary text-white font-medium text-sm
              hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <div className="spinner-premium mx-auto" /> : "Save Token"}
          </button>
          
          {hasToken && (
            <button
              onClick={deleteToken}
              className="px-4 py-2 rounded-xl border border-red-500/50 text-red-500
                hover:bg-red-500/10 transition-all text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                message.type === "success" 
                  ? "bg-green-500/10 text-green-500" 
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Get your token from{" "}
        <a 
          href="https://vercel.com/account/tokens" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Vercel Dashboard → Settings → Tokens
        </a>
      </p>
    </div>
  );
}