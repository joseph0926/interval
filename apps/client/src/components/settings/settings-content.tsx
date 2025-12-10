import { motion } from "motion/react";
import { SettingsHeader } from "./settings-header";
import { IntervalSettingCard } from "./interval-setting-card";
import { MotivationSettingCard } from "./motivation-setting-card";
import { NotificationSettingCard } from "./notification-setting-card";
import { DataSettingCard } from "./data-setting-card";
import { AppInfoCard } from "./app-info-card";
import type { UserSettings } from "@/types/settings.type";

interface SettingsContentProps {
	settings: UserSettings;
}

export function SettingsContent({ settings }: SettingsContentProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.15 }}
			className="flex flex-1 flex-col"
		>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				className="px-6 pt-12"
			>
				<SettingsHeader />
			</motion.div>
			<div className="flex flex-col gap-4 px-6 py-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<IntervalSettingCard currentInterval={settings.targetInterval} />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
				>
					<MotivationSettingCard currentMotivation={settings.motivation} />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<NotificationSettingCard
						notificationEnabled={settings.notificationEnabled}
						morningReminderEnabled={settings.morningReminderEnabled}
					/>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.25 }}
				>
					<DataSettingCard isGuest={settings.isGuest} />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<AppInfoCard />
				</motion.div>
			</div>
		</motion.div>
	);
}
