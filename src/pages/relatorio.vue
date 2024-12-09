<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface Despesa {
  id: string
  tipo: string
  numero: number
  emissao: string
  especie: string
  categoria: string
  objetoResumido: string
  classificacao: string
  funcao: string
  subfuncao: string
  programa: string
  acao: string
  categoriaEconomica: string
  grupo: string
  modalidadeAplicacao: string
  elemento: string
  detalhamento: string
  fonteRecurso: string
  unidadeOrcamentaria: string
  unidadeGestora: string
  fornecedor: string
  cpfCnpj: string
  valorTotal: number
  codigoUnidade?: number
}

const headers = [
  { title: 'Tipo', value: 'tipo', sortable: true },
  { title: 'Fornecedor', value: 'fornecedor', sortable: true },
  { title: 'Secretaria', value: 'unidadeOrcamentaria', sortable: true },
  { title: 'Unidade', value: 'unidadeGestora', sortable: true },
  { title: 'Valor Total', value: 'valorTotal', sortable: true },
]
const search = ref()
const empenhos = ref<Despesa[]>([
])

const filters = ref({
  tipo: '',
  unidadeOrcamentaria: '',
  unidadeGestora: '',
})

const loading = ref(false)

async function fetchEmpenhos() {
  try {
    const API_URL = import.meta.env.VITE_API_URL
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error('Erro ao buscar dados')
    }
    const data = await response.json()
    return data
  }
  catch (error) {
    console.error('Erro:', error)
    return []
  }
}
function handleRowClick(item: Despesa) {
  if (!item.fornecedor) {
    console.error('Fornecedor não encontrado!')
    return
  }

  const searchTerm = item.fornecedor

  // Cria o objeto interno
  const innerObject = JSON.stringify({
    search_term: {
      value: searchTerm,
    },
  })

  // Cria o objeto externo
  const outerObject = {
    searchProperties: innerObject,
  }

  // Serializa e codifica o objeto externo
  const encodedParams = encodeURIComponent(JSON.stringify(outerObject))

  // Monta a URL final
  const baseUrl
    = 'https://transparencia.e-publica.net/epublica-portal/#/araripina/portal/portalSearchTable'
  const finalUrl = `${baseUrl}?params=${encodedParams}`

  // Abre a URL em uma nova aba
  window.open(finalUrl, '_blank')
}

async function initialize() {
  search.value = null
  loading.value = true
  filters.value = {
    tipo: '',
    unidadeOrcamentaria: '',
    unidadeGestora: '',
  }
  try {
    empenhos.value = await fetchEmpenhos()
  }
  finally {
    loading.value = false
  }
}

const filteredEmpenhos = computed(() =>
  empenhos.value.filter((item) => {
    return (
      (!filters.value.tipo || item.tipo === filters.value.tipo)
      && (!filters.value.unidadeOrcamentaria || item.unidadeOrcamentaria === filters.value.unidadeOrcamentaria)
      && (!filters.value.unidadeGestora || item.unidadeGestora === filters.value.unidadeGestora)
    )
  }),
)

const uniqueTypes = computed(() => [
  ...new Set(empenhos.value.map(item => item.tipo)),
])

const uniqueCategories = computed(() => [
  ...new Set(empenhos.value.map(item => item.unidadeOrcamentaria)),
])

const uniqueManagers = computed(() => [
  ...new Set(empenhos.value.map(item => item.unidadeGestora)),
])

function formatCurrency(value: number): string {
  if (value === undefined || value === null)
    return 'R$ 0,00'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const totalValor = computed(() => {
  return filteredEmpenhos.value.reduce((sum, item) => sum + item.valorTotal, 0)
})

// Inicialização dos dados
onMounted(async () => {
  initialize()
})
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="filteredEmpenhos"
    :sort-by="[{ key: 'valorTotal', order: 'desc' }]"
    :search="search"
    items-per-page="20"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>Referência: 05/2024</v-toolbar-title>
        <v-divider class="mx-4" inset vertical />
        <v-spacer />

        <!-- Filtros -->
        <v-autocomplete
          v-model="filters.tipo"
          class="pt-4"
          :items="uniqueTypes"
          label="Filtrar por Tipo"
          variant="underlined"
          density="comfortable"
          clearable
        />

        <v-autocomplete
          v-model="filters.unidadeOrcamentaria"
          class="pt-4"
          :items="uniqueCategories"
          label="Filtrar por Secretaria"
          variant="underlined"
          density="comfortable"
          clearable
        />

        <v-autocomplete
          v-model="filters.unidadeGestora"
          class="pt-4"
          :items="uniqueManagers"
          label="Filtrar por Unidade Gestora"
          variant="underlined"
          density="comfortable"
          clearable
        />
      </v-toolbar>
      <v-text-field
        v-model="search"
        label="Procure por algo"
        hint="buscar"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
        persistent-hint
      />
    </template>
    <template #item.fornecedor="{ item }">
      <span class="cursor-pointer text-blue-600" @click="handleRowClick(item)">
        {{ item.fornecedor }}
      </span>
    </template>
    <template #no-data>
      <v-btn color="primary" @click="initialize">
        Reconfigurar
      </v-btn>
    </template>
    <template #item.valorTotal="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #footer.prepend>
      <div class="mr-4">
        SOMA R$ {{ formatCurrency(totalValor) }}
      </div>
    </template>
  </v-data-table>
  <v-progress-linear
    v-if="loading"
    color="blue-lighten-3"
    indeterminate
  />
</template>
