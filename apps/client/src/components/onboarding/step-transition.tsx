import { motion } from "motion/react";
import type { ReactNode } from "react";

interface StepTransitionProps {
	children: ReactNode;
}

export function StepTransition({ children }: StepTransitionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{
				type: "spring",
				stiffness: 300,
				damping: 30,
				duration: 0.3,
			}}
			className="flex flex-1 flex-col"
		>
			{children}
		</motion.div>
	);
}
