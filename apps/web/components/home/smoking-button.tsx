"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Cigarette } from "lucide-react";
import type { HomeState } from "@/types/home.type";

interface SmokingButtonProps {
	state: HomeState;
}

export function SmokingButton({ state }: SmokingButtonProps) {
	const buttonText =
		state.type === "BEFORE_FIRST" ? "오늘 첫 담배를 피웠어요" : "지금 담배를 피웠어요";

	const handleClick = () => {};

	return (
		<motion.div whileTap={{ scale: 0.98 }}>
			<Button
				size="lg"
				className="w-full gap-2 rounded-xl py-6 text-base font-medium"
				onClick={handleClick}
			>
				<Cigarette className="size-5" />
				{buttonText}
			</Button>
		</motion.div>
	);
}
