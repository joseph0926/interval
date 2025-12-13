import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StepTransition } from "../step-transition";
import { ChevronLeft } from "lucide-react";
import type { EngineModuleType } from "@/lib/api-types";

interface MotivationStepProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isPending: boolean;
	error?: string;
	onPrev: () => void;
	selectedModules?: EngineModuleType[];
}

const PLACEHOLDERS_BY_MODULE: Record<EngineModuleType, string[]> = {
	SMOKE: [
		"기침이 너무 심해서 조금 줄이고 싶어요.",
		"아이 앞에서 냄새를 줄이고 싶어요.",
		"건강검진 전에 조금이라도 줄여보고 싶어요.",
	],
	SNS: [
		"하루에 폰 보는 시간이 너무 많아져서요.",
		"집중력이 떨어지는 것 같아요.",
		"자기 전에 폰 보는 습관을 줄이고 싶어요.",
	],
	CAFFEINE: [
		"밤에 잠을 잘 못 자서요.",
		"하루에 커피를 너무 많이 마셔서요.",
		"카페인 의존도를 줄이고 싶어요.",
	],
	FOCUS: ["집중력을 더 키우고 싶어요.", "일의 효율을 높이고 싶어요.", "딴짓을 줄이고 싶어요."],
};

const DEFAULT_PLACEHOLDERS = [
	"조금씩 변화해보고 싶어요.",
	"더 건강한 습관을 만들고 싶어요.",
	"스스로를 컨트롤하고 싶어요.",
];

function getPlaceholders(selectedModules?: EngineModuleType[]): string[] {
	if (!selectedModules || selectedModules.length === 0) {
		return DEFAULT_PLACEHOLDERS;
	}

	const primaryModule = selectedModules[0];
	return PLACEHOLDERS_BY_MODULE[primaryModule] || DEFAULT_PLACEHOLDERS;
}

export function MotivationStep({
	value,
	onChange,
	onSubmit,
	isPending,
	error,
	onPrev,
	selectedModules,
}: MotivationStepProps) {
	const placeholders = getPlaceholders(selectedModules);

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
						placeholder={placeholders[0]}
						className="min-h-32 resize-none rounded-xl text-base"
					/>
				</div>
				<div className="mt-6 flex flex-wrap gap-2">
					{placeholders.map((placeholder) => (
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
