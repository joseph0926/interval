"use client";

import { useState } from "react";
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
import { Database, Trash2, UserX } from "lucide-react";
import { resetAllData, deleteAccount } from "@/actions/settings";
import { toast } from "sonner";

interface DataSettingCardProps {
	isGuest: boolean;
}

export function DataSettingCard({ isGuest }: DataSettingCardProps) {
	const [isResetting, setIsResetting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleReset = async () => {
		setIsResetting(true);
		const result = await resetAllData();
		setIsResetting(false);

		if (result.success) {
			toast.success("모든 기록이 초기화되었어요");
		} else {
			toast.error(result.error);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		await deleteAccount();
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Database className="size-4" />
					데이터 관리
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{isGuest && (
					<div className="rounded-lg bg-muted/50 p-3">
						<p className="text-sm text-muted-foreground">
							현재 게스트 모드로 사용 중이에요. 기기를 바꾸면 데이터가 사라질 수 있어요.
						</p>
					</div>
				)}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="outline" className="w-full justify-start gap-2">
							<Trash2 className="size-4" />
							기록 초기화
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>기록을 초기화할까요?</AlertDialogTitle>
							<AlertDialogDescription>
								모든 흡연 기록과 통계가 삭제돼요. 이 작업은 되돌릴 수 없어요.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>취소</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleReset}
								disabled={isResetting}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{isResetting ? "초기화 중..." : "초기화"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-start gap-2 text-destructive hover:text-destructive"
						>
							<UserX className="size-4" />
							계정 삭제
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>정말 떠나시는 건가요?</AlertDialogTitle>
							<AlertDialogDescription>
								계정과 모든 데이터가 영구 삭제돼요. 언제든 다시 시작할 수 있어요.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>취소</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								disabled={isDeleting}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{isDeleting ? "삭제 중..." : "삭제"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardContent>
		</Card>
	);
}
