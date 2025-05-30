export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (to.path === '/login') {
    if (user.value) {
      return navigateTo('/');
    }
    return;
  }

  if (!user.value) {
    return navigateTo('/login');
  }
  
});
