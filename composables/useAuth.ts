import { ref } from 'vue';

// Create a reactive state that persists between component changes
// In this simplified version, the user is always authenticated
const isAuthenticated = ref(true);
const user = ref<{ username: string }>({ username: 'demo' });

export function useAuth() {

  const login = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        isAuthenticated.value = true;
        user.value = { username: 'demo' };
        
        // Store in localStorage for persistence
        if (process.client) {
          localStorage.setItem('auth', JSON.stringify({ 
            isAuthenticated: true, 
            user: { username: 'demo' } 
          }));
        }
        
        resolve(true);
      }, 300);
    });
  };


  const logout = () => {
    isAuthenticated.value = false;
    user.value = { username: '' };
    
    if (process.client) {
      localStorage.removeItem('auth');
    }
    
    navigateTo('/login');
  };


  
  const initAuth = () => {
    isAuthenticated.value = true;
    user.value = { username: 'demo' };
    
    if (process.client) {
      localStorage.setItem('auth', JSON.stringify({ 
        isAuthenticated: true, 
        user: { username: 'demo' } 
      }));
    }
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
    initAuth
  };
}
