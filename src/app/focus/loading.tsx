import { YawmakSkeleton } from "@/components/ui/DesignSystem";

export default function Loading() {
  return (
    <div className="space-y-6">
      <YawmakSkeleton className="h-12 w-48" />
      <YawmakSkeleton className="h-[420px]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <YawmakSkeleton className="h-52" />
        <YawmakSkeleton className="h-52" />
      </div>
    </div>
  );
}
