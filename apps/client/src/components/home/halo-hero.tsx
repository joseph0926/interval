import { motion, useReducedMotion } from "motion/react";
import { HaloGauge } from "@/components/primitives";
import { cn } from "@/lib/utils";
import { FORMULAS, TERMS } from "@/lib/lexicon";
import type { EngineIntegratedSummary } from "@/types/engine.type";

interface HaloHeroProps {
	integrated: EngineIntegratedSummary;
	className?: string;
}

export function HaloHero({ integrated, className }: HaloHeroProps) {
	const prefersReducedMotion = useReducedMotion();

	const isEmpty = integrated.netMin === 0 && integrated.earnedMin === 0 && integrated.lostMin === 0;

	const hint = isEmpty
		? "아래 모듈에서 첫 기록을 남기면 오늘이 시작돼요"
		: "좋아요. 오늘의 흐름이 쌓이고 있어요";

	return (
		<div className={cn("flex flex-col items-center", className)}>
			<HaloGauge
				value={integrated.netMin}
				maxValue={120}
				size={180}
				strokeWidth={10}
				label={`오늘 ${TERMS.balance}`}
				animated={!prefersReducedMotion}
			/>
			<motion.div
				initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.25, duration: 0.35 }}
				className="mt-4 text-center text-xs text-text-tertiary"
			>
				<p>{FORMULAS.balance}</p>
				<p className="mt-1">{hint}</p>
			</motion.div>
		</div>
	);
}
