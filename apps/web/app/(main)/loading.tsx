import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="px-6 pt-12">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="mt-2 h-5 w-48" />
			</div>
			<div className="flex flex-1 items-center justify-center px-6 py-8">
				<Skeleton className="size-64 rounded-full" />
			</div>
			<div className="px-6 pb-6">
				<Skeleton className="h-24 w-full rounded-xl" />
			</div>
			<div className="px-6 pb-6">
				<Skeleton className="h-14 w-full rounded-xl" />
			</div>
		</div>
	);
}
