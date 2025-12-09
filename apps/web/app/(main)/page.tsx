import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getTodaySummary } from "@/lib/dal";
import { HomeContent } from "@/components/home/home-content";
import HomeLoading from "./loading";

async function HomeData({ userId }: { userId: string }) {
	const summary = await getTodaySummary(userId);
	return <HomeContent summary={summary} />;
}

export default async function HomePage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/onboarding");
	}

	return (
		<Suspense fallback={<HomeLoading />}>
			<HomeData userId={user.id} />
		</Suspense>
	);
}
