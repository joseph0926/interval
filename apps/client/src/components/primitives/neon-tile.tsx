import { cn } from "@/lib/utils";

export interface NeonTileProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "elevated";
	glow?: "none" | "primary" | "success" | "danger" | "warning" | "focus";
	size?: "sm" | "md" | "lg";
}

export function NeonTile({
	variant = "default",
	glow = "none",
	size = "md",
	className,
	children,
	...props
}: NeonTileProps) {
	const pad = size === "sm" ? "p-4" : size === "lg" ? "p-6" : "p-5";

	const glowCls =
		glow === "success"
			? "neon-glow-success"
			: glow === "danger"
				? "neon-glow-danger"
				: glow === "focus"
					? "neon-glow-focus"
					: glow === "primary"
						? "neon-glow-primary"
						: glow === "warning"
							? "celebration-glow"
							: "";

	return (
		<div className={cn("gradient-border rounded-3xl", glowCls, className)}>
			<div
				className={cn(
					"rounded-3xl",
					variant === "elevated" ? "bg-surface-elevated/75" : "bg-surface/70",
					"backdrop-blur-xl",
					pad,
				)}
				{...props}
			>
				{children}
			</div>
		</div>
	);
}
