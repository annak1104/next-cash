import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center py-10">
      <Spinner className="size-8" />
    </div>
  );
}
