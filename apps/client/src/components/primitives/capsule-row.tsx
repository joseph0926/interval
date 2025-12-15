import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDeltaParts, normalizeZero } from "@/lib/minutes";

export interface CapsuleRowProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "active" | "ready" | "warning";
	onClick?: () => void;

	icon: React.ReactNode;
	iconBg?: string;

	title: string;
	subtitle?: string;

	netMin?: number;

	countdown?: {
		targetTime: string | Date;
		targetIntervalMin: number;
	};

	rightContent?: React.ReactNode;
}

export function CapsuleRow({
	variant = "default",
	onClick,
	icon,
	iconBg,
	title,
	subtitle,
	netMin = 0,
	countdown,
	rightContent,
	className,
	...props
}: CapsuleRowProps) {
	const interactive = Boolean(onClick);

	const v = normalizeZero(netMin);
	const showNet = useMemo(() => Math.abs(v) >= 1, [v]);

	const tone = v > 0 ? "pos" : v < 0 ? "neg" : "zero";

	const [progress, setProgress] = useState<number>(0);

	useEffect(() => {
		if (!countdown) return;

		const targetMs = new Date(countdown.targetTime).getTime();
		const totalMs = Math.max(1, countdown.targetIntervalMin * 60 * 1000);

		const tick = () => {
			const now = Date.now();
			const remaining = Math.max(0, targetMs - now);
			const p = Math.max(0, Math.min(1, 1 - remaining / totalMs));
			setProgress(p);
		};

		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [countdown?.targetTime, countdown?.targetIntervalMin]);

	const emphasized = variant !== "default";

	const shell = cn(
		"rounded-3xl",
		emphasized ? "gradient-border" : "border border-white/10 dark:border-white/10",
		interactive && "cursor-pointer",
	);

	const tint =
		variant === "active"
			? "before:bg-primary/12"
			: variant === "ready"
				? "before:bg-success/12"
				: variant === "warning"
					? "before:bg-danger/12"
					: "";

	const inner = cn(
		"relative overflow-hidden",
		"block w-full text-left",
		"rounded-3xl px-4 py-3",
		"bg-surface/70 backdrop-blur-xl",
		"ring-1 ring-inset ring-white/8",
		"transition-all duration-150",
		interactive && "hover:bg-surface/80 active:scale-[0.985]",
		interactive && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
		emphasized && "bg-surface-elevated/70",
		variant === "active" && "neon-glow-primary",
		variant === "ready" && "neon-glow-success",
		variant === "warning" && "neon-glow-danger",
		variant !== "default" && [
			"before:content-[''] before:pointer-events-none before:absolute",
			"before:-top-20 before:-right-24 before:size-56 before:rounded-full before:blur-3xl",
			"before:opacity-70",
			tint,
		],
	);

	const Comp: any = interactive ? "button" : "div";

	return (
		<div className={cn(shell, className)}>
			<Comp
				type={interactive ? "button" : undefined}
				onClick={onClick}
				className={inner}
				{...props}
			>
				<div className="flex items-start gap-3">
					<div
						className={cn(
							"grid size-11 shrink-0 place-items-center rounded-2xl",
							"ring-1 ring-inset ring-white/10",
							"bg-white/6 dark:bg-white/5",
							"shadow-[0_0_18px_rgba(0,0,0,0.16)]",
							iconBg,
						)}
						aria-hidden="true"
					>
						{icon}
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex items-center justify-between gap-2">
							<p className="min-w-0 truncate text-base font-semibold tracking-tight">{title}</p>
							{rightContent ? <span className="shrink-0">{rightContent}</span> : null}
						</div>

						<div className="mt-1 flex items-end justify-between gap-2">
							{subtitle ? (
								<p className="min-w-0 truncate text-xs leading-snug text-text-tertiary">
									{subtitle}
								</p>
							) : (
								<span />
							)}

							{showNet ? <NetPill value={v} tone={tone} /> : null}
						</div>

						{countdown ? (
							<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8 dark:bg-white/10">
								<div
									className="h-full bg-primary transition-all duration-500"
									style={{ width: `${progress * 100}%` }}
								/>
							</div>
						) : null}
					</div>
				</div>
			</Comp>
		</div>
	);
}

function NetPill({ value, tone }: { value: number; tone: "pos" | "neg" | "zero" }) {
	const parts = formatDeltaParts(value);

	return (
		<span
			className={cn(
				"shrink-0",
				"inline-flex items-baseline gap-0.5 rounded-full px-2.5 py-1",
				"text-[12px] font-semibold tabular-nums tracking-tight",
				"ring-1 ring-inset ring-white/10",
				tone === "pos" && "bg-success/12 text-success",
				tone === "neg" && "bg-danger/12 text-danger",
				tone === "zero" && "bg-white/6 text-text-tertiary",
			)}
			aria-label={`오늘 변화 ${parts.sign}${parts.value}분`}
		>
			<span>
				{parts.sign}
				{parts.value}
			</span>
			<span className="text-[11px] opacity-80">분</span>
		</span>
	);
}
