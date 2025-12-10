import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { REASON_OPTIONS, type ReasonCode } from "@/types/smoking.type";

interface ReasonSelectorProps {
	value: ReasonCode | null;
	customReason: string;
	onChange: (code: ReasonCode) => void;
	onCustomReasonChange: (text: string) => void;
}

export function ReasonSelector({
	value,
	customReason,
	onChange,
	onCustomReasonChange,
}: ReasonSelectorProps) {
	return (
		<div className="flex flex-col gap-2">
			<p className="mb-1 text-sm font-medium text-muted-foreground">이유를 선택해주세요</p>
			<div className="grid grid-cols-2 gap-2">
				{REASON_OPTIONS.map((option, index) => (
					<motion.button
						key={option.code}
						type="button"
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.03 }}
						onClick={() => onChange(option.code)}
						className={cn(
							"flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition-colors",
							value === option.code
								? "border-primary bg-primary/5 text-primary"
								: "border-border bg-card hover:border-primary/50",
						)}
					>
						<span className="text-lg">{option.emoji}</span>
						<span className="leading-tight">{option.label}</span>
					</motion.button>
				))}
			</div>
			{value === "OTHER" && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					className="mt-2"
				>
					<Input
						placeholder="직접 입력해주세요"
						value={customReason}
						onChange={(e) => onCustomReasonChange(e.target.value)}
						className="rounded-xl"
					/>
				</motion.div>
			)}
		</div>
	);
}
