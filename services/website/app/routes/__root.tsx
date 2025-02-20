import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { createServerFn, Meta, Scripts } from "@tanstack/start";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import { useSession } from "~/hooks/useSession";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	const session = await useSession();

	if (!session.data.sessionId) {
		return null;
	}

	return {
		sessionId: session.data.sessionId,
		userId: session.data.userId,
	};
});

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title: "Sleepy Maid",
				description: `Sleepy Maid is a Discord bot that helps you manage your server.`,
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	beforeLoad: async () => {
		const user = await fetchUser();

		return {
			user,
		};
	},
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

const TanStackRouterDevtools =
	process.env.NODE_ENV === "production"
		? () => null
		: React.lazy(() =>
				import("@tanstack/router-devtools").then((res) => ({
					default: res.TanStackRouterDevtools,
				})),
			);

const ReactQueryDevtools =
	process.env.NODE_ENV === "production"
		? () => null
		: React.lazy(() =>
				import("@tanstack/react-query-devtools").then((res) => ({
					default: res.ReactQueryDevtools,
				})),
			);

function RootDocument({ children }: { children: React.ReactNode }) {
	const { user } = Route.useRouteContext();
	return (
		<html>
			<head>
				<Meta />
			</head>
			<body>
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
				<hr />
				{children}
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools buttonPosition="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
