import type { Variants, Transition } from "motion/react";

const DURATION = {
	fast: 0.15,
	normal: 0.25,
	slow: 0.4,
} as const;

const EASE = {
	default: [0.25, 0.1, 0.25, 1],
	out: [0, 0, 0.2, 1],
	in: [0.4, 0, 1, 1],
	bounce: [0.34, 1.56, 0.64, 1],
} as const;

export const fadeIn = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: DURATION.fast } },
} satisfies Variants;

export const slideUp = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.normal, ease: EASE.out },
	},
} satisfies Variants;

export const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.06 },
	},
} satisfies Variants;

export const staggerItem = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.normal, ease: EASE.out },
	},
} satisfies Variants;

export const slideInRight = {
	hidden: { opacity: 0, x: 16 },
	visible: { opacity: 1, x: 0, transition: { duration: DURATION.normal, ease: EASE.out } },
	exit: { opacity: 0, x: -16, transition: { duration: DURATION.fast } },
} satisfies Variants;

export const scaleIn = {
	hidden: { opacity: 0, scale: 0.96 },
	visible: { opacity: 1, scale: 1, transition: { duration: DURATION.normal, ease: EASE.out } },
	exit: { opacity: 0, scale: 0.96, transition: { duration: DURATION.fast } },
} satisfies Variants;

export const celebration = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: DURATION.slow,
			ease: EASE.bounce,
		},
	},
} satisfies Variants;

export const celebrationPulse = {
	initial: { scale: 1 },
	pulse: {
		scale: [1, 1.05, 1],
		transition: {
			duration: 0.6,
			ease: EASE.out,
			repeat: 2,
		},
	},
} satisfies Variants;

export const successCheck = {
	hidden: { pathLength: 0, opacity: 0 },
	visible: {
		pathLength: 1,
		opacity: 1,
		transition: {
			pathLength: { duration: 0.4, ease: EASE.out },
			opacity: { duration: 0.2 },
		},
	},
} satisfies Variants;

export const countdownTick = {
	tick: {
		scale: [1, 1.1, 1],
		transition: { duration: 0.2 },
	},
} satisfies Variants;

export const drawerContent = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.fast, ease: EASE.out },
	},
	exit: {
		opacity: 0,
		y: 4,
		transition: { duration: DURATION.fast },
	},
} satisfies Variants;

export function createStaggeredDelay(index: number, baseDelay = 0.06): { delay: number } {
	return { delay: baseDelay * (index + 1) };
}

export function getReducedMotionVariants(variants: Variants): Variants {
	const reduced: Variants = {};
	for (const [key, value] of Object.entries(variants)) {
		if (typeof value === "object" && value !== null) {
			reduced[key] = {
				...value,
				transition: { duration: 0 },
			};
		}
	}
	return reduced;
}

export function useMotionPreference(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const springTransition: Transition = {
	type: "spring",
	stiffness: 400,
	damping: 30,
};

export const gentleSpring: Transition = {
	type: "spring",
	stiffness: 200,
	damping: 20,
};
