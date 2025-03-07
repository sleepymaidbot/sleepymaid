import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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

	useEffect(() => {
		if (logout.isLoading && !isLoading) {
			setIsLoading(true);
		}
	}, [logout.isLoading, isLoading]);

	useEffect(() => {
		if (logout.isSuccess) {
			console.log("Logout successful, redirecting to home");
			window.location.href = "/";
		}
	}, [logout.isSuccess]);

	if (logout.isLoading) {
		return <div>Logging out...</div>;
	}

	if (logout.isError) {
		return <div>Error logging out: {logout.error.message}</div>;
	}

	return <div>Logging out...</div>;
}
