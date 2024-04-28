import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { ViewTransitions } from "next-view-transitions";
import NavBar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { getServerAuthSession } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata = {
	title: "Sleepy Maid Dashboard",
	description: "Dashboard for Sleepy Maid",
	icons: [{ rel: "icon", url: "/icon.png" }],
};

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
	const session = await getServerAuthSession();
	return (
		<html lang="en">
			<body className={`font-sans ${GeistSans.className} flex h-screen flex-col`}>
				<TRPCReactProvider>
					<ViewTransitions>
						<ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
							<NavBar session={session} />
							{children}
						</ThemeProvider>
					</ViewTransitions>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
