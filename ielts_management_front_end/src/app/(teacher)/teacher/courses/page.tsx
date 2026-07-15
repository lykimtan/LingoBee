"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TeacherCoursesHeader } from "@/components/teacher/courses/TeacherCoursesHeader";
import {
	TeacherCoursesSidebar,
	TeacherCoursesTab,
} from "@/components/teacher/courses/TeacherCoursesSidebar";
import {
	TeacherCoursesList,
} from "@/components/teacher/courses/TeacherCoursesList";
import {
	TeacherInvitationsList,
} from "@/components/teacher/courses/TeacherInvitationsList";

import { invitationService } from "@/services/invatationService";
import { courseService } from "@/services/courseService";
import { ScheduleWidget } from "@/components/teacher/ScheduleWidget";

import { TeacherInvitation, TeacherCourseItem } from "@/types";

export default function TeacherCoursesPage() {
	const [activeTab, setActiveTab] = useState<TeacherCoursesTab>("my-courses");
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
	const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
	const [coursesLoading, setCoursesLoading] = useState(true);
	const [invitationsLoading, setInvitationsLoading] = useState(true);
	const [coursesError, setCoursesError] = useState<string | null>(null);
	const [invitationsError, setInvitationsError] = useState<string | null>(null);
	const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

	const filteredCourses = useMemo(() => {
		let list = courses;
		if (filterStatus === "all") {
			list = courses.filter(c => c.status !== 'invited');
		} else {
			list = courses.filter((c) => c.status === filterStatus);
		}

		return [...list].sort((a, b) => {
			const dateA = (a.createdAt || a.updatedAt) ? new Date(a.createdAt || a.updatedAt!).getTime() : 0;
			const dateB = (b.createdAt || b.updatedAt) ? new Date(b.createdAt || b.updatedAt!).getTime() : 0;
			return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
		});
	}, [courses, filterStatus, sortOrder]);

	const loadCourses = useCallback(async () => {
		setCoursesLoading(true);
		setCoursesError(null);
		const response = await courseService.getMyCourses();
		if (response.status === "success" && Array.isArray(response.data)) {
			setCourses(response.data);
		} else {
			setCoursesError(response.message || "Không thể tải danh sách khóa học.");
		}
		setCoursesLoading(false);
	}, []);

	const loadInvitations = useCallback(async () => {
		setInvitationsLoading(true);
		setInvitationsError(null);
		const response = await invitationService.getInvitations();
		if (response.status === "success" && Array.isArray(response.data)) {
			setInvitations(response.data);
		} else {
			setInvitationsError(response.message || "Không thể tải lời mời.");
		}
		setInvitationsLoading(false);
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadCourses();
		void loadInvitations();
	}, [loadCourses, loadInvitations]);

	const handleInvitationAction = useCallback(
		async (id: string, action: "accept" | "reject") => {
			setPendingIds((prev) => new Set(prev).add(id));
			const response = await invitationService.respondToInvitation(id, action);
			setPendingIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});

			if (response.status === "success") {
				await loadInvitations();
				await loadCourses();
			}
		},
		[loadCourses, loadInvitations]
	);

	const tabContent = useMemo(() => {
		if (activeTab === "invitations" || activeTab === "assistant-invitations") {
			const filteredInvitations = invitations.filter((i) =>
				activeTab === "assistant-invitations"
					? i.role === "assistant"
					: i.role !== "assistant"
			);

			return (
				<TeacherInvitationsList
					invitations={filteredInvitations}
					isLoading={invitationsLoading}
					error={invitationsError}
					onAccept={(id) => handleInvitationAction(id, "accept")}
					onReject={(id) => handleInvitationAction(id, "reject")}
					pendingIds={pendingIds}
				/>
			);
		}

		return (
			<div className="flex flex-col gap-4 w-full">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h3 className="text-lg font-bold text-gray-900">Danh sách khóa học</h3>
					<div className="flex flex-wrap items-center gap-2">
						{[
							{ value: "all", label: "Tất cả" },
							{ value: "accepted", label: "Chưa nộp" },
							{ value: "review", label: "Đang kiểm duyệt" },
							{ value: "published", label: "Đã xuất bản" },
						].map((tab) => (
							<button
								key={tab.value}
								onClick={() => setFilterStatus(tab.value)}
								className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
									filterStatus === tab.value
										? "bg-gray-900 text-white"
										: "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
								}`}
							>
								{tab.label}
							</button>
						))}

						<select
							value={sortOrder}
							onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
							className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:border-gray-400 focus:outline-none cursor-pointer ml-1"
						>
							<option value="newest">Mới nhất trước</option>
							<option value="oldest">Cũ nhất trước</option>
						</select>
					</div>
				</div>
				<TeacherCoursesList
					courses={filteredCourses}
					isLoading={coursesLoading}
					error={coursesError}
				/>
			</div>
		);
	}, [
		activeTab,
		filteredCourses,
		filterStatus,
		coursesError,
		coursesLoading,
		invitations,
		invitationsError,
		invitationsLoading,
		handleInvitationAction,
		pendingIds,
	]);

	return (
		<div className="flex flex-col h-full">
			<TeacherCoursesHeader courses={courses} />
			<div className="flex flex-col gap-6 md:flex-row px-6">
				<TeacherCoursesSidebar
					activeTab={activeTab}
					onTabChange={setActiveTab}
					isOpen={isSidebarOpen}
					onToggle={() => setIsSidebarOpen((prev) => !prev)}
				/>
				<div className="flex-1 flex flex-col gap-6 min-w-0">
					{activeTab === "my-courses" && (
						<div className="w-full">
							<ScheduleWidget />
						</div>
					)}
					<div className="flex-1 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm min-w-0">
						{tabContent}
					</div>
				</div>
			</div>
		</div>
	);
}
