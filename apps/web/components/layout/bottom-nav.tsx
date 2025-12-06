"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ href: "/", label: "오늘", icon: Home },
	{ href: "/report", label: "리포트", icon: BarChart3 },
	{ href: "/settings", label: "설정", icon: Settings },
];

export function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
			<div className="mx-auto flex h-16 max-w-lg items-center justify-around px-6">
				{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
					const isActive = pathname === href;

					return (
						<Link
							key={href}
							href={href}
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
