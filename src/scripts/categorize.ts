import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  throw new Error('API Key do OpenAI não encontrada!')
}

async function classifyWithChatGPT(objeto: string): Promise<string> {
  console.log('Classificação local não encontrada. Consultando ChatGPT...')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
              'Você é um assistente que classifica textos de empenhos. Sua única resposta deve ser a categoria identificada, sem explicações ou frases adicionais. Exemplos de categorias: "Locação de Imóveis", "Manutenção de Veículos", "Prestação de Serviços de Engenharia", "Pagamento de Encargos Sociais e Trabalhistas", etc.',
        },
        {
          role: 'user',
          content: `Classifique o seguinte empenho: "${objeto}"`,
        },
      ],
    }),
  })

  // Checa se a resposta foi bem-sucedida
  if (!response.ok) {
    console.error(`Detalhes do erro:`, await response.text())
    throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim() // Retorna a categoria diretamente
}

/**
 * Normaliza uma string para comparação, incluindo singular/plural
 * @param text - Texto a ser normalizado
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036F]/g, '') // Remove marcas diacríticas
}

/**
 * Verifica se o texto contém a palavra-chave no singular ou plural
 * @param text - Texto a ser verificado
 * @param keyword - Palavra-chave para buscar
 */
function matchKeyword(text: string, keyword: string): boolean {
  const normalizedText = normalize(text)
  const normalizedKeyword = normalize(keyword)

  // Pluraliza a palavra-chave
  const plural = normalizedKeyword.endsWith('l')
    ? normalizedKeyword.replace(/l$/, 'is') // Ex: "imóvel" -> "imóveis"
    : `${normalizedKeyword}s` // Ex: "sistema" -> "sistemas"

  // Verifica se o texto contém a palavra-chave no singular ou plural
  return normalizedText.includes(normalizedKeyword) || normalizedText.includes(plural)
}

// Função para categorizar os empenhos
async function categorizeEmpenho(objeto: string) {
  const keywords: Record<string, string> = {
    // Folha de pagamento
    'folha de pagamento': 'Folha de Pagamento',
    'despesas com folha de pagamento': 'Folha de Pagamento',
    'inss': 'Folha de Pagamento',
    'patronal': 'Folha de Pagamento',

    // Locação de imóveis
    'locação de imóvel': 'Locação de Imóveis',
    'locação de imóveis': 'Locação de Imóveis',

    // Manutenção de veículos
    'manutenção de veículos': 'Manutenção de Veículos',
    'reparo de veículos': 'Manutenção de Veículos',
    'conserto de veículos': 'Manutenção de Veículos',

    // Manutenção de máquinas
    'manutenção de máquina': 'Manutenção de Máquinas',
    'reparo de máquinas': 'Manutenção de Máquinas',
    'conserto de máquinas': 'Manutenção de Máquinas',

    // Sistemas e software
    'software': 'Sistemas',
    'hospedagem de site': 'Sistemas',
    'manutenção de sistemas': 'Sistemas',
    'desenvolvimento de aplicativo': 'Sistemas',
    'webservice': 'Sistemas',
    'desenvolvimento de sistemas': 'Sistemas',
    'sistema': 'Sistemas',

    // Serviços de engenharia
    'engenharia': 'Prestação de Serviços de Engenharia',
    'obras': 'Prestação de Serviços de Engenharia',
    'projetos de engenharia': 'Prestação de Serviços de Engenharia',

    // Serviços de limpeza
    'limpeza': 'Serviços de Limpeza',
    'conservação': 'Serviços de Limpeza',
    'higienização': 'Serviços de Limpeza',

    // Serviços de segurança
    'segurança': 'Serviços de Segurança',
    'vigilância': 'Serviços de Segurança',
    'monitoramento': 'Serviços de Segurança',

    // Publicidade
    'publicidade': 'Publicidade e Propaganda',
    'propaganda': 'Publicidade e Propaganda',
    'divulgação': 'Publicidade e Propaganda',

    // Combustíveis
    'combustível': 'Combustível',
    'abastecimento': 'Combustível',
    'diesel': 'Combustível',
    'gasolina': 'Combustível',

    // Serviços de correios
    'correios': 'Serviços de Correios',
    'envio postal': 'Serviços de Correios',
    'remessa postal': 'Serviços de Correios',

    // Treinamento e capacitação
    'treinamento': 'Capacitação e Treinamento',
    'capacitação': 'Capacitação e Treinamento',
    'curso': 'Capacitação e Treinamento',

    // Organização de eventos
    'eventos': 'Organização de Eventos',
    'organização de eventos': 'Organização de Eventos',
    'cerimonial': 'Organização de Eventos',

    // Consultoria
    'consultoria': 'Prestação de Serviços de Consultoria',
    'assessoria': 'Prestação de Serviços de Consultoria',
    'orientação técnica': 'Prestação de Serviços de Consultoria',

    // Equipamentos e materiais
    'equipamentos': 'Aquisição de Equipamentos',
    'compra de equipamentos': 'Aquisição de Equipamentos',
    'materiais': 'Aquisição de Materiais',

    // Fiscalização de obras
    'fiscalização de serviços': 'Fiscalização de Obras',
    'ART pavimentação': 'Fiscalização de Obras',
    'ART instalação': 'Fiscalização de Obras',
    'serviços de pavimentação': 'Fiscalização de Obras',
    'instalação de pele de vidro': 'Fiscalização de Obras',

    // Transporte
    'transporte': 'Serviços de Transporte',
    'locação de veículos': 'Serviços de Transporte',
    'fretamento': 'Serviços de Transporte',

    // Serviços administrativos
    'administração': 'Serviços Administrativos',
    'gestão administrativa': 'Serviços Administrativos',
    'apoio administrativo': 'Serviços Administrativos',

    // Despesas com água
    'fornecimento de água': 'Despesas com Água',
    'água': 'Despesas com Água',

    // Despesas com energia elétrica
    'energia elétrica': 'Despesas com Energia Elétrica',
    'fornecimento de energia': 'Despesas com Energia Elétrica',
    'luz': 'Despesas com Energia Elétrica',

    // Serviços de internet
    'banda larga': 'Serviços de Internet',
  }

  for (const [key, value] of Object.entries(keywords)) {
    if (matchKeyword(objeto, key)) {
      console.log('Tipo encontrado:  ', value)
      return value
    }
  }

  // Se não encontrar, usa o ChatGPT
  return await classifyWithChatGPT(objeto)
}

async function processEmpenhos(): Promise<void> {
  try {
    const despesas = await prisma.despesa.findMany({
      where: {
        tipo: '', // Filtra registros onde 'tipo' está exatamente vazio
      },
      take: 1000, // Limita a 10 registros para testar
    })

    for (const despesa of despesas) {
      const objeto = `${despesa?.objetoResumido} ${despesa?.detalhamento}`
      const tipo = await categorizeEmpenho(objeto)

      if (tipo) {
        await prisma.despesa.update({
          where: { id: despesa.id },
          data: { tipo },
        })
        console.log(`ID: ${despesa.id}, Tipo: ${tipo}`)
      }
    }
  }
  catch (error) {
    console.error('Erro ao verificar despesa:', error)
    throw error
  }
}

// Exemplo de chamada da função
processEmpenhos()
  .then(() => console.log('Processamento concluído.'))
  .catch(error => console.error('Erro ao processar despesas:', error))
