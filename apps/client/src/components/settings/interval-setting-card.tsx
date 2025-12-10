import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Clock, Check } from "lucide-react";
import { updateSettings } from "@/lib/actions";
import { toast } from "sonner";

interface IntervalSettingCardProps {
	currentInterval: number;
}

export function IntervalSettingCard({ currentInterval }: IntervalSettingCardProps) {
	const [interval, setInterval] = useState(currentInterval);
	const [isPending, startTransition] = useTransition();
	const hasChanged = interval !== currentInterval;

	const handleSave = () => {
		startTransition(async () => {
			const result = await updateSettings({ targetInterval: interval });

			if (result.success) {
				toast.success("목표 간격이 변경되었어요");
			} else {
				toast.error(result.error);
			}
		});
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Clock className="size-4" />
					목표 간격
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<p className="text-sm text-muted-foreground">담배 사이에 유지할 기본 간격을 설정해요</p>
				<div className="flex flex-col items-center gap-4">
					<div className="text-4xl font-bold tabular-nums">
						{interval}
						<span className="ml-1 text-lg font-medium text-muted-foreground">분</span>
					</div>
					<Slider
						value={[interval]}
						onValueChange={(v) => setInterval(v[0])}
						min={30}
						max={120}
						step={5}
						className="w-full"
					/>
					<div className="flex w-full justify-between text-xs text-muted-foreground">
						<span>30분</span>
						<span>120분</span>
					</div>
				</div>
				{hasChanged && (
					<Button size="sm" onClick={handleSave} disabled={isPending} className="w-full">
						{isPending ? (
							"저장 중..."
						) : (
							<>
								<Check className="mr-1 size-4" />
								저장
							</>
						)}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
