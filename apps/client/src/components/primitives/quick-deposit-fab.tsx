import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionSheet, ActionSheetChipGroup } from "./action-sheet";

export interface QuickDepositFabProps {
	visible: boolean;
	moduleCount: number;
	chips: Array<{
		label: string;
		value: number;
		highlight?: boolean;
	}>;
	onDeposit: (minutes: number) => Promise<void>;
	disabled?: boolean;
	className?: string;
}

export function QuickDepositFab({
	visible,
	moduleCount,
	chips,
	onDeposit,
	disabled = false,
	className,
}: QuickDepositFabProps) {
	const prefersReducedMotion = useReducedMotion();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleOpen = useCallback(() => {
		if (!disabled) {
			setSheetOpen(true);
		}
	}, [disabled]);

	const handleSelect = useCallback(
		async (minutes: number) => {
			setLoading(true);
			try {
				await onDeposit(minutes);
				setSheetOpen(false);
			} finally {
				setLoading(false);
			}
		},
		[onDeposit],
	);

	const showBulkBadge = moduleCount >= 2;

	return (
		<>
			<AnimatePresence>
				{visible && (
					<motion.div
						initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
						transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
						className={cn("fixed bottom-20 right-4 z-40 pb-safe", className)}
					>
						<button
							type="button"
							onClick={handleOpen}
							disabled={disabled}
							className={cn(
								"group relative flex items-center gap-2",
								"rounded-full px-4 py-3",
								"bg-primary text-primary-foreground",
								"shadow-lg shadow-primary/25",
								"dark:shadow-[0_4px_20px_oklch(0.65_0.2_130/0.35)]",
								"transition-all duration-200",
								"hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30",
								"active:scale-[0.98]",
								"disabled:opacity-50 disabled:cursor-not-allowed",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
							)}
							aria-label="빠른 적립 열기"
						>
							<Clock className="size-4" aria-hidden="true" />
							<span className="text-sm font-semibold">지금 적립</span>
							{showBulkBadge && (
								<span
									className={cn(
										"ml-1 rounded-full px-1.5 py-0.5",
										"text-[10px] font-bold",
										"bg-white/20 text-white",
									)}
								>
									{moduleCount}개
								</span>
							)}
							<Plus
								className={cn("size-4 transition-transform duration-200", "group-hover:rotate-90")}
								aria-hidden="true"
							/>
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			<ActionSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				title="지금 적립"
				description={
					moduleCount >= 2
						? `${moduleCount}개 모듈에 동시 적용됩니다`
						: "선택한 시간만큼 간격을 적립해요"
				}
			>
				<div className="flex flex-col gap-4">
					<ActionSheetChipGroup
						label="적립할 시간"
						chips={chips}
						onSelect={handleSelect}
						disabled={loading || disabled}
					/>

					{loading && (
						<div className="flex items-center justify-center gap-2 py-2 text-text-tertiary">
							<Loader2 className="size-4 animate-spin" />
							<span className="text-sm">적립 중...</span>
						</div>
					)}

					<p className="text-center text-xs text-text-tertiary">
						다음 기록까지 기다린 시간이 적립돼요
					</p>
				</div>
			</ActionSheet>
		</>
	);
}

export const QUICK_DEPOSIT_CHIPS = [
	{ label: "1분", value: 1, highlight: false },
	{ label: "3분", value: 3, highlight: false },
	{ label: "5분", value: 5, highlight: true },
	{ label: "10분", value: 10, highlight: false },
];
