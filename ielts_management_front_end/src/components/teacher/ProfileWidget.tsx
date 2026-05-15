"use client";

import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

export function ProfileWidget() {
  const { user } = useAuthContext();
  const avatarUrl = user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] bg-white/40 p-4 shadow-sm backdrop-blur-md border border-white/60">
      {/* Profile Image & Info */}
      <div className="relative overflow-hidden rounded-[1.5rem] bg-gray-200">
        <div
          className="aspect-[4/3] w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${avatarUrl}')` }}
        ></div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <h3 className="text-lg font-medium">{user?.name || "Teacher"}</h3>
            <p className="text-xs text-white/80">Senior IELTS Teacher</p>
          </div>
          <div className="rounded-full border border-white/30 px-3 py-1 text-xs backdrop-blur-sm">
            4.9 ★ Rating
          </div>
        </div>
      </div>

      {/* Accordion Menu */}
      <div className="flex flex-col gap-2 rounded-[1.5rem] bg-white/60 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 border-dashed pb-3">
          <span className="text-sm font-medium text-gray-800">Current Classes</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>

        <div className="flex flex-col gap-3 py-3 border-b border-gray-200 border-dashed">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">Assigned Resources</span>
            <ChevronUp className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white p-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-12 rounded bg-red-50 flex items-center justify-center text-red-500 font-bold text-xs">
                PDF
              </div>
              <div>
                <p className="text-xs font-medium">IELTS Listening Test 4</p>
                <p className="text-[10px] text-gray-500">Shared with 2 classes</p>
              </div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-200 border-dashed py-3">
          <span className="text-sm font-medium text-gray-800">Performance Summary</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        
        <div className="flex items-center justify-between pt-3">
          <span className="text-sm font-medium text-gray-800">Teacher Benefits</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
}
