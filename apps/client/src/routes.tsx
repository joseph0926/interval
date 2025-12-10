import { createBrowserRouter, redirect } from "react-router";
import { RootLayout } from "./layouts/root.layout";
import { MainLayout } from "./layouts/main.layout";
import { api } from "./lib/api";

async function authLoader() {
	try {
		const data = await api.auth.me();

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
				element: <MainLayout />,
				loader: authLoader,
				children: [
					{
						index: true,
						lazy: async () => {
							const { HomePage } = await import("./pages/home.page");
							return { Component: HomePage };
						},
					},
					{
						path: "report",
						lazy: async () => {
							const { ReportPage } = await import("./pages/report.page");
							return { Component: ReportPage };
						},
					},
					{
						path: "settings",
						lazy: async () => {
							const { SettingsPage } = await import("./pages/settings.page");
							return { Component: SettingsPage };
						},
					},
				],
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
