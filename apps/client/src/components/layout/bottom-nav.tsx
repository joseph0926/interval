import { Link, useLocation } from "react-router";
import { Home, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ href: "/", label: "오늘", icon: Home },
	{ href: "/report", label: "리포트", icon: BarChart3 },
	{ href: "/settings", label: "설정", icon: Settings },
];

export function BottomNav() {
	const location = useLocation();

	return (
		<nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80">
			<div className="mx-auto flex h-16 max-w-lg items-center justify-around px-6">
				{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
					const isActive = location.pathname === href;

					return (
						<Link
							key={href}
							to={href}
							className={cn(
								"flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
								isActive ? "text-primary" : "text-muted-foreground",
							)}
						>
							<Icon className="size-5" />
							<span>{label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
