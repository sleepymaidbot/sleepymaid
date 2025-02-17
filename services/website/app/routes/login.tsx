import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loading } from "~/components/Loading";
import { getLoginRedirectURL } from "~/utils/server/loginurl";

export const Route = createFileRoute("/login")({
	component: LoginComponent,
});

function LoginComponent() {
	const query = useQuery({
		queryKey: ["login"],
		queryFn: () => getLoginRedirectURL(),
	});

	if (query.isLoading) {
		return <Loading />;
	}

	if (query.isError) {
		return <div>Error: {query.error.message}</div>;
	}

	const data = query.data;
	if (!data) {
		return <div>Error: No data</div>;
	}
	window.location.href = data;

	return <button onClick={() => (window.location.href = data)}>Login with Discord</button>;
}
