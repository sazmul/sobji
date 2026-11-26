import { StorefrontSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <div className="h-9 bg-[#0f7b3f]" />
      <div className="h-16 border-b border-gray-200 bg-white" />
      <StorefrontSkeleton />
    </div>
  );
}
