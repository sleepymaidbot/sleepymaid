import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { loginFn } from "~/utils/server/login";
import { Loading } from "~/components/Loading";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/auth/callback")({
	component: AuthCallbackComponent,
});

function AuthCallbackComponent() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [authParams, setAuthParams] = useState<{ code: string | null; state: string | null }>({
		code: null,
		state: null,
	});

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		setAuthParams({
			code: searchParams.get("code"),
			state: searchParams.get("state"),
		});
	}, []);

	const { code, state } = authParams;

	const query = useQuery({
		queryKey: ["auth-callback", code ?? ""],
		queryFn: () => loginFn({ data: { code: code!, state: state! } }),
		staleTime: Infinity,
		enabled: !isLoading && !!code && !!state,
		retry: false,
	});

	useEffect(() => {
		if (query.isLoading && !isLoading) {
			setIsLoading(true);
		}
	}, [query.isLoading, isLoading]);

	useEffect(() => {
		if (query.isSuccess) {
			console.log("Login successful, attempting navigation");
			try {
				router.invalidate();
				window.location.href = "/dashboard";
			} catch (error) {
				console.error("Navigation error:", error);
			}
		}
	}, [query.isSuccess, router]);

	if (!code || !state) {
		return <Loading />;
	}

	if (query.isLoading) {
		return <Loading />;
	}

	if (query.isError) {
		console.error("Login error:", query.error);
		return <div>Error: {query.error.message} </div>;
	}

	return <Loading />;
}
