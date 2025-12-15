import { Outlet } from "react-router";
import { BottomNav } from "@/components/layout/bottom-nav";

export function MainLayout() {
	return (
		<div className="flex min-h-dvh flex-col pb-[calc(4rem+var(--safe-bottom))]">
			<Outlet />
			<BottomNav />
		</div>
	);
}
