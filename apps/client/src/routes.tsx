import { createBrowserRouter, redirect } from "react-router";
import { RootLayout } from "./layouts/root.layout";
import { api } from "./lib/api";

async function authLoader() {
	try {
		const res = await api.api.auth.me.$get();
		const data = await res.json();

		if (!data.user) {
			return redirect("/onboarding");
		}

		const hasCompletedOnboarding =
			data.user.currentTargetInterval !== null && data.user.dailySmokingRange !== null;

		if (!hasCompletedOnboarding) {
			return redirect("/onboarding");
		}

		return { user: data.user };
	} catch {
		return redirect("/onboarding");
	}
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				index: true,
				loader: authLoader,
				lazy: async () => {
					const { HomePage } = await import("./pages/home.page");
					return { Component: HomePage };
				},
			},
			{
				path: "onboarding",
				lazy: async () => {
					const { OnboardingPage } = await import("./pages/onboarding.page");
					return { Component: OnboardingPage };
				},
			},
		],
	},
]);

export { router };
