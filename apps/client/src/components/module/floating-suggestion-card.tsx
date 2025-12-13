import { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MODULE_CONFIGS } from "@/types/engine.type";
import type { EngineFloatingSuggestion } from "@/types/engine.type";

interface FloatingSuggestionCardProps {
	suggestion: EngineFloatingSuggestion;
	onComplete: () => void;
}

export function FloatingSuggestionCard({ suggestion, onComplete }: FloatingSuggestionCardProps) {
	const [isLoading, setIsLoading] = useState<number | null>(null);
	const config = MODULE_CONFIGS[suggestion.moduleType];

	const handleDelay = async (minutes: 1 | 3) => {
		setIsLoading(minutes);
		try {
			await api.engine.delay({
				moduleType: suggestion.moduleType,
				delayMinutes: minutes,
				triggerContext: "FLOATING_CARD",
			});
			toast.success(`${minutes}분 더 기다리기로 했어요! 💪`);
			onComplete();
		} catch {
			toast.error("요청에 실패했어요");
		} finally {
			setIsLoading(null);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="border-dashed border-primary/30 bg-primary/5">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock className="size-4" />
						<span>붕 뜨는 시간</span>
					</div>

					<div className="mt-2 flex items-center gap-2">
						<span className="text-xl">{config?.icon ?? "⏰"}</span>
						<p className="text-sm">
							<span className="font-medium">{config?.label ?? suggestion.moduleType}</span> 목표까지{" "}
							<span className="font-bold text-primary">{suggestion.remainingMin}분</span> 남았어요
						</p>
					</div>

					<p className="mt-1 text-xs text-muted-foreground">잠깐 다른 걸 해볼까요?</p>

					<div className="mt-3 flex gap-2">
						{suggestion.options.includes(1) && (
							<Button
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={() => handleDelay(1)}
								disabled={isLoading !== null}
							>
								{isLoading === 1 ? "처리 중..." : "1분만 기다릴게요"}
							</Button>
						)}
						{suggestion.options.includes(3) && (
							<Button
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={() => handleDelay(3)}
								disabled={isLoading !== null}
							>
								{isLoading === 3 ? "처리 중..." : "3분만 기다릴게요"}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
