import { useState, useCallback, useMemo } from "react";
import { useSyncedModel } from "@firsttx/local-first";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleDrawer, FloatingSuggestionCard } from "@/components/module";
import { QuickDepositFab, QUICK_DEPOSIT_CHIPS } from "@/components/primitives";
import { HaloHero } from "./halo-hero";
import { BentoSummary } from "./bento-summary";
import { ModuleList } from "./module-list";
import { EngineTodaySummaryModel } from "@/models/engine-today-summary.model";
import type { EngineModuleState } from "@/types/engine.type";
async function fetchEngineTodaySummary() {
	const json = await api.engine.today();
	return json.data;
}

export function EngineHomeContent() {
	const {
		data: summary,
		status,
		sync,
	} = useSyncedModel(EngineTodaySummaryModel, fetchEngineTodaySummary, {
		syncOnMount: "always",
	});

	const [drawerState, setDrawerState] = useState<{
		open: boolean;
		moduleState: EngineModuleState | null;
		mode: "action" | "urge" | "gap";
	}>({ open: false, moduleState: null, mode: "action" });

	const handleAction = useCallback((moduleState: EngineModuleState) => {
		if (moduleState.status === "GAP_DETECTED") {
			setDrawerState({ open: true, moduleState, mode: "gap" });
		} else {
			setDrawerState({ open: true, moduleState, mode: "action" });
		}
	}, []);

	const handleUrge = useCallback((moduleState: EngineModuleState) => {
		setDrawerState({ open: true, moduleState, mode: "urge" });
	}, []);

	const handleDrawerOpenChange = useCallback(
		(open: boolean) => {
			setDrawerState((prev) => ({ ...prev, open }));
			if (!open) {
				sync();
			}
		},
		[sync],
	);

	const handleComplete = useCallback(() => {
		sync();
	}, [sync]);

	const enabledModules = useMemo(() => {
		if (!summary) return [];
		return summary.modules.filter((m) => m.status !== "DISABLED");
	}, [summary]);

	const countdownModules = useMemo(() => {
		return enabledModules.filter((m) => m.status === "COUNTDOWN");
	}, [enabledModules]);

	const hasCountdown = countdownModules.length > 0;

	const handleQuickDeposit = useCallback(
		async (minutes: number) => {
			if (countdownModules.length === 0) return;
			await Promise.all(
				countdownModules.map((m) =>
					api.engine.delay({
						moduleType: m.moduleType,
						delayMinutes: minutes as 1 | 3 | 5 | 10,
						triggerContext: "FLOATING_CARD",
					}),
				),
			);
			sync();
		},
		[countdownModules, sync],
	);

	if (status === "loading" || !summary) {
		return <EngineHomeSkeleton />;
	}

	return (
		<>
			<div className="relative flex flex-1 flex-col pb-32 overflow-hidden">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/7 blur-3xl"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute top-40 left-6 h-56 w-56 rounded-full bg-focus/7 blur-3xl"
				/>
				<header className="px-6 pt-6">
					<p className="text-xs text-text-tertiary">{formatDate(new Date())}</p>
					<h1 className="mt-1 text-lg font-semibold tracking-tight text-text-primary">오늘</h1>
				</header>
				<section className="px-6 pt-4 pb-2">
					<HaloHero integrated={summary.integrated} />
				</section>
				<section className="px-6 pt-4 pb-4">
					<BentoSummary integrated={summary.integrated} activeModuleCount={enabledModules.length} />
				</section>
				{summary.floatingSuggestion && (
					<section className="px-6 pb-4">
						<FloatingSuggestionCard suggestion={summary.floatingSuggestion} onComplete={sync} />
					</section>
				)}
				<section className="flex-1 px-6 pb-6">
					<h2 className="mb-3 text-sm font-medium text-text-secondary">모듈</h2>
					<ModuleList
						modules={enabledModules}
						onModuleAction={handleAction}
						onModuleUrge={handleUrge}
					/>
				</section>
			</div>
			<QuickDepositFab
				visible={hasCountdown}
				moduleCount={countdownModules.length}
				chips={QUICK_DEPOSIT_CHIPS}
				onDeposit={handleQuickDeposit}
			/>
			{drawerState.moduleState && (
				<ModuleDrawer
					open={drawerState.open}
					onOpenChange={handleDrawerOpenChange}
					moduleState={drawerState.moduleState}
					mode={drawerState.mode}
					onComplete={handleComplete}
				/>
			)}
		</>
	);
}

function EngineHomeSkeleton() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="px-6 pt-8 text-center">
				<Skeleton className="mx-auto h-4 w-24" />
			</div>
			<div className="flex items-center justify-center py-8">
				<Skeleton className="size-48 rounded-full" />
			</div>
			<div className="grid grid-cols-2 gap-3 px-6 pb-4">
				<Skeleton className="h-20 rounded-2xl" />
				<Skeleton className="h-20 rounded-2xl" />
			</div>
			<div className="flex flex-col gap-3 px-6 pb-6">
				<Skeleton className="h-20 rounded-2xl" />
				<Skeleton className="h-20 rounded-2xl" />
			</div>
		</div>
	);
}
