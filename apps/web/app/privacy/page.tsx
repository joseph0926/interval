import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "개인정보 처리방침",
	description: "간격 앱의 개인정보 처리방침",
};

export default function PrivacyPage() {
	return (
		<main className="mx-auto max-w-2xl px-6 py-12">
			<h1 className="mb-8 text-2xl font-bold">개인정보 처리방침</h1>

			<p className="mb-6 text-muted-foreground">최종 수정일: 2025년 12월 9일</p>

			<section className="mb-8">
				<h2 className="mb-4 text-xl font-semibold">1. 수집하는 개인정보</h2>
				<p className="mb-4 text-muted-foreground">
					간격(이하 &quot;서비스&quot;)은 다음과 같은 정보를 수집합니다.
				</p>
				<ul className="list-inside list-disc space-y-2 text-muted-foreground">
					<li>흡연 기록 (시간, 이유, 간격)</li>
					<li>목표 설정 정보 (목표 간격, 동기)</li>
					<li>닉네임 (선택)</li>
					<li>서비스 이용 기록</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="mb-4 text-xl font-semibold">2. 개인정보 수집 목적</h2>
				<ul className="list-inside list-disc space-y-2 text-muted-foreground">
					<li>흡연 패턴 분석 및 통계 제공</li>
					<li>개인화된 인사이트 제공</li>
					<li>서비스 개선 및 신규 기능 개발</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="mb-4 text-xl font-semibold">3. 개인정보 보유 기간</h2>
				<p className="text-muted-foreground">
					회원 탈퇴 시 또는 수집 목적 달성 시 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이
					필요한 경우 해당 기간 동안 보관합니다.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="mb-4 text-xl font-semibold">4. 개인정보 제3자 제공</h2>
				<p className="text-muted-foreground">
					서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="mb-4 text-xl font-semibold">5. 개인정보 처리 위탁</h2>
				<p className="mb-4 text-muted-foreground">
					서비스 제공을 위해 다음 업체에 처리를 위탁합니다.
				</p>
				<ul className="list-inside list-disc space-y-2 text-muted-foreground">
					<li>Vercel Inc. - 웹 호스팅</li>
					<li>Neon / Supabase - 데이터베이스 호스팅</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="mb-4 text-xl font-semibold">6. 이용자의 권리</h2>
				<p className="mb-4 text-muted-foreground">
					이용자는 언제든지 다음 권리를 행사할 수 있습니다.
				</p>
				<ul className="list-inside list-disc space-y-2 text-muted-foreground">
					<li>개인정보 열람 요청</li>
					<li>개인정보 정정 요청</li>
					<li>개인정보 삭제 요청</li>
					<li>개인정보 처리 정지 요청</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="mb-4 text-xl font-semibold">7. 쿠키 사용</h2>
				<p className="text-muted-foreground">
					서비스는 세션 관리를 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수
					있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
				</p>
			</section>

			<section className="mb-8">
				<h2 className="mb-4 text-xl font-semibold">8. 개인정보 보호책임자</h2>
				<p className="text-muted-foreground">
					개인정보 처리에 관한 문의는 아래로 연락해 주시기 바랍니다.
				</p>
				<p className="mt-2 text-muted-foreground">이메일: privacy@interval-app.com</p>
			</section>

			<section>
				<h2 className="mb-4 text-xl font-semibold">9. 방침 변경</h2>
				<p className="text-muted-foreground">
					본 방침은 법령 및 서비스 변경에 따라 수정될 수 있으며, 변경 시 앱 내 공지를 통해
					안내합니다.
				</p>
			</section>
		</main>
	);
}
