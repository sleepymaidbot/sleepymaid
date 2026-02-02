import { useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Loading } from "~/components/Loading"
import { getLoginRedirectURL } from "~/utils/server/loginurl"

export const Route = createFileRoute("/login")({
	beforeLoad: async ({ context }) => {
		if (context.user) {
			throw redirect({ to: "/" })
		}
	},
	component: LoginComponent,
})

function LoginComponent() {
	const [isLoading, setIsLoading] = useState(false)

	const query = useQuery({
		queryKey: ["login"],
		queryFn: () => getLoginRedirectURL(),
		staleTime: Infinity,
		retry: false,
		enabled: !isLoading,
	})

	useEffect(() => {
		if (query.isLoading && !isLoading) {
			setIsLoading(true)
		}
	}, [query.isLoading, isLoading])

	if (query.isLoading) {
		return <Loading />
	}

	if (query.isError) {
		return <div>Error: {query.error.message}</div>
	}

	const data = query.data
	if (!data) {
		return <div>Error: No data</div>
	}

	const { url } = data

	useEffect(() => {
		if (url) {
			window.location.href = url
		}
	}, [url])

	return <button onClick={() => (window.location.href = url)}>Login with Discord</button>
}
