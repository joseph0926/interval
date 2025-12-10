import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from "@/components/ui/drawer";
import { FirstSmokeContent } from "./first-smoke-content";
import { NormalSmokeContent } from "./normal-smoke-content";
import { EarlySmokeContent } from "./early-smoke-content";
import type { HomeState, TodaySummary } from "@/types/home.type";

interface SmokingDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	state: HomeState;
	summary: TodaySummary;
}

export function SmokingDrawer({ open, onOpenChange, state, summary }: SmokingDrawerProps) {
	const handleComplete = () => {
		onOpenChange(false);
	};

	const getTitle = () => {
		switch (state.type) {
			case "BEFORE_FIRST":
				return "오늘 첫 담배";
			case "TARGET_REACHED":
				return "흡연 기록";
			case "TIMER_RUNNING":
				return "조기 흡연";
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>{getTitle()}</DrawerTitle>
					<DrawerDescription className="sr-only">흡연 기록을 입력하세요</DrawerDescription>
				</DrawerHeader>
				{state.type === "BEFORE_FIRST" && (
					<FirstSmokeContent summary={summary} onComplete={handleComplete} />
				)}
				{state.type === "TARGET_REACHED" && (
					<NormalSmokeContent summary={summary} onComplete={handleComplete} />
				)}
				{state.type === "TIMER_RUNNING" && (
					<EarlySmokeContent summary={summary} onComplete={handleComplete} />
				)}
			</DrawerContent>
		</Drawer>
	);
}
