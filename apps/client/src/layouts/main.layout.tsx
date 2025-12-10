import { Outlet } from "react-router";
import { BottomNav } from "@/components/layout/bottom-nav";

export function MainLayout() {
	return (
		<div className="flex min-h-dvh flex-col pb-16">
			<Outlet />
			<BottomNav />
		</div>
	);
}
