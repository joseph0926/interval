"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { toast } from "sonner";

interface NotificationSettingCardProps {
	notificationEnabled: boolean;
	morningReminderEnabled: boolean;
}

export function NotificationSettingCard({
	notificationEnabled: initialNotification,
	morningReminderEnabled: initialMorning,
}: NotificationSettingCardProps) {
	const [notificationEnabled, setNotificationEnabled] = useState(initialNotification);
	const [morningReminderEnabled, setMorningReminderEnabled] = useState(initialMorning);

	const handleNotificationChange = (checked: boolean) => {
		setNotificationEnabled(checked);
		toast.info("알림 기능은 곧 지원될 예정이에요");
	};

	const handleMorningChange = (checked: boolean) => {
		setMorningReminderEnabled(checked);
		toast.info("알림 기능은 곧 지원될 예정이에요");
	};

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
					<div>
						<p className="text-sm font-medium">목표 시간 알림</p>
						<p className="text-xs text-muted-foreground">목표 시간이 되면 알려드려요</p>
					</div>
					<Switch checked={notificationEnabled} onCheckedChange={handleNotificationChange} />
				</div>
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium">아침 리마인더</p>
						<p className="text-xs text-muted-foreground">아침에 오늘의 목표를 상기시켜요</p>
					</div>
					<Switch checked={morningReminderEnabled} onCheckedChange={handleMorningChange} />
				</div>
			</CardContent>
		</Card>
	);
}
