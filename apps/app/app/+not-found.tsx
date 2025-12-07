import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotFoundScreen() {
	const insets = useSafeAreaInsets();

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
				<View style={styles.content}>
					<Text style={styles.title}>간격</Text>
					<Text style={styles.subtitle}>페이지를 찾을 수 없어요</Text>
					<Text style={styles.description}>
						요청하신 페이지가 존재하지 않거나{"\n"}이동되었을 수 있어요.
					</Text>
				</View>
				<View style={styles.buttonContainer}>
					<Link href="/" asChild>
						<Pressable style={styles.button}>
							<Text style={styles.buttonText}>홈으로 돌아가기</Text>
						</Pressable>
					</Link>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 24,
	},
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		color: "#000",
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: 18,
		fontWeight: "500",
		color: "#000",
		marginTop: 16,
	},
	description: {
		fontSize: 15,
		color: "#666",
		textAlign: "center",
		marginTop: 8,
		lineHeight: 22,
	},
	buttonContainer: {
		paddingBottom: 24,
	},
	button: {
		backgroundColor: "#000",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
