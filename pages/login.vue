<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="w-full max-w-md px-4">
      <UCard class="w-full border-0 shadow-2xl rounded-xl overflow-hidden">
        <template #header>
          <div class="text-center mb-4">
            <h1 class="text-3xl font-bold text-secondary-700 dark:text-primary-400">
              Iniciar Sesión
            </h1>
            <div class="h-1 w-20 bg-primary-500/50 mx-auto mt-3 rounded-full"></div>
          </div>
        </template>


        <form @submit.prevent="handleLogin" class="space-y-6">
          <UAlert v-if="loginError" color="red" variant="soft" icon="i-heroicons-exclamation-triangle"
            :title="loginError" class="mb-2 animate-fade-in" />

          <UFormField label="Usuario" help="Ingrese su usuario o correo" class="mx-auto w-full">
            <UInput icon="i-lucide-user" v-model="username" placeholder="Usuario" size="lg" class="w-4/5" />
          </UFormField> 

          <UFormField label="Contraseña" help="Ingrese su contraseña" class="mx-auto w-full">
          <UInput v-model="password" icon="i-lucide-lock" type="password" label="Contraseña" size="lg" class="w-4/5">
            <template #trailing>
              <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show" aria-controls="password"
                @click="show = !show" />
            </template>
          </UInput>
          </UFormField>


          <div class="flex items-center justify-between mt-6">
            <UCheckbox v-model="rememberMe" :label="t('rememberMe')" color="primary" />
          </div>

          <UButton type="submit" block color="primary" size="xl" :loading="isLoading"
            class="mt-8 py-3 rounded-xl shadow-lg font-semibold text-lg">
            Iniciar sesión
          </UButton>
        </form>

        <template #footer>
          <div class="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {{ new Date().getFullYear() }} XCIEN. Todos los derechos reservados.
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Define the layout for this page
definePageMeta({
  layout: 'auth'
});

// Get router and translations
const router = useRouter();
const { t } = useTranslation();
const { login } = useAuth();

// Form state
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const loginError = ref('');
const show = ref(false); // Added for password visibility toggle

// Handle login submission
const handleLogin = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  loginError.value = '';

  try {
    // Call login function from auth composable
    // In our simplified version, this will always succeed
    const success = await login();

    if (success) {
      // Redirect to dashboard
      navigateTo('/dashboard');
    } else {
      // For demonstration, set a generic error if login isn't explicitly successful
      loginError.value = 'Usuario o contraseña incorrectos.';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.value = 'Ocurrió un error al intentar iniciar sesión. Por favor, inténtelo de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>