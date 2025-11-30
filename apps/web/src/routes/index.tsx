import { createBrowserRouter } from "react-router";
import { RootLayout } from "../layouts/root-layout";

export const router = createBrowserRouter([
	{
		path: "/",
		Component: RootLayout,
		children: [
			{
				index: true,
				lazy: () => import("../pages/dashboard"),
			},
			{
				path: "words",
				lazy: () => import("../pages/words"),
			},
			{
				path: "words/new",
				lazy: () => import("../pages/words-new"),
			},
			{
				path: "review",
				lazy: () => import("../pages/review"),
			},
		],
	},
]);
