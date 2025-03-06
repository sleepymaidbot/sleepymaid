import { Link, Route } from "@tanstack/react-router";
import { User } from "~/utils/types";

export default function NavBar({ user }: { user: User | null }) {
	return (
		<div className="flex gap-2 p-2 py-4 text-lg">
			<Link
				to="/"
				activeProps={{
					className: "font-bold",
				}}
				activeOptions={{ exact: true }}
			>
				Home
			</Link>{" "}
			<Link
				to="/posts"
				activeProps={{
					className: "font-bold",
				}}
			>
				Posts
			</Link>{" "}
			<Link
				to="/users"
				activeProps={{
					className: "font-bold",
				}}
			>
				Users
			</Link>{" "}
			<Link
				to="/layout-a"
				activeProps={{
					className: "font-bold",
				}}
			>
				Layout
			</Link>{" "}
			<Link
				to="/deferred"
				activeProps={{
					className: "font-bold",
				}}
			>
				Deferred
			</Link>{" "}
			{/* <Link
        // @ts-expect-error
        to="/this-route-does-not-exist"
        activeProps={{
            className: "font-bold",
        }}
    >
        This Route Does Not Exist
    </Link> */}
			<div className="ml-auto">
				{user ? (
					<>
						<span className="mr-2">{user.userId}</span>
						<Link to="/logout">Logout</Link>
					</>
				) : (
					<Link to="/login">Login</Link>
				)}
			</div>
		</div>
	);
}
