/**
 * Recent Activities Component
 * Shows user's recent learning activities
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { learningPathService } from "@/services/learningPathService";
import { Loader2 } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_review" | "in_progress";
  type: "listening" | "writing" | "speaking" | "reading";
  score?: number;
  date: string;
  icon: string;
}





const getStatusColor = (status: Activity["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-500/10 border-green-500/30 text-green-300";
    case "in_review":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-300";
    case "in_progress":
      return "bg-blue-500/10 border-blue-500/30 text-blue-300";
    default:
      return "bg-white/10 border-white/20 text-foreground";
  }
};

const getStatusLabel = (status: Activity["status"]) => {
  switch (status) {
    case "completed":
      return "✓ Completed";
    case "in_review":
      return "⏱️ In Review";
    case "in_progress":
      return "⟳ In Progress";
    default:
      return status;
  }
};

export const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // We use response.data.data because our API returns { success: true, data: [...] } inside axios response
        const response = await learningPathService.getRecentActivities();
        const responseData = response.data?.data || response.data; // Handle different axios formats

        if (responseData && Array.isArray(responseData)) {
          const mapped = responseData.map((item: any) => {
            let icon = "/profile/headphones.gif";
            if (item.type === "reading") icon = "/profile/reading.gif";
            if (item.type === "writing") icon = "/profile/writting.gif";
            if (item.type === "speaking") icon = "/profile/speaking.gif";

            let dateStr = "Chưa hoàn thành";
            if (item.date) {
              dateStr = new Date(item.date).toLocaleDateString("vi-VN");
            }

            return {
              id: item.id,
              title: item.title || "Bài học",
              description: item.description,
              status: item.status,
              type: item.type || "listening",
              date: dateStr,
              icon: icon
            };
          });
          setActivities(mapped);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/20 p-8 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white text-lg font-semibold">Nhiệm vụ gần đây</h3>
        <Link
          href="/profile/activities"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Xem lịch sử
        </Link>
      </div>

      <div className="space-y-4 flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-full py-8">
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-white/50 h-full flex items-center justify-center">
            Không có nhiệm vụ nào.
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {activity.icon.startsWith("/") ? (
                    <div className="relative w-10 h-10">
                      <Image
                        src={activity.icon}
                        alt={activity.title}
                        width={40}
                        height={40}
                        unoptimized
                        sizes="40px"
                        className="object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl">{activity.icon}</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                </div>
              </div>

              {/* Status and Score */}
              <div className="flex items-center gap-4 ml-4">
                {activity.score && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{activity.score}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                )}

                <div
                  className={`px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${getStatusColor(activity.status)}`}
                >
                  {getStatusLabel(activity.status)}
                </div>
              </div>
            </div>
          )))}
      </div>

      {/* View More Button */}
      <button className="w-full mt-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Load More Activities
      </button>
    </div>
  );
};
