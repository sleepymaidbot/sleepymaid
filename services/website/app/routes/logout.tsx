import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { logoutFn } from "~/utils/server/logout";

export const Route = createFileRoute("/logout")({
	component: LogoutComponent,
});

function LogoutComponent() {
	const [isLoading, setIsLoading] = useState(false);

	const logout = useQuery({
		queryKey: ["logout"],
		queryFn: () => logoutFn(),
		staleTime: Infinity,
		retry: true,
		enabled: !isLoading,
	});

	if (logout.isLoading) {
		setIsLoading(true);
		return <div>Logging out...</div>;
	}

	if (logout.isError) {
		return <div>Error logging out</div>;
	}

	window.location.href = "/";

	return <div>Logged out</div>;
}
