import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { useSyncedModel } from "@firsttx/local-first";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/date";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ModuleCard,
	ModuleDrawer,
	IntegratedSummaryCard,
	FloatingSuggestionCard,
} from "@/components/module";
import { EngineTodaySummaryModel } from "@/models/engine-today-summary.model";
import type { EngineTodaySummary, EngineModuleState } from "@/types/engine.type";

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

	if (status === "loading" || !summary) {
		return <EngineHomeSkeleton />;
	}

	const enabledModules = summary.modules.filter((m) => m.status !== "DISABLED");

	return (
		<>
			<motion.div
				variants={staggerContainer}
				initial="hidden"
				animate="visible"
				className="flex flex-1 flex-col"
			>
				<motion.div variants={staggerItem} className="px-6 pt-12">
					<EngineHomeHeader summary={summary} />
				</motion.div>

				<motion.div variants={staggerItem} className="px-6 py-6">
					<IntegratedSummaryCard integrated={summary.integrated} />
				</motion.div>

				{summary.floatingSuggestion && (
					<motion.div variants={staggerItem} className="px-6 pb-4">
						<FloatingSuggestionCard suggestion={summary.floatingSuggestion} onComplete={sync} />
					</motion.div>
				)}

				<div className="flex flex-1 flex-col gap-4 px-6 pb-6">
					{enabledModules.map((moduleState, idx) => (
						<motion.div key={moduleState.moduleType} variants={staggerItem} custom={idx}>
							<ModuleCard
								moduleState={moduleState}
								onAction={() => handleAction(moduleState)}
								onUrge={() => handleUrge(moduleState)}
							/>
						</motion.div>
					))}
				</div>
			</motion.div>

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

function EngineHomeHeader({ summary }: { summary: EngineTodaySummary }) {
	const today = new Date();
	const enabledCount = summary.modules.filter((m) => m.status !== "DISABLED").length;

	return (
		<div>
			<p className="text-sm text-muted-foreground">{formatDate(today)}</p>
			<h1 className="mt-1 text-xl font-semibold">{enabledCount}개 모듈로 거리 두기 중</h1>
		</div>
	);
}

function EngineHomeSkeleton() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="px-6 pt-12">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="mt-2 h-6 w-64" />
			</div>
			<div className="px-6 py-6">
				<Skeleton className="h-24 w-full rounded-xl" />
			</div>
			<div className="flex flex-col gap-4 px-6 pb-6">
				<Skeleton className="h-40 w-full rounded-xl" />
				<Skeleton className="h-40 w-full rounded-xl" />
			</div>
		</div>
	);
}
