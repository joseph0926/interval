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
			<CardContent className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">버전</span>
					<span className="text-sm">1.0.0</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">개발</span>
					<span className="text-sm">간격 팀</span>
				</div>
				<div className="pt-2 border-t">
					<p className="text-xs text-muted-foreground leading-relaxed">
						간격은 담배를 끊게 해주는 앱이 아니라, 담배와의 &lsquo;간격&lsquo;을 조금씩 벌려주는
						심리 타이머예요.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
