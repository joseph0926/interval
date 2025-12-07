import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/hooks/useSession";

export default function OnboardingScreen() {
	const { createSession } = useSession();

	const handleStart = async () => {
		await createSession();
		router.replace("/(tabs)");
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>간격</Text>
				<Text style={styles.subtitle}>지금 한 개비 말고, 조금 있다가 한 개비.</Text>
				<Text style={styles.description}>
					간격은 지금 당장 끊으라고 하지 않아요.{"\n"}
					담배와의 '간격'을 조금씩 벌려보는{"\n"}
					연습부터 시작해요.
				</Text>
			</View>
			<View style={styles.buttonContainer}>
				<Pressable style={styles.button} onPress={handleStart}>
					<Text style={styles.buttonText}>시작하기</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	title: {
		fontSize: 48,
		fontWeight: "bold",
		marginBottom: 16,
	},
	subtitle: {
		fontSize: 18,
		color: "#666",
		marginBottom: 32,
	},
	description: {
		fontSize: 16,
		color: "#888",
		textAlign: "center",
		lineHeight: 24,
	},
	buttonContainer: {
		paddingHorizontal: 24,
		paddingBottom: 24,
	},
	button: {
		backgroundColor: "#000",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
