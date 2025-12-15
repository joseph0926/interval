import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./components/ui/theme-provider";

export default function Entry() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<RouterProvider router={router} />
		</ThemeProvider>
	);
}
