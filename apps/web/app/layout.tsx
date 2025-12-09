import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const SITE_URL = "https://interval-web.vercel.app";
const SITE_NAME = "간격";
const SITE_DESCRIPTION =
	"지금 한 개비 말고, 조금 있다가 한 개비. 담배를 끊는 게 아니라, 담배와의 '간격'을 조금씩 벌려주는 심리 타이머 앱입니다.";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: [
		"금연",
		"금연 앱",
		"담배 끊기",
		"흡연 간격",
		"담배 줄이기",
		"금연 타이머",
		"흡연 기록",
		"금연 도우미",
		"간격",
		"interval",
		"smoking tracker",
		"quit smoking",
	],
	authors: [{ name: "간격 팀" }],
	creator: "간격 팀",
	publisher: "간격",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "ko_KR",
		url: SITE_URL,
		siteName: SITE_NAME,
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		images: [
			{
				url: "/og.png",
				width: 1200,
				height: 630,
				alt: "간격 - 담배와의 거리를 벌려주는 심리 타이머",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		images: ["/og.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: SITE_NAME,
	},
	category: "health",
	alternates: {
		canonical: SITE_URL,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Toaster richColors closeButton position="top-center" />
				{children}
			</body>
		</html>
	);
}
