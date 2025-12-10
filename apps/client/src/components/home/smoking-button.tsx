import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Cigarette } from "lucide-react";
import type { HomeState } from "@/types/home.type";

interface SmokingButtonProps {
	state: HomeState;
	onPress: () => void;
}

export function SmokingButton({ state, onPress }: SmokingButtonProps) {
	const buttonText =
		state.type === "BEFORE_FIRST" ? "오늘 첫 담배를 피웠어요" : "지금 담배를 피웠어요";

	return (
		<motion.div whileTap={{ scale: 0.98 }}>
			<Button
				size="lg"
				className="w-full gap-2 rounded-xl py-6 text-base font-medium"
				onClick={onPress}
			>
				<Cigarette className="size-5" />
				{buttonText}
			</Button>
		</motion.div>
	);
}
