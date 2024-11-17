/**
 * Checks if the given permissions include the specified flag.
 *
 * @param permissions - The BigInt representing the permissions.
 * @param flag - The specific permission flag to check.
 * @returns Boolean indicating if the permission is present.
 */
export function hasPermission(permissions: bigint, flag: bigint): boolean {
	return (permissions & flag) === flag;
}
