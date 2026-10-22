import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="relative flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      <div className="absolute top-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Decorative ambient gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />

      {/* Left side: Premium Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 flex-col justify-between p-12">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/auth-bg.jpg" 
            alt="Abstract 3D Background" 
            className="object-cover w-full h-full opacity-50" 
          />
          {/* Constant dark overlay to ensure white text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-600 to-amber-900 shadow-[0_0_20px_rgba(217,119,6,0.5)] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M13 10l7.383 7.418c.823 .82 .823 2.148 0 2.967a2.11 2.11 0 0 1 -2.976 0l-7.407 -7.385" />
                <path d="M6 9l4 4" />
                <path d="M13 10l-4 -4" />
                <path d="M3 21h7" />
                <path d="M6.793 15.793l-3.586 -3.586a1 1 0 0 1 0 -1.414l2.293 -2.293l.5 .5l3 -3l-.5 -.5l2.293 -2.293a1 1 0 0 1 1.414 0l3.586 3.586a1 1 0 0 1 0 1.414l-2.293 2.293l-.5 -.5l-3 3l.5 .5l-2.293 2.293a1 1 0 0 1 -1.414 0" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Plataforma MPD</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Modelo de Prevención del Delito
          </h2>
          <p className="text-lg text-white/80 leading-relaxed font-light">
            Plataforma avanzada para la detección, evaluación y seguimiento de alertas de cumplimiento. Evidencia auditable, decisiones explicables.
          </p>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"/> Ley 20.393</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"/> Ley 21.595</span>
          </div>
        </div>
      </div>

      {/* Right side: Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10 px-4">
        {/* Animated Form Container */}
        <div className="w-full max-w-[420px]">
          <AnimatePresence mode="wait">
            {showSignIn ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.3 }}
              >
                <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.3 }}
              >
                <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
