import { Outlet } from "react-router";
import { Toaster } from "sonner";

export function RootLayout() {
	return (
		<main>
			<Outlet />
			<Toaster richColors closeButton position="top-center" />
		</main>
	);
}
