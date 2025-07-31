
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import { LegislativeMatter, Category } from '../types';

// Helper para categorizar baseado em palavras-chave (uma simplificação do que o Gemini faria)
function getCategoryFromSummary(summary: string): Category {
    const s = summary.toLowerCase();
    if (s.includes('paviment') || s.includes('asfáltica') || s.includes('calçamento') || s.includes('buraco') || s.includes('infraestrutura')) return Category.UrbanInfrastructure;
    if (s.includes('lixo') || s.includes('lixeira') || s.includes('reciclável') || s.includes('limpeza') || s.includes('boca de lobo') || s.includes('poda') || s.includes('vegetação') || s.includes('entulho') || s.includes('drenagem')) return Category.EnvironmentAndSanitation;
    if (s.includes('trânsito') || s.includes('sinalização') || s.includes('faixa de segurança') || s.includes('pedestre') || s.includes('lombada') || s.includes('estacionamento') || s.includes('velocidade')) return Category.MobilityAndTransit;
    if (s.includes('iluminação') || s.includes('lâmpada')) return Category.PublicServices;
    if (s.includes('segurança') || s.includes('procon')) return Category.PublicSafety;
    if (s.includes('praça') || s.includes('parque')) return Category.CommunitySpaces;
    return Category.UrbanInfrastructure;
}

// Helper robusto para extrair localização
const extractLocationDetails = (summary: string): { address: string; neighborhood?: string } => {
    const s = summary;
    
    // Tenta encontrar um endereço mais explícito
    const addressRegex = /(?:Rua|rua|Avenida|avenida|Travessa|travessa)\s+[\w\s\d.-]+/i;
    let addressMatch = s.match(addressRegex);
    let address = addressMatch ? addressMatch[0].trim() : s.split(',')[0].trim();

    // Tenta encontrar o bairro
    const neighborhoodRegex = /(?:bairro|no bairro|localidade de)\s+([\w\s'-]+)/i;
    let neighborhoodMatch = s.match(neighborhoodRegex);
    let neighborhood = neighborhoodMatch ? neighborhoodMatch[1].replace(/[,.]$/, '').trim() : undefined;

    // Remove a informação do bairro do endereço principal, se estiver lá
    if (neighborhood && address.toLowerCase().includes(neighborhood.toLowerCase())) {
        address = address.replace(new RegExp(`,?\\s*(?:bairro|no bairro)\\s+${neighborhood}`, 'i'), '').trim();
    }
    
    if (address.endsWith(',')) {
        address = address.slice(0, -1).trim();
    }

    return { address, neighborhood };
}

async function fetchAndGetHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Falha ao buscar ${url}: ${response.status} ${response.statusText}`);
        }

        return await response.text();
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error(`Timeout: O portal da câmara (${url}) demorou muito para responder.`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}


function parseHtmlForMatters(html: string): LegislativeMatter[] {
    const $ = cheerio.load(html);
    const matters: LegislativeMatter[] = [];

    $('table.table tbody tr').each((i, elem) => {
        const columns = $(elem).find('td');
        if (columns.length > 3) {
            const idText = $(columns[0]).find('a').text().trim();
            if (!idText) return;

            const pdfLink = $(columns[0]).find('a').attr('href') || '';
            const summary = $(columns[1]).text().trim();
            const author = $(columns[2]).text().trim();
            const presentationDate = $(columns[3]).text().trim();
            const protocolMatch = pdfLink.match(/protocolo=(\d+)/);
            const protocol = protocolMatch ? protocolMatch[1] : 'N/A';
            
            const location = extractLocationDetails(summary);
            
            const matter: LegislativeMatter = {
                id: idText,
                summary: summary,
                author: author,
                presentationDate: presentationDate,
                category: getCategoryFromSummary(summary),
                location: location,
                status: 'Disponível no SAPL',
                protocol: protocol,
                pdfLink: pdfLink.startsWith('http') ? pdfLink : `https://sapl.camarabento.rs.gov.br${pdfLink}`,
            };
            matters.push(matter);
        }
    });
    return matters;
}

// Helper robusto para extrair o número e ano do ID
const parseId = (id: string): { num: number; year: number } => {
    try {
        if (!id || typeof id !== 'string') return { num: 0, year: 0 };
        
        const parts = id.split(' ');
        if (parts.length < 2) return { num: 0, year: 0 };
        
        const numberParts = parts[parts.length - 1].split('/');
        if (numberParts.length < 2) return { num: 0, year: 0 };

        const num = parseInt(numberParts[0], 10);
        const year = parseInt(numberParts[1], 10);

        return { num: isNaN(num) ? 0 : num, year: isNaN(year) ? 0 : year };
    } catch (e) {
        console.error(`Erro ao parsear o ID: "${id}"`, e);
        return { num: 0, year: 0 };
    }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const baseUrl = 'https://sapl.camarabento.rs.gov.br/materia/pesquisar-materia';
    // Parâmetros de busca atualizados para filtrar por autor específico (400) e ano (2025).
    const queryParams = `tipo=8&ementa=&numero=&numeracao__numero_materia=&numero_protocolo=&ano=2025&autoria__autor=400&autoria__primeiro_autor=unknown&autoria__autor__tipo=&autoria__autor__parlamentar_set__filiacao__partido=&o=&tipo_listagem=1&tipo_origem_externa=&numero_origem_externa=&ano_origem_externa=&data_origem_externa_0=&data_origem_externa_1=&local_origem_externa=&data_apresentacao_0=&data_apresentacao_1=&data_publicacao_0=&data_publicacao_1=&relatoria__parlamentar_id=&em_tramitacao=&tramitacao__unidade_tramitacao_destino=&tramitacao__status=&materiaassunto__assunto=&indexacao=&regime_tramitacao=&salvar=Pesquisar`;
    
    const firstPageUrl = `${baseUrl}?${queryParams}`;
    const firstPageHtml = await fetchAndGetHtml(firstPageUrl);
    const $ = cheerio.load(firstPageHtml);

    let lastPage = 1;
    $('ul.pagination a').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
            const match = href.match(/page=(\d+)/);
            if (match && match[1]) {
                const pageNum = parseInt(match[1], 10);
                if (pageNum > lastPage) {
                    lastPage = pageNum;
                }
            }
        }
    });

    const firstPageMatters = parseHtmlForMatters(firstPageHtml);
    let allMatters = [...firstPageMatters];

    if (lastPage > 1) {
        const otherPageUrls: string[] = [];
        for (let i = 2; i <= lastPage; i++) {
            otherPageUrls.push(`${baseUrl}?page=${i}&${queryParams}`);
        }
        
        const otherPagesPromises = otherPageUrls.map(async (url) => {
            const html = await fetchAndGetHtml(url);
            return parseHtmlForMatters(html);
        });

        const results = await Promise.all(otherPagesPromises);
        allMatters.push(...results.flat());
    }

    const uniqueMatters = Array.from(new Map(allMatters.map(item => [item.id, item])).values());
     
    uniqueMatters.sort((a, b) => {
        const idA = parseId(a.id);
        const idB = parseId(b.id);
        if (idA.year !== idB.year) return idB.year - idA.year;
        return idB.num - idA.num;
    });

    res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=3600');
    res.status(200).json(uniqueMatters);
  } catch (error: any) {
    console.error('Erro fatal na API de indicações:', error);
    res.status(500).json({ message: error.message || 'Ocorreu um erro inesperado no servidor.' });
  }
}
