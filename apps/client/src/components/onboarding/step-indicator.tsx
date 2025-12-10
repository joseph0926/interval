import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
	current: number;
	total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
	return (
		<div className="flex items-center justify-center gap-2">
			{Array.from({ length: total }).map((_, index) => (
				<motion.div
					key={index}
					className={cn(
						"h-1.5 rounded-full transition-colors",
						index <= current ? "bg-primary" : "bg-muted",
					)}
					initial={{ width: 8 }}
					animate={{
						width: index === current ? 24 : 8,
					}}
					transition={{ type: "spring", stiffness: 300, damping: 25 }}
				/>
			))}
		</div>
	);
}
