import { useEffect, useState } from "react";

export type ModuleColorKey = "smoke" | "sns" | "caffeine" | "focus";

export const MODULE_COLORS: Record<ModuleColorKey, { bg: string; text: string; muted: string }> = {
	smoke: {
		bg: "bg-success",
		text: "text-success",
		muted: "bg-success-muted",
	},
	sns: {
		bg: "bg-primary",
		text: "text-primary",
		muted: "bg-primary/15",
	},
	caffeine: {
		bg: "bg-warning",
		text: "text-warning",
		muted: "bg-warning-muted",
	},
	focus: {
		bg: "bg-focus",
		text: "text-focus",
		muted: "bg-focus/15",
	},
};

export function getModuleColor(moduleType: string): (typeof MODULE_COLORS)[ModuleColorKey] {
	const key = moduleType.toLowerCase() as ModuleColorKey;
	return MODULE_COLORS[key] ?? MODULE_COLORS.smoke;
}

export function useReducedMotion(): boolean {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mediaQuery.matches);

		const handler = (event: MediaQueryListEvent) => {
			setPrefersReducedMotion(event.matches);
		};

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, []);

	return prefersReducedMotion;
}

export function useReducedTransparency(): boolean {
	const [prefersReducedTransparency, setPrefersReducedTransparency] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-transparency: reduce)");
		setPrefersReducedTransparency(mediaQuery.matches);

		const handler = (event: MediaQueryListEvent) => {
			setPrefersReducedTransparency(event.matches);
		};

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, []);

	return prefersReducedTransparency;
}

export function formatMinutesWithSign(minutes: number): { text: string; isPositive: boolean } {
	const isPositive = minutes >= 0;
	const absMinutes = Math.abs(minutes);
	return {
		text: `${isPositive ? "+" : "-"}${absMinutes}분`,
		isPositive,
	};
}

export function formatMinutesNeutral(minutes: number): string {
	const absMinutes = Math.abs(minutes);
	if (absMinutes >= 60) {
		const hours = Math.floor(absMinutes / 60);
		const mins = absMinutes % 60;
		return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
	}
	return `${absMinutes}분`;
}

export const A11Y_LABELS = {
	earned: "적립 시간",
	lost: "차감 시간",
	net: "순거리",
	positive: "증가",
	negative: "감소",
	countdown: "카운트다운",
	ready: "준비됨",
	progress: "진행률",
} as const;

export function getStatusA11yLabel(status: string): { label: string; description: string } {
	const labels: Record<string, { label: string; description: string }> = {
		NO_BASELINE: {
			label: "첫 기록 필요",
			description: "오늘 첫 기록을 해주세요",
		},
		COUNTDOWN: {
			label: "대기 중",
			description: "목표 시간까지 카운트다운 중입니다",
		},
		READY: {
			label: "준비됨",
			description: "목표 시간에 도달했습니다. 기록할 수 있습니다",
		},
		GAP_DETECTED: {
			label: "복귀 필요",
			description: "오랜 시간이 지났습니다. 복귀해주세요",
		},
		FOCUS_IDLE: {
			label: "대기",
			description: "집중 세션을 시작할 수 있습니다",
		},
		FOCUS_RUNNING: {
			label: "집중 중",
			description: "집중 세션이 진행 중입니다",
		},
	};
	return labels[status] ?? { label: status, description: "" };
}

export const TOUCH_TARGET_MIN = 44;

export function cn(...inputs: (string | undefined | null | false)[]): string {
	return inputs.filter(Boolean).join(" ");
}
