import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StepTransition } from "../step-transition";
import { ChevronLeft } from "lucide-react";

interface MotivationStepProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isPending: boolean;
	error?: string;
	onPrev: () => void;
}

const PLACEHOLDERS = [
	"기침이 너무 심해서 조금 줄이고 싶어요.",
	"아이 앞에서 냄새를 줄이고 싶어요.",
	"건강검진 전에 조금이라도 줄여보고 싶어요.",
];

export function MotivationStep({
	value,
	onChange,
	onSubmit,
	isPending,
	error,
	onPrev,
}: MotivationStepProps) {
	return (
		<StepTransition>
			<div className="flex flex-1 flex-col px-6 py-6">
				<button
					type="button"
					onClick={onPrev}
					className="-ml-2 flex items-center gap-1 self-start p-2 text-muted-foreground"
				>
					<ChevronLeft className="size-5" />
					<span className="text-sm">이전</span>
				</button>
				<div className="mt-8">
					<h2 className="text-2xl font-bold">
						오늘 이렇게 해보고 싶은
						<br />
						이유를 적어볼까요?
					</h2>
					<p className="mt-2 text-muted-foreground">이 문장은 힘들 때 다시 보여드릴게요.</p>
				</div>
				<div className="mt-8">
					<Textarea
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={PLACEHOLDERS[0]}
						className="min-h-32 resize-none rounded-xl text-base"
					/>
				</div>
				<div className="mt-6 flex flex-wrap gap-2">
					{PLACEHOLDERS.map((placeholder) => (
						<button
							key={placeholder}
							type="button"
							onClick={() => onChange(placeholder)}
							className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50"
						>
							{placeholder.slice(0, 15)}...
						</button>
					))}
				</div>
				{error && <p className="mt-4 text-sm text-destructive">{error}</p>}
				<div className="mt-auto pt-6">
					<Button
						size="lg"
						className="w-full rounded-xl py-6 text-base font-medium"
						onClick={onSubmit}
						disabled={isPending}
					>
						{isPending ? "잠시만요..." : "시작하기"}
					</Button>
					<Button
						variant="ghost"
						className="mt-3 w-full text-sm text-muted-foreground"
						onClick={onSubmit}
						disabled={isPending}
					>
						나중에 적을게요
					</Button>
				</div>
			</div>
		</StepTransition>
	);
}
