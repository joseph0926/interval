"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Check } from "lucide-react";
import { updateMotivation } from "@/actions/settings";
import { toast } from "sonner";

interface MotivationSettingCardProps {
	currentMotivation: string | null;
}

export function MotivationSettingCard({ currentMotivation }: MotivationSettingCardProps) {
	const [motivation, setMotivation] = useState(currentMotivation ?? "");
	const [isPending, setIsPending] = useState(false);
	const hasChanged = motivation !== (currentMotivation ?? "");

	const handleSave = async () => {
		setIsPending(true);
		const result = await updateMotivation(motivation);
		setIsPending(false);

		if (result.success) {
			toast.success("동기 문구가 변경되었어요");
		} else {
			toast.error(result.error);
		}
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
				<p className="text-sm text-muted-foreground">힘들 때 다시 보여드릴 문구예요</p>
				<Textarea
					value={motivation}
					onChange={(e) => setMotivation(e.target.value)}
					placeholder="기침이 너무 심해서 조금 줄이고 싶어요."
					className="min-h-20 resize-none rounded-xl"
				/>
				{hasChanged && (
					<Button size="sm" onClick={handleSave} disabled={isPending} className="w-full">
						{isPending ? (
							"저장 중..."
						) : (
							<>
								<Check className="size-4 mr-1" />
								저장
							</>
						)}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
