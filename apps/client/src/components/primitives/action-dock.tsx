import type { Ref } from "react";
import { motion, useReducedMotion, AnimatePresence, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export type ActionDockProps = Omit<HTMLMotionProps<"div">, "ref"> & {
	ref?: Ref<HTMLDivElement>;
	visible?: boolean;
	title?: string;
	subtitle?: string;
	chips: {
		label: string;
		value: number;
		variant?: "default" | "primary" | "success";
	}[];
	onChipClick?: (value: number) => void;
	disabled?: boolean;
};

export function ActionDock({
	className,
	visible = true,
	title = "빠른 적립",
	subtitle = "선택한 시간만큼 전체 모듈에 적용돼요",
	chips,
	onChipClick,
	disabled = false,
	ref: dockRef,
	...props
}: ActionDockProps) {
	const prefersReducedMotion = useReducedMotion();

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					ref={dockRef}
					initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
					transition={{ duration: 0.22, ease: "easeOut" }}
					className={cn("fixed bottom-20 left-0 right-0 z-40 px-4 pb-safe", className)}
					{...props}
				>
					<div className="mx-auto w-full max-w-md">
						<div
							className={cn(
								"gradient-border rounded-3xl",
								"shadow-[0_-10px_40px_rgba(0,0,0,0.18)]",
								"dark:shadow-[0_-12px_55px_oklch(0.65_0.2_130/0.16)]",
							)}
						>
							<div
								className={cn(
									"rounded-3xl px-4 py-3",
									"bg-surface-elevated/85 backdrop-blur-xl",
									"dark:bg-[oklch(0.11_0.02_280/0.92)]",
									"ring-1 ring-inset ring-white/8",
								)}
							>
								{(title || subtitle) && (
									<div className="mb-3 flex items-start justify-between gap-3">
										<div className="min-w-0">
											{title ? (
												<p className="text-sm font-semibold leading-tight tracking-tight text-text-primary">
													{title}
												</p>
											) : null}
											{subtitle ? (
												<p className="mt-0.5 text-xs leading-snug text-text-tertiary">{subtitle}</p>
											) : null}
										</div>

										<div
											className={cn(
												"shrink-0 rounded-full px-2.5 py-1",
												"text-[11px] font-semibold tracking-tight tabular-nums",
												"bg-primary/12 text-primary",
												"dark:bg-primary/16",
											)}
											aria-hidden="true"
										>
											전체
										</div>
									</div>
								)}

								<div className="grid grid-cols-4 gap-2">
									{chips.map((chip) => (
										<button
											key={chip.value}
											type="button"
											onClick={() => onChipClick?.(chip.value)}
											disabled={disabled}
											className={cn(
												"rounded-2xl py-3 text-center transition-all duration-150",
												"font-semibold tracking-tight tabular-nums",
												"ring-1 ring-inset ring-white/10",
												"active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
												(!chip.variant || chip.variant === "default") && [
													"bg-muted/40 text-foreground",
													"hover:bg-muted/55",
													"dark:bg-white/10 dark:hover:bg-white/14",
												],
												chip.variant === "primary" && [
													"bg-primary text-primary-foreground",
													"shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.18)]",
													"dark:shadow-[0_0_0_1px_oklch(0.65_0.2_130/0.22),0_0_22px_oklch(0.65_0.2_130/0.28)]",
												],
												chip.variant === "success" && [
													"bg-success text-success-foreground",
													"shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.18)]",
													"dark:shadow-[0_0_0_1px_oklch(0.72_0.22_131.684/0.22),0_0_22px_oklch(0.72_0.22_131.684/0.28)]",
												],
											)}
											aria-label={`${chip.label} 기다려서 적립`}
										>
											{chip.label}
										</button>
									))}
								</div>

								<p className="mt-2 text-center text-[11px] leading-snug text-text-tertiary">
									“기다려서 적립”은 다음 기록까지의 간격을 만드는 기능이에요
								</p>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export const DEFAULT_DELAY_CHIPS = [
	{ label: "1분", value: 1, variant: "default" as const },
	{ label: "3분", value: 3, variant: "default" as const },
	{ label: "5분", value: 5, variant: "primary" as const },
	{ label: "10분", value: 10, variant: "default" as const },
];
