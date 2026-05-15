'use client';
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import {useAuthContext} from "@/context/AuthContext";


export function ProfileWidget() {
  const { user } = useAuthContext();
  const avatarUrl = user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] bg-white/5 p-4 shadow-sm backdrop-blur-md border border-white/10">
      {/* Profile Image & Info */}
      <div className="relative overflow-hidden rounded-[1.5rem] bg-[#0a1a1c]">
        <div className="aspect-[4/3] w-full bg-cover bg-center" style={{ backgroundImage: `url('${avatarUrl}')` }}></div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d20]/90 via-[#0b1d20]/40 to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <h3 className="text-lg font-medium">Sarah Jenkins</h3>
            <p className="text-xs text-white/70">Senior IELTS Teacher</p>
          </div>
          <div className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs backdrop-blur-md">
            4.9 ★ Rating
          </div>
        </div>
      </div>

      {/* Accordion Menu */}
      <div className="flex flex-col gap-2 rounded-[1.5rem] bg-[#0a1a1c] p-4 shadow-sm border border-white/5">
        <div className="flex items-center justify-between border-b border-white/10 border-dashed pb-3">
          <span className="text-sm font-medium text-white/90">Current Classes</span>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </div>

        <div className="flex flex-col gap-3 py-3 border-b border-white/10 border-dashed">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/90">Assigned Resources</span>
            <ChevronUp className="h-4 w-4 text-white/50" />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-2 shadow-sm border border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-12 rounded bg-[#ffb800]/20 flex items-center justify-center text-[#ffb800] font-bold text-xs border border-[#ffb800]/30">
                PDF
              </div>
              <div>
                <p className="text-xs font-medium text-white/90">IELTS Listening Test 4</p>
                <p className="text-[10px] text-white/50">Shared with 2 classes</p>
              </div>
            </div>
            <button className="p-1 text-white/40 hover:text-white/80">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-white/10 border-dashed py-3">
          <span className="text-sm font-medium text-white/90">Performance Summary</span>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </div>
        
        <div className="flex items-center justify-between pt-3">
          <span className="text-sm font-medium text-white/90">Teacher Benefits</span>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </div>
      </div>
    </div>
  );
}
