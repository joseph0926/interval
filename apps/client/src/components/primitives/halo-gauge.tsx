import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatDeltaParts, normalizeZero } from "@/lib/minutes";

export interface HaloGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
	value: number;
	maxValue: number;
	size?: number;
	strokeWidth?: number;
	label?: string;
	animated?: boolean;
}

export function HaloGauge({
	value,
	maxValue,
	size = 180,
	strokeWidth = 10,
	label = "오늘 잔액",
	animated = true,
	className,
	...props
}: HaloGaugeProps) {
	const v = normalizeZero(value);
	const max = Math.max(1, Math.abs(maxValue));

	const tone = v > 0 ? "pos" : v < 0 ? "neg" : "zero";

	const { sign, value: absValue } = formatDeltaParts(v);

	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	const progress = useMemo(() => {
		const p = Math.min(1, Math.max(0, Math.abs(v) / max));
		return p;
	}, [v, max]);

	const dashOffset = circumference * (1 - progress);

	return (
		<div
			className={cn("relative flex items-center justify-center", className)}
			style={{ width: size, height: size }}
			{...props}
		>
			<svg width={size} height={size} className="absolute">
				<defs>
					<filter id="haloGlow">
						<feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<linearGradient id="haloPos" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="oklch(0.72 0.22 131.684 / 95%)" />
						<stop offset="1" stopColor="oklch(0.72 0.25 303.9 / 75%)" />
					</linearGradient>
					<linearGradient id="haloNeg" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="oklch(0.7 0.2 22.216 / 95%)" />
						<stop offset="1" stopColor="oklch(0.72 0.25 303.9 / 65%)" />
					</linearGradient>
				</defs>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="oklch(1 0 0 / 8%)"
					strokeWidth={strokeWidth}
					fill="none"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={
						tone === "pos"
							? "url(#haloPos)"
							: tone === "neg"
								? "url(#haloNeg)"
								: "oklch(1 0 0 / 18%)"
					}
					strokeWidth={strokeWidth}
					fill="none"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
					filter={tone === "zero" ? undefined : "url(#haloGlow)"}
					style={{
						transition: animated ? "stroke-dashoffset 600ms ease" : undefined,
					}}
				/>
			</svg>
			<div className="relative z-10 flex flex-col items-center text-center">
				<div
					className={cn(
						"text-[52px] font-semibold leading-none tracking-tight tabular-nums",
						tone === "pos" && "text-success",
						tone === "neg" && "text-danger",
						tone === "zero" && "text-foreground",
					)}
				>
					{sign}
					{absValue}
				</div>
				<div className="mt-1 text-sm text-text-tertiary">분</div>
				<div className="mt-3 text-sm text-text-secondary">{label}</div>
			</div>
		</div>
	);
}
