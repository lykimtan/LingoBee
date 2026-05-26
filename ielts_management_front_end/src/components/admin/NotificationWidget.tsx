"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { NotificationItem } from "@/types";
import { notificationService } from "@/services/notificationService";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "@/context/AuthContext";
import { API_BASE_URL, STORAGE_KEYS } from "@/constants";



const formatDateLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Không rõ ngày";
    }

    return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatTimeLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export function NotificationWidget() {
    const { user } = useAuthContext();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const loadNotifications = async () => {
            setIsLoading(true);
            setError(null);
            const response = await notificationService.getNotifications(200);

            if (response.status === "success" && Array.isArray(response.data)) {
                setNotifications(response.data);
            } else {
                setError(response.message || "Không thể tải thông báo.");
            }
            setIsLoading(false);
        };

        void loadNotifications();
    }, []);

    useEffect(() => {
        const storedToken =
            typeof window === "undefined"
                ? null
                : localStorage.getItem(STORAGE_KEYS.USER_TOKEN) ||
                sessionStorage.getItem(STORAGE_KEYS.USER_TOKEN);

        if (!storedToken || !user?.id) {
            return;
        }

        socketRef.current = io(API_BASE_URL, {
            auth: { token: storedToken },
            transports: ["websocket"],
        });

        socketRef.current.on("notification:new", (payload: NotificationItem) => {
            if (payload !== user.id) {
                return;
            }

            setNotifications((prev) => {
                // Prevent duplicates if already fetched via API at same time
                const exists = prev.find(n => (n._id === payload._id) || (n.id === payload.id));
                if (exists) return prev;
                return [payload, ...prev];
            });
        });

        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [user?.id]);

    const groupedNotifications = useMemo(() => {
        const groups: { date: string; items: NotificationItem[] }[] = [];

        notifications.forEach((item) => {
            const dateLabel = item.createdAt
                ? formatDateLabel(item.createdAt)
                : "Không rõ ngày";
            const lastGroup = groups[groups.length - 1];

            if (!lastGroup || lastGroup.date !== dateLabel) {
                groups.push({ date: dateLabel, items: [item] });
                return;
            }

            lastGroup.items.push(item);
        });

        return groups;
    }, [notifications]);

    return (
        <div className="flex flex-col h-[680px] w-full overflow-hidden rounded-[2rem] bg-gray-900 text-white shadow-xl">
            <div className="flex items-center justify-between p-6 pb-4">
                <div>
                    <h3 className="text-lg font-medium">Thông báo</h3>
                    <p className="text-xs text-gray-400">
                        {notifications.length} thông báo
                    </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <Image
                        src="/teacher/notifications.gif"
                        alt="Đề thi tổng hợp"
                        width={50}
                        height={50}
                        unoptimized
                        className="h-8 w-auto"
                    />
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {isLoading && (
                    <div className="py-10 text-center text-sm text-gray-400">
                        Đang tải thông báo...
                    </div>
                )}
                {!isLoading && error && (
                    <div className="py-10 text-center text-sm text-red-400">{error}</div>
                )}
                {!isLoading && !error && groupedNotifications.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-400">
                        Chưa có thông báo nào.
                    </div>
                )}
                {!isLoading && !error && groupedNotifications.length > 0 && (
                    <div className="flex flex-col gap-6">
                        {groupedNotifications.map((group) => (
                            <div key={group.date} className="flex flex-col gap-3">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                                    {group.date}
                                </div>
                                <div className="flex flex-col gap-4">
                                    {group.items.map((item, idx) => (
                                        <div
                                            key={item._id || item.id || `${group.date}-${idx}`}
                                            className="flex items-start justify-between border-b border-gray-800 pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                                    <Bell className="h-4 w-4 text-gray-300" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-white">
                                                        {item.title || "Thông báo"}
                                                    </h4>
                                                    <p className="text-xs text-gray-400">
                                                        {item.message || "Không có nội dung."}
                                                    </p>
                                                    {item.createdAt && (
                                                        <p className="mt-1 text-[11px] text-gray-500">
                                                            {formatTimeLabel(item.createdAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {item.isRead === false && (
                                                <span className="mt-2 h-2 w-2 rounded-full bg-[#ffb800]" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
