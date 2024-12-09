<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface Folha {
  id: string
  unidadeGestoraCodigo: number
  unidadeGestoraNome: string
  matriculaNumero: string
  matriculaCpf: string
  matriculaNome: string
  dataAdmissao?: string
  tipoContratacao?: string
  vinculo: string
  localNome: string
  local?: string
  cargoCodigo: string
  cargoNome: string
  funcaoNome?: string
  nrHorasSemanais: number
  estruturaClasse?: string
  estruturaNivel?: string
  salarioBase: number
  totalVantagens: number
  totalDescontos: number
}

const headers = [
  { title: 'Nome', value: 'matriculaNome', sortable: true },
  { title: 'Cargo', value: 'cargoNome', sortable: true },
  { title: 'Unidade Gestora', value: 'unidadeGestoraNome', sortable: true },
  { title: 'Salário Base', value: 'salarioBase', sortable: true },
  { title: 'Total Vantagens', value: 'totalVantagens', sortable: true },
  { title: 'Total Descontos', value: 'totalDescontos', sortable: true },
]

const search = ref()
const folhas = ref<Folha[]>([])

const filters = ref({
  unidadeGestoraNome: '',
  cargoNome: '',
})

const loading = ref(false)

async function fetchFolhas() {
  try {
    const API_URL = import.meta.env.VITE_API_URL
    const response = await fetch(`${API_URL}/Folha`)
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

async function initialize() {
  search.value = null
  loading.value = true
  filters.value = {
    unidadeGestoraNome: '',
    cargoNome: '',
  }
  try {
    folhas.value = await fetchFolhas()
  }
  finally {
    loading.value = false
  }
}

const filteredFolhas = computed(() =>
  folhas.value.filter((item) => {
    return (
      (!filters.value.unidadeGestoraNome || item.unidadeGestoraNome === filters.value.unidadeGestoraNome)
      && (!filters.value.cargoNome || item.cargoNome === filters.value.cargoNome)
      && (!filters.value.localNome || item.localNome === filters.value.localNome)
    )
  }),
)

const uniqueGestoras = computed(() => [
  ...new Set(folhas.value.map(item => item.unidadeGestoraNome)),
])

const uniqueCargos = computed(() => [
  ...new Set(folhas.value.map(item => item.cargoNome)),
])
const uniqueLocais = computed(() => [
  ...new Set(folhas.value.map(item => item.localNome)), // Valores únicos para localNome
])

function formatCurrency(value: number): string {
  if (value === undefined || value === null)
    return 'R$ 0,00'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const totalVantagens = computed(() => {
  const searchTerm = search.value ? search.value.toLowerCase() : ''

  return folhas.value
    .filter((item) => {
      const matchesFilters
        = (!filters.value.unidadeGestoraNome || item.unidadeGestoraNome === filters.value.unidadeGestoraNome)
        && (!filters.value.cargoNome || item.cargoNome === filters.value.cargoNome)
        && (!filters.value.localNome || item.localNome === filters.value.localNome)

      const matchesSearch = searchTerm
        ? Object.values(item).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm),
        )
        : true

      return matchesFilters && matchesSearch
    })
    .reduce((sum, item) => sum + item.totalVantagens, 0)
})

// Atualiza totalVantagens quando houver uma busca
watch(search, () => {
  totalVantagens.value = filteredFolhas.value.reduce((sum, item) => sum + item.totalVantagens, 0)
})

onMounted(async () => {
  initialize()
})
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="filteredFolhas"
    :sort-by="[{ key: 'salarioBase', order: 'desc' }]"
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
          v-model="filters.localNome"
          class="pt-4"
          :items="uniqueLocais"
          label="Filtrar por Locais"
          variant="underlined"
          density="comfortable"
          clearable
        />

        <v-autocomplete
          v-model="filters.unidadeGestoraNome"
          class="pt-4"
          :items="uniqueGestoras"
          label="Filtrar por Unidade Gestora"
          variant="underlined"
          density="comfortable"
          clearable
        />

        <v-autocomplete
          v-model="filters.cargoNome"
          class="pt-4"
          :items="uniqueCargos"
          label="Filtrar por Cargo"
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
    <template #item.salarioBase="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.totalVantagens="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.totalDescontos="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #footer.prepend>
      <div class="mr-4">
        SOMA R$ {{ formatCurrency(totalVantagens) }}
      </div>
    </template>
  </v-data-table>
  <v-progress-linear
    v-if="loading"
    color="blue-lighten-3"
    indeterminate
  />
</template>
