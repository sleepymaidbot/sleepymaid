export function formatNumber(number: number): string {
	return new Intl.NumberFormat("en-US", { useGrouping: true }).format(number);
}
