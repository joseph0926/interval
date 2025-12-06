import { redirect } from "next/navigation";
import { getCurrentUser, getReportData } from "@/lib/dal";
import { ReportContent } from "@/components/report/report-content";

export default async function ReportPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/onboarding");
	}

	const reportData = await getReportData(user.id);

	return <ReportContent data={reportData} />;
}
