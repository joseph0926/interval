import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Layers, Check } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MODULE_CONFIGS } from "@/types/engine.type";
import type { EngineSettings, EngineModuleType } from "@/lib/api-types";

interface ModuleSettingsCardProps {
	initialSettings?: EngineSettings;
}

export function ModuleSettingsCard({ initialSettings }: ModuleSettingsCardProps) {
	const [settings, setSettings] = useState<EngineSettings | null>(initialSettings ?? null);
	const [isPending, startTransition] = useTransition();
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		if (!initialSettings) {
			api.engine.getSettings().then((res) => {
				if (res.success) {
					setSettings(res.data);
				}
			});
		}
	}, [initialSettings]);

	const handleModuleToggle = (moduleType: EngineModuleType, enabled: boolean) => {
		if (!settings) return;
		setSettings((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				modules: prev.modules.map((m) => (m.moduleType === moduleType ? { ...m, enabled } : m)),
			};
		});
		setHasChanges(true);
	};

	const handleIntervalChange = (moduleType: EngineModuleType, targetIntervalMin: number) => {
		if (!settings) return;
		setSettings((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				modules: prev.modules.map((m) =>
					m.moduleType === moduleType ? { ...m, targetIntervalMin } : m,
				),
			};
		});
		setHasChanges(true);
	};

	const handleSave = () => {
		if (!settings) return;
		startTransition(async () => {
			try {
				const result = await api.engine.updateSettings({
					modules: settings.modules.map((m) => ({
						moduleType: m.moduleType,
						enabled: m.enabled,
						targetIntervalMin: m.targetIntervalMin,
					})),
				});
				if (result.success) {
					setSettings(result.data);
					setHasChanges(false);
					toast.success("모듈 설정이 저장되었어요");
				}
			} catch {
				toast.error("설정 저장에 실패했어요");
			}
		});
	};

	if (!settings) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base">
						<Layers className="size-4" />
						모듈 설정
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">로딩 중...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Layers className="size-4" />
					모듈 설정
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<p className="text-sm text-muted-foreground">
					관리할 모듈과 각 모듈의 목표 간격을 설정해요
				</p>

				{settings.modules.map((module) => {
					const config = MODULE_CONFIGS[module.moduleType];
					if (!config) return null;

					return (
						<div key={module.moduleType} className="rounded-lg border p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="text-xl">{config.icon}</span>
									<span className="font-medium">{config.label}</span>
								</div>
								<Switch
									checked={module.enabled}
									onCheckedChange={(checked) => handleModuleToggle(module.moduleType, checked)}
								/>
							</div>

							{module.enabled && (
								<div className="mt-4 flex flex-col gap-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">목표 간격</span>
										<span className="font-medium">{module.targetIntervalMin}분</span>
									</div>
									<Slider
										value={[module.targetIntervalMin]}
										onValueChange={(v) => handleIntervalChange(module.moduleType, v[0])}
										min={module.moduleType === "CAFFEINE" ? 60 : 10}
										max={module.moduleType === "CAFFEINE" ? 480 : 180}
										step={5}
										className="w-full"
									/>
								</div>
							)}
						</div>
					);
				})}

				{hasChanges && (
					<Button size="sm" onClick={handleSave} disabled={isPending} className="w-full">
						{isPending ? (
							"저장 중..."
						) : (
							<>
								<Check className="mr-1 size-4" />
								저장
							</>
						)}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
