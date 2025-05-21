export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for login page
  if (to.path === '/login') {
    return;
  }

  // In our simplified version, we always consider the user authenticated
  // This is just a placeholder for future authentication implementation
  const { isAuthenticated } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login');
  }
});
