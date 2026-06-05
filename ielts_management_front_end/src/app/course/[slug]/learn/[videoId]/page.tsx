import { LearningInterface } from "@/components/learning/LearningInterface";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

interface LearnPageProps {
  params: Promise<{
    slug: string;
    videoId: string;
  }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug, videoId } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 pt-24 pb-12">
        <LearningInterface slug={slug} initialVideoId={videoId} />
      </div>

      <Footer />
    </div>
  );
}
