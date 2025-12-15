import { forwardRef } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export interface ActionSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	statusMessage?: {
		text: string;
		variant?: "default" | "success" | "warning" | "info";
	};
	children: React.ReactNode;
	className?: string;
}

const ActionSheet = forwardRef<HTMLDivElement, ActionSheetProps>(
	({ open, onOpenChange, title, description, statusMessage, children, className }, ref) => {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent
					ref={ref}
					className={cn(
						"dark:bg-[oklch(0.1_0.015_280)]",
						"dark:border-t dark:border-white/10",
						className,
					)}
				>
					<DrawerHeader className="text-left">
						<DrawerTitle className="text-lg">{title}</DrawerTitle>
						{description && <DrawerDescription>{description}</DrawerDescription>}
						{!description && (
							<DrawerDescription className="sr-only">
								{title} 관련 액션을 선택하세요
							</DrawerDescription>
						)}
					</DrawerHeader>

					{statusMessage && (
						<div className="px-4 pb-3">
							<StatusBadge text={statusMessage.text} variant={statusMessage.variant} />
						</div>
					)}

					<div className="px-4 pb-6">{children}</div>
				</DrawerContent>
			</Drawer>
		);
	},
);

ActionSheet.displayName = "ActionSheet";

function StatusBadge({
	text,
	variant = "default",
}: {
	text: string;
	variant?: "default" | "success" | "warning" | "info";
}) {
	const variantStyles = {
		default: "bg-muted/50 text-text-secondary dark:bg-white/5",
		success: "bg-success-muted text-success border border-success/20",
		warning: "bg-warning-muted text-warning border border-warning/20",
		info: "bg-primary/10 text-primary border border-primary/20",
	};

	return (
		<div className={cn("rounded-xl px-4 py-3 text-sm", variantStyles[variant])} role="status">
			{text}
		</div>
	);
}

export interface ActionSheetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "default" | "lg";
	loading?: boolean;
}

const ActionSheetButton = forwardRef<HTMLButtonElement, ActionSheetButtonProps>(
	(
		{
			className,
			variant = "primary",
			size = "default",
			loading = false,
			disabled,
			children,
			...props
		},
		ref,
	) => {
		const variantStyles = {
			primary: cn(
				"bg-primary text-primary-foreground",
				"dark:shadow-[0_0_15px_oklch(0.65_0.2_130/0.2)]",
				"hover:bg-primary/90",
			),
			secondary: cn(
				"bg-surface-elevated text-foreground border border-border",
				"dark:bg-white/5 dark:border-white/10",
				"hover:bg-muted",
			),
			ghost: cn("bg-transparent text-text-secondary", "hover:bg-muted/50"),
			danger: cn(
				"bg-danger text-danger-foreground",
				"dark:shadow-[0_0_15px_oklch(0.65_0.2_25/0.2)]",
				"hover:bg-danger/90",
			),
		};

		const sizeStyles = {
			default: "h-11 px-4 text-sm",
			lg: "h-12 px-6 text-base",
		};

		return (
			<button
				ref={ref}
				type="button"
				disabled={disabled || loading}
				className={cn(
					"w-full rounded-xl font-medium transition-all duration-150",
					"active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
					variantStyles[variant],
					sizeStyles[size],
					className,
				)}
				{...props}
			>
				{loading ? "처리 중..." : children}
			</button>
		);
	},
);

ActionSheetButton.displayName = "ActionSheetButton";

export interface ActionSheetChipGroupProps {
	label?: string;
	chips: Array<{
		label: string;
		value: number;
		highlight?: boolean;
	}>;
	onSelect: (value: number) => void;
	disabled?: boolean;
}

function ActionSheetChipGroup({
	label,
	chips,
	onSelect,
	disabled = false,
}: ActionSheetChipGroupProps) {
	return (
		<div className="flex flex-col gap-2">
			{label && <p className="text-xs font-medium text-text-tertiary">{label}</p>}
			<div
				className="grid gap-2"
				style={{ gridTemplateColumns: `repeat(${chips.length}, 1fr)` }}
				role="group"
				aria-label={label ?? "옵션 선택"}
			>
				{chips.map((chip) => (
					<button
						key={chip.value}
						type="button"
						onClick={() => onSelect(chip.value)}
						disabled={disabled}
						className={cn(
							"flex h-14 flex-col items-center justify-center rounded-xl border transition-all",
							"active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
							chip.highlight
								? cn(
										"border-primary bg-primary/10 text-primary",
										"dark:bg-primary/15 dark:border-primary/30",
										"dark:shadow-[inset_0_1px_0_oklch(0.7_0.2_130/0.1)]",
										"hover:bg-primary/20",
									)
								: cn(
										"border-border bg-surface",
										"dark:bg-white/5 dark:border-white/10",
										"hover:border-primary/50 hover:bg-surface-elevated",
									),
						)}
						aria-label={`${chip.label} 선택`}
					>
						<span className="text-lg font-bold tabular-nums">{chip.value}</span>
						<span className="text-[10px] text-text-tertiary">분</span>
					</button>
				))}
			</div>
		</div>
	);
}

export { ActionSheet, ActionSheetButton, ActionSheetChipGroup, StatusBadge };
