
const steps = [
  {
    title: "1. Tạo course shell",
    description: "Admin nhập thông tin cơ bản và mời giáo viên.",
  },
  {
    title: "2. Giáo viên chấp nhận",
    description: "Teacher nhận lời mời và bổ sung nội dung.",
  },
  {
    title: "3. Review & publish",
    description: "Admin/teacher kiểm duyệt và xuất bản.",
  },
];

export function CourseShellSidebar() {
  return (
    <aside className="flex flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-[#0f2326] p-6">
        <h3 className="text-base font-semibold text-white">Luồng triển khai</h3>
        <div className="mt-4 space-y-4">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{step.title}</p>
              <p className="text-xs text-white/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
