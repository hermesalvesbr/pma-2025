<script setup lang="ts">
import { ref } from 'vue'

interface Unidade {
  codigo: number
  nome: string
}

interface Movimento {
  dataMovimento: string
  tipoMovimento: string
  valorMovimento: number
}

interface Empenho {
  numero: string
  emissao: string
  especie: string
  categoria: string
  objetoResumido: string
}

interface Funcao {
  denominacao: string
}

interface Subfuncao {
  denominacao: string
}

interface Programa {
  denominacao: string
}

interface Acao {
  denominacao: string
}

interface CategoriaEconomica {
  denominacao: string
}

interface Grupo {
  denominacao: string
}

interface ModalidadeAplicacao {
  denominacao: string
}

interface Elemento {
  denominacao: string
}

interface Detalhamento {
  denominacao: string
}

interface FonteRecurso {
  denominacao: string
}

interface Exercicio {
  exercicio: string
}

interface UnidadeOrcamentaria {
  denominacao: string
  unidadeGestora: {
    denominacao: string
  }
}

interface Fornecedor {
  pessoa: {
    nome: string
    cpfCnpj: string
  }
}

interface Despesa {
  classificacaoCompleta: {
    classificacaoCompleta: string
  }
  despesa: {
    funcao: Funcao
    subfuncao: Subfuncao
    programa: Programa
    acao: Acao
  }
  naturezaDespesa: {
    categoriaEconomica: CategoriaEconomica
    grupo: Grupo
    modalidadeAplicacao: ModalidadeAplicacao
    elemento: Elemento
    detalhamento: Detalhamento
  }
  fonteRecurso: FonteRecurso
  exercicio: Exercicio
  unidadeOrcamentaria: UnidadeOrcamentaria
  fornecedor: Fornecedor
}

interface Registro {
  empenho: Empenho
  listMovimentos: Movimento[]
  classificacaoCompleta: Despesa['classificacaoCompleta']
  despesa: Despesa['despesa']
  naturezaDespesa: Despesa['naturezaDespesa']
  fonteRecurso: Despesa['fonteRecurso']
  exercicio: Despesa['exercicio']
  unidadeOrcamentaria: Despesa['unidadeOrcamentaria']
  fornecedor: Despesa['fornecedor']
}

interface RespostaAPI {
  registros: { registro: Registro }[]
}

const periodoInicial = ref<string>('05/2024')
const periodoFinal = ref<string>('05/2024')
const codigoUnidade = ref<number | null>(null)
const despesas = ref<Registro[]>([])
const error = ref<string | null>(null)

const unidades: Unidade[] = [
  { codigo: 1, nome: 'Câmara Municipal de Araripina' },
  { codigo: 2, nome: 'Prefeitura Municipal de Araripina' },
  { codigo: 3, nome: 'Fundo Municipal de Saúde de Araripina' },
  { codigo: 4, nome: 'Fundo Municipal de Assistência Social de Araripina' },
  { codigo: 5, nome: 'Autarquia Educacional do Araripe' },
  { codigo: 6, nome: 'Autarquia de Trânsito e Transporte de Araripina - ATTA' },
  { codigo: 7, nome: 'Fundo Previdenciário do Município de Araripina - ARARIPREV' },
  { codigo: 8, nome: 'Fundo Municipal de Educação do Município de Araripina' },
  { codigo: 10, nome: 'Câmara Municipal de Araripina' },
]

