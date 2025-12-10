import { useTransition } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Database, Trash2 } from "lucide-react";
import { resetAllData } from "@/lib/actions";
import { toast } from "sonner";

interface DataSettingCardProps {
	isGuest: boolean;
}

export function DataSettingCard({ isGuest }: DataSettingCardProps) {
	const navigate = useNavigate();
	const [isPending, startTransition] = useTransition();

	const handleReset = () => {
		startTransition(async () => {
			const result = await resetAllData();

			if (result.success) {
				toast.success("데이터가 초기화되었어요");
				navigate("/");
			} else {
				toast.error(result.error);
			}
		});
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Database className="size-4" />
					데이터 관리
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="outline" className="w-full justify-start">
							<Trash2 className="mr-2 size-4" />
							기록 초기화
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>기록을 초기화할까요?</AlertDialogTitle>
							<AlertDialogDescription>
								모든 흡연 기록이 삭제돼요. 이 작업은 되돌릴 수 없어요.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>취소</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleReset}
								disabled={isPending}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{isPending ? "처리 중..." : "초기화"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				{isGuest && (
					<p className="text-xs text-muted-foreground">
						게스트 계정으로 사용 중이에요. 기기를 바꾸면 데이터가 사라질 수 있어요.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
