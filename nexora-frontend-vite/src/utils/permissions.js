export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  // Add more logic as needed
  return permission === 'read';
};