import { Link, Outlet } from "react-router";

export function RootLayout() {
	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<nav className="container mx-auto flex h-14 items-center gap-6 px-4">
					<Link to="/" className="font-semibold">
						LexiLine
					</Link>
					<Link to="/words" className="text-muted-foreground hover:text-foreground">
						단어
					</Link>
					<Link to="/review" className="text-muted-foreground hover:text-foreground">
						복습
					</Link>
				</nav>
			</header>
			<main className="container mx-auto px-4 py-6">
				<Outlet />
			</main>
		</div>
	);
}
