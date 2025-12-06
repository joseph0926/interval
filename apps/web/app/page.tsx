import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";

export default async function HomePage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/onboarding");
	}

	return (
		<main className="min-h-dvh bg-background px-6 py-12">
			<div className="text-center">
				<h1 className="text-2xl font-bold">안녕하세요!</h1>
				<p className="mt-2 text-muted-foreground">목표 간격: {user.currentTargetInterval}분</p>
				<p className="mt-1 text-sm text-muted-foreground">{user.currentMotivation}</p>
			</div>
		</main>
	);
}
