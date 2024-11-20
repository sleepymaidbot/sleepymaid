<script>
	let isMenuOpen = false;

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen;
	};
</script>

<nav class="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<!-- Logo -->
			<div class="flex-shrink-0 flex items-center">
				<a href="/" class="text-xl font-bold text-gray-800"> Your Logo </a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex md:items-center md:space-x-8">
				<a href="/" class="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium transition-colors"> Home </a>
				<a href="/about" class="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium transition-colors"> About </a>
				<a href="/services" class="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium transition-colors">
					Services
				</a>
				<a href="/contact" class="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium transition-colors">
					Contact
				</a>
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden flex items-center">
				<button
					on:click={toggleMenu}
					class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
					aria-label="Toggle menu"
				>
					<svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
						<path
							class:hidden={isMenuOpen}
							class="inline-flex"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
						<path
							class:hidden={!isMenuOpen}
							class="inline-flex"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if isMenuOpen}
		<div class="md:hidden">
			<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
				<a href="/" class="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"> Home </a>
				<a href="/about" class="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
					About
				</a>
				<a href="/services" class="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
					Services
				</a>
				<a href="/contact" class="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
					Contact
				</a>
			</div>
		</div>
	{/if}
</nav>
