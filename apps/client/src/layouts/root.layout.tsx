import { Outlet } from "react-router";
import { Toaster } from "sonner";

export function RootLayout() {
	return (
		<main className="flex min-h-svh flex-col">
			<Outlet />
			<Toaster richColors closeButton position="top-center" />
		</main>
	);
}
