import { redirect } from "next/navigation";
import { getCurrentUser, getTodaySummary } from "@/lib/dal";
import { HomeContent } from "@/components/home/home-content";

export default async function HomePage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/onboarding");
	}

	const summary = await getTodaySummary(user.id);

	return <HomeContent summary={summary} />;
}
