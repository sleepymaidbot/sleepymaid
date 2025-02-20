import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { logoutFn } from "~/utils/server/logout";

export const Route = createFileRoute("/logout")({
	component: LogoutComponent,
});

function LogoutComponent() {
	const logout = useQuery({
		queryKey: ["logout"],
		queryFn: () => logoutFn(),
		staleTime: Infinity,
		retry: true,
	});

	if (logout.isLoading) {
		return <div>Logging out...</div>;
	}

	if (logout.isError) {
		return <div>Error logging out</div>;
	}

	return <div>Logged out</div>;
}
