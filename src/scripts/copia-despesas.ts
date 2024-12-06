import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

async function despesaExiste(despesa: Registro): Promise<boolean> {
  try {
    if (!despesa?.fornecedor?.pessoa) {
      return false
    }
    const existingDespesa = await prisma.despesa.findFirst({
      where: {
        cpfCnpj: despesa.fornecedor.pessoa.cpfCnpj,
        numero: Number(despesa.empenho.numero),
        emissao: despesa.empenho.emissao,
      },
    })
    return existingDespesa !== null
  }
  catch (error) {
    console.error('Erro ao verificar despesa:', error)
    throw error
  }
}

async function saveDespesa(despesa: Registro, codigoUnidade: number | null) {
  try {
    await prisma.despesa.create({
      data: {
        codigoUnidade: codigoUnidade ?? 0,
        numero: Number(despesa.empenho.numero),
        emissao: despesa.empenho.emissao,
        especie: despesa.empenho.especie,
        categoria: despesa.empenho.categoria,
        objetoResumido: despesa.empenho.objetoResumido,
        classificacao: despesa.classificacaoCompleta.classificacaoCompleta,
        funcao: despesa.despesa.funcao.denominacao,
        subfuncao: despesa.despesa.subfuncao.denominacao,
        programa: despesa.despesa.programa.denominacao,
        acao: despesa.despesa.acao.denominacao,
        categoriaEconomica: despesa.naturezaDespesa.categoriaEconomica.denominacao,
        grupo: despesa.naturezaDespesa.grupo.denominacao,
        modalidadeAplicacao: despesa.naturezaDespesa.modalidadeAplicacao.denominacao,
        elemento: despesa.naturezaDespesa.elemento.denominacao,
        detalhamento: despesa.naturezaDespesa.detalhamento.denominacao,
        fonteRecurso: despesa.fonteRecurso.denominacao,
        exercicio: Number(despesa.exercicio.exercicio),
        unidadeOrcamentaria: despesa.unidadeOrcamentaria.denominacao,
        unidadeGestora: despesa.unidadeOrcamentaria.unidadeGestora.denominacao,
        fornecedor: despesa.fornecedor.pessoa.nome,
        cpfCnpj: despesa.fornecedor.pessoa.cpfCnpj,
        valorTotal: calcularTotalMovimentos(despesa.listMovimentos),
        tipo: '',
      },
    })
  }
  catch (error) {
    console.error('Erro ao salvar despesa:', error)
    throw error
  }
}

function calcularTotalMovimentos(movimentos: Movimento[]): number {
  return movimentos.reduce((total, mov) => total + mov.valorMovimento, 0)
}

async function fetchData(periodoInicial: string, periodoFinal: string, codigoUnidade: number | null): Promise<void> {
  console.log('Iniciando fetchData com:', { periodoInicial, periodoFinal, codigoUnidade })
  const url = new URL(
    'https://transparencia.e-publica.net:443/epublica-portal/rest/araripina/api/v1/despesa',
  )
  url.searchParams.append('periodo_inicial', periodoInicial)
  url.searchParams.append('periodo_final', periodoFinal)
  // url.searchParams.append('inicio_registro', '1')
  // url.searchParams.append('quantidade_registro', '2')
  if (codigoUnidade) {
    url.searchParams.append('codigo_unidade', String(codigoUnidade))
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Erro ao acessar a API: ${response.statusText}`)
  }

  const data: RespostaAPI = await response.json()
  const despesas = data.registros.map(item => item.registro)
  for (const despesa of despesas) {
    try {
      if (!despesa?.empenho) {
        continue
      }
      const exists = await despesaExiste(despesa)
      if (!exists) {
        console.log('Migrando despesa:', despesa.empenho.numero)
        await saveDespesa(despesa, codigoUnidade)
      }
      else {
        console.log('Despesa já existe:', despesa.empenho.numero)
      }
    }
    catch (error) {
      console.error('Erro ao processar despesa:', despesa?.empenho?.numero, error)
    }
  }
  console.log('Despesas migradas com sucesso.')
}

const periodoInicial = process.argv[2]
const periodoFinal = process.argv[3]
const codigoUnidade = process.argv[4] ? Number.parseInt(process.argv[4]) : null

if (!periodoInicial || !periodoFinal) {
  console.error('Por favor, insira o período inicial e final.')
  process.exit(1)
}

fetchData(periodoInicial, periodoFinal, codigoUnidade)
  .catch((error) => {
    console.error('Erro ao migrar dados:', error)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Desconectando do Prisma')
    await prisma.$disconnect()
  })
//  bun run src/scripts/copia-despesas.ts "05/2024" "05/2024" 2
