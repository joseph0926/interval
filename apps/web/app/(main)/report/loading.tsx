import { Skeleton } from "@/components/ui/skeleton";

export default function ReportLoading() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="px-6 pt-12">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="mt-2 h-5 w-48" />
			</div>
			<div className="flex flex-col gap-4 px-6 py-6">
				<Skeleton className="h-32 w-full rounded-xl" />
				<Skeleton className="h-48 w-full rounded-xl" />
				<Skeleton className="h-32 w-full rounded-xl" />
				<Skeleton className="h-24 w-full rounded-xl" />
			</div>
		</div>
	);
}
