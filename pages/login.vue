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
          <UFormField label="Usuario" help="Ingrese su usuario o correo" class="mx-auto w-full">
            <UInput icon="i-lucide-user" v-model="username" placeholder="Usuario" size="lg" class="w-4/5" />
          </UFormField>

          <UFormField label="Contraseña" help="Ingrese su contraseña" class="mx-auto w-full">
            <UInput v-model="password" :type="show ? 'text' : 'password'" icon="i-lucide-lock" placeholder="Contraseña"
              size="lg" class="w-4/5">
              <template #trailing>
                <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="show"
                  @click.prevent="show = !show" />
              </template>
            </UInput>
          </UFormField>


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

definePageMeta({
  layout: 'auth'
});



const supabase = useSupabaseClient()
const router = useRouter()


const username = ref('')
const password = ref('')
const show = ref(false)
const isLoading = ref(false)
const loginError = ref(null)

const handleLogin = async () => {
  isLoading.value = true
  loginError.value = null

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: username.value,
      password: password.value
    })

    if (error) {
      loginError.value = error.message
    } else {
      router.push('/')
    }
  } catch (err) {
    loginError.value = 'Ocurrió un error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>