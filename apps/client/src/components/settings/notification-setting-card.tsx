import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";

interface NotificationSettingCardProps {
	notificationEnabled: boolean;
	morningReminderEnabled: boolean;
}

export function NotificationSettingCard({
	notificationEnabled,
	morningReminderEnabled,
}: NotificationSettingCardProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Bell className="size-4" />
					알림
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<Label htmlFor="notification" className="flex flex-col gap-1">
						<span>목표 시간 알림</span>
						<span className="text-xs text-muted-foreground font-normal">
							다음 목표 시간에 알려드려요
						</span>
					</Label>
					<Switch id="notification" checked={notificationEnabled} disabled />
				</div>
				<div className="flex items-center justify-between">
					<Label htmlFor="morning" className="flex flex-col gap-1">
						<span>아침 리마인더</span>
						<span className="text-xs text-muted-foreground font-normal">
							하루 시작할 때 알려드려요
						</span>
					</Label>
					<Switch id="morning" checked={morningReminderEnabled} disabled />
				</div>
				<p className="text-xs text-muted-foreground">알림 기능은 곧 추가될 예정이에요</p>
			</CardContent>
		</Card>
	);
}
