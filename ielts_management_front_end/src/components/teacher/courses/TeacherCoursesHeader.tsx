export function TeacherCoursesHeader() {
  return (
    <div className="mb-6 flex flex-col justify-between gap-6 px-6 md:flex-row md:items-end">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Teaching space</p>
        <h1
          className="text-4xl font-normal text-gray-900 md:text-5xl"
        >
          My <span className="font-medium text-[#1f6f5e]">Class</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-gray-600">
          Theo dõi các khóa học bạn đang phụ trách, phản hồi lời mời từ admin và cập nhật tiến độ.
        </p>
      </div>
      <div className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
        Teacher workspace
      </div>
    </div>
  );
}
