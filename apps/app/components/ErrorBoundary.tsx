import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "@/lib/theme";

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleRetry = (): void => {
		this.setState({ hasError: false, error: null });
	};

	render(): React.ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<View style={styles.container}>
					<Text style={styles.title}>문제가 발생했습니다</Text>
					<Text style={styles.message}>앱에서 오류가 발생했습니다.{"\n"}다시 시도해 주세요.</Text>
					<TouchableOpacity style={styles.button} onPress={this.handleRetry}>
						<Text style={styles.buttonText}>다시 시도</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return this.props.children;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.background,
		padding: 24,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: 12,
	},
	message: {
		fontSize: 14,
		color: COLORS.secondary,
		textAlign: "center",
		marginBottom: 24,
		lineHeight: 20,
	},
	button: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	buttonText: {
		color: COLORS.background,
		fontSize: 16,
		fontWeight: "500",
	},
});
