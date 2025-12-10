import { Button } from "@/components/ui/button";
import { StepTransition } from "../step-transition";

interface WelcomeStepProps {
	onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
	return (
		<StepTransition>
			<div className="flex flex-1 flex-col justify-between px-6 py-12">
				<div className="flex flex-1 flex-col items-center justify-center text-center">
					<h1 className="text-4xl font-bold tracking-tight">간격</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						지금 한 개비 말고, 조금 있다가 한 개비.
					</p>
					<div className="mt-8 max-w-xs text-muted-foreground">
						<p>
							간격은 지금 당장 끊으라고 하지 않아요.
							<br />
							담배와의 '간격'을 조금씩 벌려보는 연습부터 시작해요.
						</p>
					</div>
				</div>
				<Button size="lg" className="w-full rounded-xl py-6 text-base font-medium" onClick={onNext}>
					시작하기
				</Button>
			</div>
		</StepTransition>
	);
}
