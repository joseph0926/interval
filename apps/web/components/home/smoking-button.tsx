"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Cigarette } from "lucide-react";
import { SmokingDrawer } from "@/components/smoking/smoking-drawer";
import type { HomeState, TodaySummary } from "@/types/home.type";

interface SmokingButtonProps {
	state: HomeState;
	summary: TodaySummary;
}

export function SmokingButton({ state, summary }: SmokingButtonProps) {
	const [drawerOpen, setDrawerOpen] = useState(false);

	const buttonText =
		state.type === "BEFORE_FIRST" ? "오늘 첫 담배를 피웠어요" : "지금 담배를 피웠어요";

	return (
		<>
			<motion.div whileTap={{ scale: 0.98 }}>
				<Button
					size="lg"
					className="w-full gap-2 rounded-xl py-6 text-base font-medium"
					onClick={() => setDrawerOpen(true)}
				>
					<Cigarette className="size-5" />
					{buttonText}
				</Button>
			</motion.div>
			<SmokingDrawer
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				state={state}
				summary={summary}
			/>
		</>
	);
}
