import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neonSurfaceVariants = cva("rounded-2xl transition-all duration-200", {
	variants: {
		variant: {
			solid: "bg-surface",
			elevated: "bg-surface-elevated shadow-lg shadow-black/5 dark:shadow-black/20",
			glass: "surface-glass",
			neon: [
				"bg-surface-elevated",
				"dark:bg-[oklch(0.14_0.015_280)]",
				"dark:shadow-[0_0_30px_oklch(0.5_0.2_280/0.15)]",
				"dark:border dark:border-white/5",
			],
		},
		glow: {
			none: "",
			subtle: "dark:shadow-[0_0_20px_oklch(0.6_0.2_130/0.1)]",
			medium: "dark:shadow-[0_0_30px_oklch(0.6_0.2_130/0.2)]",
			strong: "dark:shadow-[0_0_40px_oklch(0.6_0.2_130/0.3)]",
			success: "dark:shadow-[0_0_25px_oklch(0.65_0.2_130/0.25)]",
			focus: "dark:shadow-[0_0_25px_oklch(0.65_0.25_304/0.25)]",
			warning: "dark:shadow-[0_0_25px_oklch(0.75_0.19_70/0.25)]",
			danger: "dark:shadow-[0_0_25px_oklch(0.65_0.2_25/0.25)]",
		},
		padding: {
			none: "",
			sm: "p-3",
			md: "p-4",
			lg: "p-6",
		},
	},
	defaultVariants: {
		variant: "solid",
		glow: "none",
		padding: "md",
	},
});

export interface NeonSurfaceProps
	extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof neonSurfaceVariants> {
	asChild?: boolean;
}

const NeonSurface = forwardRef<HTMLDivElement, NeonSurfaceProps>(
	({ className, variant, glow, padding, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(neonSurfaceVariants({ variant, glow, padding }), className)}
				{...props}
			/>
		);
	},
);

NeonSurface.displayName = "NeonSurface";

export { NeonSurface, neonSurfaceVariants };
