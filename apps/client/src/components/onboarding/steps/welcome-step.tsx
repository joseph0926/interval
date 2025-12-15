import { Button } from "@/components/ui/button";
import { StepTransition } from "../step-transition";

interface WelcomeStepProps {
	onNext: () => void;
	isPending?: boolean;
}

export function WelcomeStep({ onNext, isPending }: WelcomeStepProps) {
	return (
		<StepTransition>
			<div
				className="flex flex-1 flex-col justify-between px-6 pt-12"
				style={{ paddingBottom: "calc(3rem + env(safe-area-inset-bottom, 0px))" }}
			>
				<div className="flex flex-1 flex-col items-center justify-center text-center">
					<h1 className="text-4xl font-bold tracking-tight">간격</h1>
					<p className="mt-4 text-lg text-muted-foreground">지금 말고, 조금 있다가.</p>
					<div className="mt-8 max-w-xs text-muted-foreground">
						<p>
							간격은 지금 당장 끊으라고 하지 않아요.
							<br />
							습관과의 '간격'을 조금씩 벌려보는 연습부터 시작해요.
						</p>
					</div>
				</div>
				<Button
					size="lg"
					className="w-full rounded-xl py-6 text-base font-medium"
					onClick={onNext}
					disabled={isPending}
				>
					{isPending ? "준비 중..." : "시작하기"}
				</Button>
			</div>
		</StepTransition>
	);
}
