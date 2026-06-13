"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import FileUploader from "@/components/FileUploader";
import DeployStatus from "@/components/DeployStatus";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Rocket, FolderGit2, Globe, Zap, Shield, Server } from "lucide-react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState<"idle" | "deploying" | "success" | "error">("idle");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDeploy = useCallback(async () => {
    if (!file) {
      setErrorMsg("Please select a ZIP file");
      setStatus("error");
      return;
    }
    
    if (!projectName.trim()) {
      setErrorMsg("Please enter a project name");
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
  }, [file, projectName]);

  const features = [
    { icon: FolderGit2, title: "Easy Upload", desc: "Drag & drop your ZIP file" },
    { icon: Globe, title: "Vercel Domain", desc: "Get your-project.vercel.app" },
    { icon: Zap, title: "Fast Deploy", desc: "Deployment in seconds" },
    { icon: Shield, title: "Secure", desc: "Your files are safe" },
    { icon: Server, title: "Global CDN", desc: "Powered by Vercel" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticlesBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Vercel Deployer</span>
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Deploy your projects instantly for free
            </p>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 md:p-8 shadow-2xl"
        >
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
              className="w-full px-4 py-3 rounded-xl bg-card/50 border border-primary/30 
                text-foreground placeholder:text-muted-foreground focus:outline-none 
                focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your site will be available at: <span className="text-primary font-mono">
                {projectName ? projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-") : "your-project"}.vercel.app
              </span>
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-8">
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
            disabled={status === "deploying"}
            className="w-full py-3 rounded-xl btn-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "deploying" ? (
              <>
                <div className="spinner" />
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

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="glass rounded-xl p-4 text-center"
            >
              <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-xs text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted-foreground mt-8 py-4 border-t border-primary/20"
        >
          <p>Powered by Vercel API • Deploy Next.js, React, Vue, and static sites</p>
          <p className="mt-1">© 2024 Vercel Deployer • Free deployment platform</p>
        </motion.footer>
      </div>
    </main>
  );
}