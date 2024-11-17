<script lang="ts">
	import { enhance } from "$app/forms";

	let { data } = $props();
</script>

<h1>Hi, {data.user.displayName}!</h1>
<form method="post" use:enhance>
	<button>Sign out</button>
</form>
