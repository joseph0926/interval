import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default async function OnboardingPage() {
	const user = await getCurrentUser();

	if (user) {
		redirect("/");
	}

	return (
		<main className="min-h-dvh bg-background">
			<OnboardingFlow />
		</main>
	);
}
