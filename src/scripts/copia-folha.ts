import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function saveFolha(registro: any) {
  try {
    // Extrair informações relevantes do registro
    const unidadeGestoraCodigo = registro.unidadeGestora.codigo
    const unidadeGestoraNome = registro.unidadeGestora.denominacao
    const matriculaNumero = registro.matricula.numero
    const matriculaCpf = registro.matricula.cpf
    const matriculaNome = registro.matricula.nome
    const dataAdmissao = registro.matricula.dataAdmissao
      ? new Date(registro.matricula.dataAdmissao)
      : null
    const tipoContratacao = registro.matricula.tipoContratacao ?? null

    // Organizar dados da folha
    const folha = registro.listFolha?.[0]
    if (!folha) {
      throw new Error('Nenhuma folha encontrada no registro.')
    }

    const vinculo = folha.historico.vinculo
    const nrHorasSemanais = folha.historico.nrHorasSemanais
    const cargoCodigo = folha.historico.cargo.codigo
    const cargoNome = folha.historico.cargo.denominacao
    const localNome = folha.historico.local.denominacao

    const estruturaClasse = folha.historico.estruturaSalarial.codigoClasse ?? null
    const estruturaNivel = folha.historico.estruturaSalarial.codigoNivel ?? null
    const salarioBase = folha.listEventos.find(
      (evento: any) => evento.denominacao === '002 SALARIO BASE',
    )?.valorEvento ?? 0

    // Calcular totais de vantagens e descontos
    const totalVantagens = folha.listEventos
      .filter((evento: any) => evento.tipoEventoDenominacao === 'Vantagem')
      .reduce((acc: number, evento: any) => acc + (evento.valorEvento || 0), 0)

    const totalDescontos = folha.listEventos
      .filter((evento: any) => evento.tipoEventoDenominacao === 'Desconto')
      .reduce((acc: number, evento: any) => acc + (evento.valorEvento || 0), 0)

    // Salvar no banco de dados
    await prisma.folha.create({
      data: {
        unidadeGestoraCodigo,
        unidadeGestoraNome,
        matriculaNumero,
        matriculaCpf,
        matriculaNome,
        dataAdmissao,
        tipoContratacao,
        vinculo,
        localNome,
        cargoCodigo,
        cargoNome,
        nrHorasSemanais,
        estruturaClasse,
        estruturaNivel,
        salarioBase,
        totalVantagens,
        totalDescontos,
      },
    })
    console.log(`Registro salvo para ${matriculaNome}.`)
  }
  catch (error) {
    console.error('Erro ao salvar registro:', error)
    throw error
  }
}
async function pessoaExiste(matriculaNumero: string, cpf: string): Promise<boolean> {
  try {
    const existingPessoa = await prisma.folha.findFirst({
      where: {
        OR: [
          { matriculaNumero },
          { matriculaCpf: cpf },
        ],
      },
    })
    return existingPessoa !== null
  }
  catch (error) {
    console.error('Erro ao verificar se a pessoa já existe:', error)
    throw error
  }
}

async function fetchData(referencia: string, codigoUnidade: number | null): Promise<void> {
  console.log('Iniciando fetchData com:', { referencia, codigoUnidade })

  // Construir a URL da API com os parâmetros necessários
  const url = new URL(
    'https://transparencia.e-publica.net:443/epublica-portal/rest/araripina/api/v1/pessoal',
  )
  url.searchParams.append('referencia', referencia)
  if (codigoUnidade) {
    url.searchParams.append('codigo_unidade', String(codigoUnidade))
  }

  try {
    // Fazer a requisição à API
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Erro ao acessar a API: ${response.statusText}`)
    }

    // Processar o JSON retornado
    const data = await response.json()
    const registros = data.registros.map((item: any) => item.registro)

    // Processar cada registro
    for (const registro of registros) {
      try {
        const existe = await pessoaExiste(registro.matricula.numero, registro.matricula.cpf)

        if (!existe) {
          console.log('Migrando registro para:', registro.matricula.nome)
          await saveFolha(registro)
        }
        else {
          console.log('Registro já existe:', registro.matricula.nome)
        }
      }
      catch (error) {
        console.error('Erro ao processar registro:', registro.matricula?.numero, error)
      }
    }

    console.log('Registros migrados com sucesso.')
  }
  catch (error) {
    console.error('Erro ao executar fetchData:', error)
    throw error
  }
}

const referencia = process.argv[2]
const codigoUnidade = process.argv[3] ? Number.parseInt(process.argv[3]) : null

if (!referencia) {
  console.error('Por favor, insira a referência.')
  process.exit(1)
}

fetchData(referencia, codigoUnidade)
  .catch((error) => {
    console.error('Erro ao migrar dados:', error)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Desconectando do Prisma')
    await prisma.$disconnect()
  })
//  bun run src/scripts/copia-folha.ts "05/2024" 2
