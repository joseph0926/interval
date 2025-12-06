import { BottomNav } from "@/components/layout/bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col bg-background">
			<div className="flex-1 pb-20">{children}</div>
			<BottomNav />
		</div>
	);
}
