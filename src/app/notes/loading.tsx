import { YawmakSkeleton } from "@/components/ui/DesignSystem";

export default function Loading() {
  return (
    <div className="space-y-6">
      <YawmakSkeleton className="h-12 w-52" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-3">
          <YawmakSkeleton className="h-11" />
          <YawmakSkeleton className="h-20" />
          <YawmakSkeleton className="h-20" />
        </div>
        <div className="lg:col-span-8">
          <YawmakSkeleton className="h-[420px]" />
        </div>
      </div>
    </div>
  );
}
