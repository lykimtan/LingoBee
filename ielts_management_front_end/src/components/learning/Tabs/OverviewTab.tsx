import { createSafeHtml } from "@/utils/utils";
interface OverviewTabProps {
    description?: string;
}

export const OverviewTab = ({ description }: OverviewTabProps) => {
    return (
        <div className="py-6 text-white/60 text-lg leading-relaxed whitespace-pre-wrap">
            <div dangerouslySetInnerHTML={createSafeHtml(description)} />
        </div>
    );
};