async function fetchData(): Promise<void> {
  error.value = null
  despesas.value = []
  if (!periodoInicial.value || !periodoFinal.value) {
    error.value = 'Por favor, insira o período inicial e final.'
    return
  }

  try {
    const url = new URL(
      'https://transparencia.e-publica.net:443/epublica-portal/rest/araripina/api/v1/despesa',
    )
    url.searchParams.append('periodo_inicial', periodoInicial.value)
    url.searchParams.append('periodo_final', periodoFinal.value)
    url.searchParams.append('inicio_registro', '1')
    url.searchParams.append('quantidade_registro', '5')
    if (codigoUnidade.value) {
      url.searchParams.append('codigo_unidade', String(codigoUnidade.value))
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Erro ao acessar a API: ${response.statusText}`)
    }

    const data: RespostaAPI = await response.json()
    despesas.value = data.registros.map(item => item.registro)
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Erro desconhecido.'
  }
}

function calcularTotalMovimentos(movimentos: Movimento[]): number {
  return movimentos.reduce((total, mov) => total + mov.valorMovimento, 0)
}
</script>

<template>
  <v-app>
    <div class="d-flex justify-center pt-4">
      <v-btn
        class="mr-5"
        href="/relatorio"
      >
        Empenhos
      </v-btn>
      <v-btn
        class="mr-5"
        href="/folha"
      >
        Folha
      </v-btn>
    </div>
    <v-container>
      <v-card class="mb-5">
        <v-card-title>Consulta de Despesas - Transparência Pública</v-card-title>
        <v-card-subtitle>
          Insira os parâmetros para buscar os dados da API.
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              sm="6"
            >
              <v-text-field
                v-model="periodoInicial"
                label="Período Inicial (MM/AAAA)"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-text-field
                v-model="periodoFinal"
                label="Período Final (MM/AAAA)"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="codigoUnidade"
                label="Código da Unidade"
                :items="unidades"
                item-value="codigo"
                item-title="nome"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="fetchData">
            Buscar Dados
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-alert
        v-if="error"
        type="error"
      >
        {{ error }}
      </v-alert>
      <v-row v-if="despesas.length > 0">
        <v-col
          v-for="(despesa, index) in despesas"
          :key="index"
          cols="12"
          md="6"
        >
          <v-card class="mx-auto mb-4">
            <v-card-item>
              <div>
                <div class="text-overline mb-1">
                  Número: {{ despesa.empenho.numero }}
                </div>
                <div class="text-overline mb-1">
                  Emissão: {{ despesa.empenho.emissao }}
                </div>
                <div class="text-overline mb-1">
                  Espécie: {{ despesa.empenho.especie }}
                </div>
                <div class="text-overline mb-1">
                  Categoria: {{ despesa.empenho.categoria }}
                </div>
                <div class="text-h6 mb-1">
                  Objeto Resumido: {{ despesa.empenho.objetoResumido }}
                </div>
                <div class="text-overline mb-1">
                  Classificação Completa: {{ despesa.classificacaoCompleta.classificacaoCompleta }}
                </div>
                <div class="text-overline mb-1">
                  Função: {{ despesa.despesa.funcao.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Subfunção: {{ despesa.despesa.subfuncao.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Programa: {{ despesa.despesa.programa.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Ação: {{ despesa.despesa.acao.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Categoria Econômica: {{ despesa.naturezaDespesa.categoriaEconomica.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Grupo: {{ despesa.naturezaDespesa.grupo.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Modalidade de Aplicação: {{ despesa.naturezaDespesa.modalidadeAplicacao.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Elemento: {{ despesa.naturezaDespesa.elemento.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Detalhamento: {{ despesa.naturezaDespesa.detalhamento.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Fonte de Recurso: {{ despesa.fonteRecurso.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Exercício: {{ despesa.exercicio.exercicio }}
                </div>
                <div class="text-overline mb-1">
                  Unidade Orçamentária: {{ despesa.unidadeOrcamentaria.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Unidade Gestora: {{ despesa.unidadeOrcamentaria.unidadeGestora.denominacao }}
                </div>
                <div class="text-overline mb-1">
                  Fornecedor: {{ despesa.fornecedor.pessoa.nome }}
                </div>
                <div class="text-overline mb-1">
                  CPF/CNPJ: {{ despesa.fornecedor.pessoa.cpfCnpj }}
                </div>
                <div class="text-h6 mb-1">
                  Valor Total: {{ calcularTotalMovimentos(despesa.listMovimentos) }}
                </div>
              </div>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>
