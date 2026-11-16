import { YawmakSkeleton } from "@/components/ui/DesignSystem";

export default function Loading() {
  return (
    <div className="space-y-6">
      <YawmakSkeleton className="h-12 w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <YawmakSkeleton className="h-24" />
        <YawmakSkeleton className="h-24" />
        <YawmakSkeleton className="h-24" />
        <YawmakSkeleton className="h-24" />
      </div>
      <YawmakSkeleton className="h-24" />
      <YawmakSkeleton className="h-24" />
    </div>
  );
}
