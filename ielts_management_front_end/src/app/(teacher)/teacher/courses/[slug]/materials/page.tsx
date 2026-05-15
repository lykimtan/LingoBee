import Link from "next/link";

export default function TeacherCourseMaterialsPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/teacher/courses/${params.slug}`}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500"
        >
          Quay lại chi tiết khóa học
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Đăng tải tài liệu</h1>
        <p className="mt-2 text-sm text-gray-500">
          Khu vực quản lý tài liệu cho khóa học {params.slug}.
        </p>
      </div>
      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-gray-600">
        Tính năng đăng tải tài liệu sẽ được bổ sung tại đây.
      </div>
    </div>
  );
}
