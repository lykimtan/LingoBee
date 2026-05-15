"use client";

import clsx from "clsx";

export type TeacherInvitation = {
  _id: string;
  status: string;
  message?: string;
  course?: {
    _id: string;
    title: string;
    category?: string;
    level?: string;
    status?: string;
  };
  invitedBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

interface TeacherInvitationsListProps {
  invitations: TeacherInvitation[];
  isLoading: boolean;
  error?: string | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  pendingIds: Set<string>;
}

const statusTone = (status: string) => {
  switch (status) {
    case "accepted":
      return "bg-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-red-100 text-red-600";
    case "pending":
    default:
      return "bg-amber-100 text-amber-700";
  }
};

export function TeacherInvitationsList({
  invitations,
  isLoading,
  error,
  onAccept,
  onReject,
  pendingIds,
}: TeacherInvitationsListProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-gray-500">
        Đang tải lời mời...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-gray-500">
        Không có lời mời nào.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {invitations.map((invite) => {
        const isPending = pendingIds.has(invite._id);
        return (
          <div
            key={invite._id}
            className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {invite.course?.title || "Khóa học"}
                </h3>
                <p className="text-sm text-gray-500">
                  {invite.course?.category} • {invite.course?.level}
                </p>
              </div>
              <span
                className={clsx(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                  statusTone(invite.status)
                )}
              >
                {invite.status}
              </span>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Mời bởi: {invite.invitedBy?.name || "Admin"} ({invite.invitedBy?.email || ""})
            </div>
            {invite.message && (
              <p className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                {invite.message}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={invite.status !== "pending" || isPending}
                onClick={() => onAccept(invite._id)}
                className={clsx(
                  "rounded-full px-4 py-2 text-xs font-semibold transition",
                  invite.status === "pending" && !isPending
                    ? "bg-[#1f6f5e] text-white hover:bg-[#2b806c]"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                Đồng ý
              </button>
              <button
                type="button"
                disabled={invite.status !== "pending" || isPending}
                onClick={() => onReject(invite._id)}
                className={clsx(
                  "rounded-full px-4 py-2 text-xs font-semibold transition",
                  invite.status === "pending" && !isPending
                    ? "border border-gray-200 text-gray-700 hover:bg-gray-100"
                    : "border border-gray-200 text-gray-400"
                )}
              >
                Từ chối
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
