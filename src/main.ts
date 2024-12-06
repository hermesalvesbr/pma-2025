/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

import { createHead } from '@unhead/vue'
// Composables
import { createApp } from 'vue'

// Components
import App from './App.vue'

const app = createApp(App)
const head = createHead()
registerPlugins(app)
app.use(head)
app.mount('#app')
