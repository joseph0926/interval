import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/root.layout";

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				index: true,
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
