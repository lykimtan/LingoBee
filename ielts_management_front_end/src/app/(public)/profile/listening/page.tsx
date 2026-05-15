/**
 * Listening Profile Page
 */

"use client";

import { Navigation } from "@/components/Navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function ListeningProfilePage() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 max-w-6xl mx-auto px-8">
        <div className="mb-8">
          <p className="text-muted-foreground text-sm mb-2">LISTENING</p>
          <h1 className="text-4xl font-bold text-foreground mb-4">Listening Progress</h1>
        </div>

        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/20 p-8">
          <p className="text-muted-foreground">Listening section coming soon...</p>
        </div>
      </main>
    </div>
  );
}
