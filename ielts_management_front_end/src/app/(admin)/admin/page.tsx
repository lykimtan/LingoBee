import { TopStats } from "@/components/admin/TopStats";
import { ProfileWidget } from "@/components/admin/ProfileWidget";
import { ActivityChartWidget } from "@/components/admin/ActivityChartWidget";
import { NotificationWidget } from "@/components/admin/NotificationWidget";
import { ScheduleWidget } from "@/components/admin/ScheduleWidget";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <TopStats />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2.5fr_1fr] mt-2">
        {/* Left Column - Profile */}
        <div className="flex flex-col">
          <ProfileWidget />
        </div>

        {/* Center Column - Charts & Schedule */}
        <div className="flex flex-col gap-6">
          <ActivityChartWidget />

          <div className="mt-2">
            <ScheduleWidget />
          </div>
        </div>

        {/* Right Column - Tasks */}
        <div className="flex flex-col h-full min-h-[500px]">
          <NotificationWidget />
        </div>
      </div>
    </div>
  );
}
