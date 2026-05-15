import { redirect } from "next/navigation";

export default function AdminCreateCoursePage() {
  redirect("/admin/courses?tab=create");
}
