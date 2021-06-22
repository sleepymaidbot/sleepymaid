export function checkUserRole(oldMember, newMember) {
  const oldRoles = oldMember.roles.cache
  oldRoles.map((role) => {
    console.log(role.name);
  });
  
  const newRoles = newMember.roles.cache
  newRoles.map((role) => {
    console.log(role.name);
  });
};