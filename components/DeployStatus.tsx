"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle, ExternalLink, Copy, Globe } from "lucide-react";
import { useState } from "react";

interface DeployStatusProps {
  status: "idle" | "deploying" | "success" | "error";
  url?: string | null;
  error?: string | null;
}

export default function DeployStatus({ status, url, error }: DeployStatusProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {status !== "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-6 p-5 rounded-xl glass-card"
        >
          {status === "deploying" && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Deploying to Vercel...</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Building and deploying your project
                </p>
              </div>
            </div>
          )}

          {status === "success" && url && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-green-500">
                <div className="p-1 rounded-full bg-green-500/10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="font-semibold">Deployment Successful!</span>
              </div>
              
              <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                  <code className="text-sm text-primary break-all font-mono">
                    {url}
                  </code>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                    title="Copy URL"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                    title="Open website"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:text-primary transition-colors" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {status === "error" && error && (
            <div className="flex items-start gap-3 text-red-500">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Deployment Failed</p>
                <p className="text-sm mt-0.5 text-red-400">{error}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}