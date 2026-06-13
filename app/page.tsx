"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import FileUploader from "@/components/FileUploader";
import DeployStatus from "@/components/DeployStatus";
import ParticlesBackground from "@/components/ParticlesBackground";
import TokenManager from "@/components/TokenManager";
import { Rocket, FolderGit2, Globe, Zap, Shield, Server, CheckCircle } from "lucide-react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState<"idle" | "deploying" | "success" | "error">("idle");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    checkTokenStatus();
  }, []);

  const checkTokenStatus = async () => {
    try {
      const res = await fetch("/api/token");
      const data = await res.json();
      setHasToken(data.hasToken);
    } catch (error) {
      console.error("Failed to check token:", error);
    }
  };

  const handleDeploy = useCallback(async () => {
    if (!file) {
      setErrorMsg("Please select a ZIP file to deploy");
      setStatus("error");
      return;
    }
    
    if (!projectName.trim()) {
      setErrorMsg("Please enter a project name");
      setStatus("error");
      return;
    }

    if (!hasToken) {
      setErrorMsg("Please configure Vercel token first");
      setStatus("error");
      return;
    }

    setStatus("deploying");
    setErrorMsg(null);
    setDeployUrl(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectName", projectName.trim());

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Deployment failed");
      }

      setDeployUrl(result.url);
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }, [file, projectName, hasToken]);

  const features = [
    { icon: FolderGit2, title: "Easy Upload", desc: "Drag & drop your ZIP file", color: "text-emerald-400" },
    { icon: Globe, title: "Vercel Domain", desc: "Get your-project.vercel.app", color: "text-blue-400" },
    { icon: Zap, title: "Fast Deploy", desc: "Deployment in seconds", color: "text-yellow-400" },
    { icon: Shield, title: "Secure", desc: "Your files are safe", color: "text-purple-400" },
    { icon: Server, title: "Global CDN", desc: "Powered by Vercel", color: "text-indigo-400" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticlesBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="gradient-text">Vercel Deployer</span>
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Deploy your projects instantly for free
            </p>
          </div>
          <ThemeToggle />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-premium rounded-2xl p-6 shadow-2xl"
            >
              {/* Token Status Banner */}
              {!hasToken && (
                <div className="mb-6 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please configure your Vercel token in the sidebar to start deploying</span>
                </div>
              )}

              {/* Project Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Project Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="input-premium w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your site will be at: <span className="text-primary font-mono">
                    {projectName ? projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-") : "your-project"}.vercel.app
                  </span>
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Project ZIP File <span className="text-primary">*</span>
                </label>
                <FileUploader onFileSelect={setFile} isUploading={status === "deploying"} />
              </div>

              {/* Deploy Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeploy}
                disabled={status === "deploying" || !hasToken}
                className="btn-glow w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "deploying" ? (
                  <>
                    <div className="spinner-premium" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Deploy to Vercel
                  </>
                )}
              </motion.button>

              {/* Status */}
              <DeployStatus status={status} url={deployUrl} error={errorMsg} />
            </motion.div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TokenManager onTokenSaved={checkTokenStatus} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Quick Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-primary/5">
                  <p className="text-2xl font-bold text-primary">⚡ Instant</p>
                  <p className="text-xs text-muted-foreground">Deployment under 30s</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5">
                  <p className="text-2xl font-bold text-primary">🌍 Global</p>
                  <p className="text-xs text-muted-foreground">Vercel edge network</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5">
                  <p className="text-2xl font-bold text-primary">🎯 Free</p>
                  <p className="text-xs text-muted-foreground">No credit card</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="glass-card p-4 text-center"
            >
              <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-2`} />
              <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8 py-4 border-t border-primary/20"
        >
          <p>Powered by Vercel API • Deploy Next.js, React, Vue, and static sites</p>
        </motion.footer>
      </div>
    </main>
  );
}