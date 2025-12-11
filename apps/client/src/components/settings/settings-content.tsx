import { motion } from "motion/react";
import { SettingsHeader } from "./settings-header";
import { IntervalSettingCard } from "./interval-setting-card";
import { MotivationSettingCard } from "./motivation-setting-card";
import { NotificationSettingCard } from "./notification-setting-card";
import { DataSettingCard } from "./data-setting-card";
import { AppInfoCard } from "./app-info-card";
import { fadeIn, slideUp, createStaggeredDelay } from "@/lib/motion";
import type { Settings } from "@/types/settings.type";

interface SettingsContentProps {
	settings: Settings & { isGuest: boolean };
}

export function SettingsContent({ settings }: SettingsContentProps) {
	return (
		<motion.div
			variants={fadeIn}
			initial="hidden"
			animate="visible"
			className="flex flex-1 flex-col"
		>
			<motion.div variants={slideUp} initial="hidden" animate="visible" className="px-6 pt-12">
				<SettingsHeader />
			</motion.div>
			<div className="flex flex-col gap-4 px-6 py-6">
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(0, 0.05)}
				>
					<IntervalSettingCard currentInterval={settings.currentTargetInterval} />
				</motion.div>
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(1, 0.05)}
				>
					<MotivationSettingCard currentMotivation={settings.currentMotivation} />
				</motion.div>
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(2, 0.05)}
				>
					<NotificationSettingCard
						notificationEnabled={settings.notifyOnTargetTime}
						morningReminderEnabled={settings.notifyMorningDelay}
					/>
				</motion.div>
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(3, 0.05)}
				>
					<DataSettingCard isGuest={settings.isGuest} />
				</motion.div>
				<motion.div
					variants={slideUp}
					initial="hidden"
					animate="visible"
					transition={createStaggeredDelay(4, 0.05)}
				>
					<AppInfoCard />
				</motion.div>
			</div>
		</motion.div>
	);
}
