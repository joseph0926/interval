import { motion } from "motion/react";
import { Check, Sparkles, Heart } from "lucide-react";
import type { PauseUrgeType, PauseResult, PauseDuration } from "@/lib/api-types";

interface ResultChoiceScreenProps {
	urgeType: PauseUrgeType;
	duration: PauseDuration;
	onChoice: (result: PauseResult) => void;
}

const CHOICE_LABELS = {
	SMOKE: {
		completed: "안 피울래요",
		gaveIn: "피울래요",
	},
	SNS: {
		completed: "안 열래요",
		gaveIn: "열래요",
	},
} as const;

export function ResultChoiceScreen({ urgeType, duration, onChoice }: ResultChoiceScreenProps) {
	const labels = CHOICE_LABELS[urgeType];
	const durationLabel = duration === 90 ? "90초" : "3분";

	return (
		<div className="fixed inset-0 z-50 bg-background flex flex-col">
			<div className="flex-1 flex flex-col items-center justify-center px-6">
				{/* Success Icon */}
				<motion.div
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: "spring", duration: 0.5 }}
					className="mb-6"
				>
					<Sparkles className="size-16 text-primary" />
				</motion.div>

				{/* Message */}
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="text-2xl font-bold text-text-primary text-center mb-2"
				>
					{durationLabel}를 멈췄어요!
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="text-text-secondary text-center mb-12"
				>
					이제 어떻게 할까요?
				</motion.p>

				{/* Choice Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="w-full max-w-sm space-y-3"
				>
					{/* Completed Button (Primary) */}
					<motion.button
						whileTap={{ scale: 0.98 }}
						onClick={() => onChoice("COMPLETED")}
						className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-success text-white font-semibold text-lg shadow-sm"
					>
						<Check className="size-6" />
						{labels.completed}
					</motion.button>

					{/* Gave In Button (Secondary) */}
					<motion.button
						whileTap={{ scale: 0.98 }}
						onClick={() => onChoice("GAVE_IN")}
						className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-muted text-text-secondary font-medium text-lg"
					>
						{labels.gaveIn}
					</motion.button>
				</motion.div>
			</div>
		</div>
	);
}

interface ResultFeedbackScreenProps {
	result: PauseResult;
	successCount?: number;
	streak?: number;
	onClose: () => void;
}

export function ResultFeedbackScreen({
	result,
	successCount = 0,
	streak = 0,
	onClose,
}: ResultFeedbackScreenProps) {
	const isSuccess = result === "COMPLETED";

	return (
		<div className="fixed inset-0 z-50 bg-background flex flex-col">
			<div className="flex-1 flex flex-col items-center justify-center px-6">
				{isSuccess ? (
					<>
						{/* Success Animation */}
						<motion.div
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ type: "spring", duration: 0.6 }}
							className="mb-6"
						>
							<div className="size-20 rounded-full bg-success/10 flex items-center justify-center">
								<Check className="size-10 text-success" />
							</div>
						</motion.div>

						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="text-2xl font-bold text-text-primary text-center mb-2"
						>
							잘했어요!
						</motion.h2>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="text-text-secondary text-center"
						>
							오늘 {successCount}번째 성공이에요
							{streak >= 2 && (
								<>
									<br />
									연속 {streak}일째 멈추고 있어요
								</>
							)}
						</motion.p>
					</>
				) : (
					<>
						{/* Encouragement */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", duration: 0.5 }}
							className="mb-6"
						>
							<Heart className="size-16 text-primary/60" />
						</motion.div>

						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="text-xl font-semibold text-text-primary text-center mb-3"
						>
							괜찮아요.
						</motion.h2>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="text-text-secondary text-center max-w-xs"
						>
							멈춰본 것만으로도
							<br />
							한 걸음이에요.
							<br />
							<br />
							다음에 또 함께해요
						</motion.p>
					</>
				)}
			</div>

			{/* Home Button */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="px-6 pb-8"
			>
				<button
					onClick={onClose}
					className="w-full py-4 rounded-2xl bg-primary text-white font-medium"
				>
					홈으로
				</button>
			</motion.div>
		</div>
	);
}
