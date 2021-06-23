// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function checkUserRole(
	oldMemberRole: string[],
	newMemberRole: string[]
) {
	const ColorfulNeedRole = [
		'admin',
		'cute',
		'nitro booster',
		'collaborateur serveur'
	];
	let wasEligibleForColorfulRole = false;
	let eligibleForColorfulRole = false;
	oldMemberRole.forEach((role) => {
		if (ColorfulNeedRole.includes(role)) {
			wasEligibleForColorfulRole = true;
		}
	});
	newMemberRole.forEach((role) => {
		if (ColorfulNeedRole.includes(role.toLowerCase())) {
			eligibleForColorfulRole = true;
		}
	});
	if (wasEligibleForColorfulRole && !eligibleForColorfulRole) {
		if (newMemberRole.includes('Colorful')) {
			return 'remove';
		} else {
			return 'none';
		}
	}
	if (!wasEligibleForColorfulRole && eligibleForColorfulRole) {
		if (newMemberRole.includes('Colorful')) {
			return 'none';
		} else {
			return 'add';
		}
	}

	if (!wasEligibleForColorfulRole && !eligibleForColorfulRole) {
		if (newMemberRole.includes('Colorful')) {
			return 'remove';
		} else {
			return 'none';
		}
	}

	if (wasEligibleForColorfulRole && eligibleForColorfulRole) {
		if (newMemberRole.includes('Colorful')) {
			return 'none';
		} else {
			return 'add';
		}
	}
}

export function performRole(action: string, role, member) {
	switch (action) {
		case 'add':
			try {
				member.roles.add(role);
				return 'Done';
			} catch (err) {
				return `Error: ${err.message}`;
			}
		case 'remove':
			try {
				member.roles.remove(role);
				return 'Done';
			} catch (err) {
				return `Error: ${err.message}`;
			}
		default:
			return 'yes';
	}
}
