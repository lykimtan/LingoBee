import { PlusCircle } from "lucide-react";

interface LearningHeaderProps {
    title?: string;
    updatedAt?: string;
}

export const LearningHeader = ({ title = "Lesson Title", updatedAt = "May 2024" }: LearningHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                    {title}
                </h1>
                <p className="text-sm text-white/50 flex gap-2">
                    <span>Lần cuối cập nhật: {updatedAt}</span>
                    <span>•</span>
                </p>
            </div>
        </div>
    );
};
