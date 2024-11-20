<script lang="ts">
	import "../app.css";
	let { children } = $props();
	import Navbar from "$lib/components/navbar/navbar.svelte";
</script>

<Navbar />

<main class="pt-16">
	{@render children()}
</main>
