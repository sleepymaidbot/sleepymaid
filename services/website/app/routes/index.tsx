import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="p-2">
			<h3>Welcome Home!!!</h3>
			<Button variant="outline">
				<Link to="/login">Login</Link>
			</Button>
		</div>
	);
}
