import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { createServerFn, Meta, Scripts } from "@tanstack/start";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import { useSession } from "~/hooks/useSession";
import NavBar from "~/components/NavBar";
import { User } from "~/utils/types";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	const session = await useSession();

	if (!session.data.sessionId) {
		return null;
	}

	return {
		sessionId: session.data.sessionId,
		userId: session.data.userId,
		username: session.data.username,
		avatar: session.data.avatar,
	} as User;
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
				<NavBar user={user} />
				{children}
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools buttonPosition="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
