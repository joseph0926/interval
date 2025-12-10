import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Check } from "lucide-react";
import { updateSettings } from "@/lib/actions";
import { toast } from "sonner";

interface MotivationSettingCardProps {
	currentMotivation: string | null;
}

export function MotivationSettingCard({ currentMotivation }: MotivationSettingCardProps) {
	const [motivation, setMotivation] = useState(currentMotivation ?? "");
	const [isPending, startTransition] = useTransition();
	const hasChanged = motivation !== (currentMotivation ?? "");

	const handleSave = () => {
		startTransition(async () => {
			const result = await updateSettings({ motivation });

			if (result.success) {
				toast.success("나의 이유가 저장되었어요");
			} else {
				toast.error(result.error);
			}
		});
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Heart className="size-4" />
					나의 이유
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<p className="text-sm text-muted-foreground">힘들 때 다시 보여드릴게요</p>
				<Textarea
					value={motivation}
					onChange={(e) => setMotivation(e.target.value)}
					placeholder="아이 앞에서 냄새 줄이고 싶어요..."
					className="min-h-20 resize-none rounded-xl"
				/>
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
