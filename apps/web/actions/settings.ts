"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";

export async function updateTargetInterval(
	targetInterval: number,
): Promise<{ success: boolean; error?: string }> {
	try {
		const user = await requireUser();

		await prisma.user.update({
			where: { id: user.id },
			data: { currentTargetInterval: targetInterval },
		});

		revalidatePath("/settings");
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Failed to update target interval:", error);
		return { success: false, error: "설정 변경에 실패했습니다." };
	}
}

export async function updateMotivation(
	motivation: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const user = await requireUser();

		await prisma.user.update({
			where: { id: user.id },
			data: { currentMotivation: motivation || null },
		});

		revalidatePath("/settings");
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Failed to update motivation:", error);
		return { success: false, error: "설정 변경에 실패했습니다." };
	}
}

export async function resetAllData(): Promise<{ success: boolean; error?: string }> {
	try {
		const user = await requireUser();

		await prisma.smokingRecord.deleteMany({
			where: { userId: user.id },
		});

		await prisma.dailySnapshot.deleteMany({
			where: { userId: user.id },
		});

		revalidatePath("/");
		revalidatePath("/report");
		revalidatePath("/settings");
		return { success: true };
	} catch (error) {
		console.error("Failed to reset data:", error);
		return { success: false, error: "데이터 초기화에 실패했습니다." };
	}
}

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
	try {
		const user = await requireUser();

		await prisma.user.delete({
			where: { id: user.id },
		});

		const cookieStore = await cookies();
		cookieStore.delete("session_user_id");

		redirect("/onboarding");
	} catch (error) {
		console.error("Failed to delete account:", error);
		return { success: false, error: "계정 삭제에 실패했습니다." };
	}
}
