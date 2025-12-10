import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export function AppInfoCard() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Info className="size-4" />앱 정보
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
				<div className="flex justify-between">
					<span>버전</span>
					<span>1.0.0</span>
				</div>
				<div className="flex justify-between">
					<span>개발</span>
					<span>Interval Team</span>
				</div>
			</CardContent>
		</Card>
	);
}
