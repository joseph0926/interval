import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getReportData } from "@/lib/dal";
import { ReportContent } from "@/components/report/report-content";
import ReportLoading from "./loading";

async function ReportData({ userId }: { userId: string }) {
	const reportData = await getReportData(userId);
	return <ReportContent data={reportData} />;
}

export default async function ReportPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/onboarding");
	}

	return (
		<Suspense fallback={<ReportLoading />}>
			<ReportData userId={user.id} />
		</Suspense>
	);
}
