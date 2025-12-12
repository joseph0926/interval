import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "@/lib/theme";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: COLORS.primary,
				tabBarInactiveTintColor: COLORS.secondary,
				tabBarStyle: {
					borderTopWidth: 1,
					borderTopColor: COLORS.border,
					paddingTop: SIZES.tabBarPadding,
					paddingBottom: SIZES.tabBarPadding,
					height: SIZES.tabBarHeight,
				},
				tabBarLabelStyle: {
					fontSize: SIZES.tabBarFontSize,
					fontWeight: "500",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "오늘",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="report"
				options={{
					title: "리포트",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="bar-chart-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "설정",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="settings-outline" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
