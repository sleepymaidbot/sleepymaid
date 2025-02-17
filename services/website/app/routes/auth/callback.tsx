import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { loginFn } from "~/utils/server/login";
import { Loading } from "~/components/Loading";
export const Route = createFileRoute("/auth/callback")({
	component: AuthCallbackComponent,
});

function AuthCallbackComponent() {
	console.log(window.location.search);
	const searchParams = new URLSearchParams(window.location.search);
	const code = searchParams.get("code");
	const state = searchParams.get("state");

	searchParams.delete("code");
	searchParams.delete("state");
	window.history.replaceState(
		{},
		"",
		`${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
	);
	if (!code || !state) {
		redirect({ to: "/" });
	}

	console.log("Code", code);
	console.log("State", state);

	const query = useQuery({
		queryKey: ["auth-callback", code],
		queryFn: () => loginFn({ data: { code: code!, state: state! } }),
		staleTime: Infinity,
		enabled: !!code && !!state,
		retry: false,
	});

	if (query.isLoading) {
		return <Loading />;
	}

	if (query.isError) {
		return <div>Error: {query.error.message} </div>;
	}

	const router = useRouter();

	router.invalidate();
	router.navigate({ to: "/dashboard" });
}
