import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sunrise, Check } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const DAY_ANCHOR_OPTIONS = [
	{ minutes: 180, label: "3시" },
	{ minutes: 240, label: "4시" },
	{ minutes: 300, label: "5시" },
	{ minutes: 360, label: "6시" },
];

interface DayAnchorSettingCardProps {
	initialDayAnchorMinutes?: number;
}

export function DayAnchorSettingCard({ initialDayAnchorMinutes }: DayAnchorSettingCardProps) {
	const [dayAnchorMinutes, setDayAnchorMinutes] = useState(initialDayAnchorMinutes ?? 240);
	const [originalValue, setOriginalValue] = useState(initialDayAnchorMinutes ?? 240);
	const [isPending, startTransition] = useTransition();
	const hasChanged = dayAnchorMinutes !== originalValue;

	useEffect(() => {
		if (initialDayAnchorMinutes === undefined) {
			api.engine.getSettings().then((res) => {
				if (res.success) {
					setDayAnchorMinutes(res.data.dayAnchorMinutes);
					setOriginalValue(res.data.dayAnchorMinutes);
				}
			});
		}
	}, [initialDayAnchorMinutes]);

	const handleSave = () => {
		startTransition(async () => {
			try {
				const result = await api.engine.updateSettings({ dayAnchorMinutes });
				if (result.success) {
					setOriginalValue(dayAnchorMinutes);
					toast.success("하루 시작 시간이 변경되었어요");
				}
			} catch {
				toast.error("설정 저장에 실패했어요");
			}
		});
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Sunrise className="size-4" />
					하루 시작 시간
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<p className="text-sm text-muted-foreground">
					새벽 기록이 오늘로 집계될지 어제로 집계될지 결정해요
				</p>

				<div className="grid grid-cols-4 gap-2">
					{DAY_ANCHOR_OPTIONS.map((option) => (
						<Button
							key={option.minutes}
							variant={dayAnchorMinutes === option.minutes ? "default" : "outline"}
							size="sm"
							onClick={() => setDayAnchorMinutes(option.minutes)}
							className="w-full"
						>
							{option.label}
						</Button>
					))}
				</div>

				<p className="text-xs text-muted-foreground">
					예: {formatDayAnchorExample(dayAnchorMinutes)}
				</p>

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

function formatDayAnchorExample(minutes: number): string {
	const hour = Math.floor(minutes / 60);
	return `새벽 ${hour}시 이전 기록은 전날로 집계돼요`;
}
