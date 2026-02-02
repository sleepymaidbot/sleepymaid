import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/$guildId")({
	component: RouteComponent,
})

function RouteComponent() {
	const { guildId } = Route.useParams()
	return <div>Hello "/dashboard/${guildId}"!</div>
}
