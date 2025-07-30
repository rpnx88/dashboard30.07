
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { LegislativeMatter, Category, CategoryData } from './types';
import { 
    GovIcon, MoonIcon, SunIcon, 
    PinIcon, CalendarIcon, PdfIcon, TagIcon, UserIcon, 
    SyncIcon, ChartIcon, ListIcon, SearchIcon, XCircleIcon 
} from './components/icons';

//==============================================================================
// DEFINIÇÕES DOS COMPONENTES
// Todos os componentes da UI foram consolidados aqui para uma estrutura mais compacta.
//==============================================================================

//--- Componente Header ---
interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <GovIcon className="h-10 w-10 text-blue-600 dark:text-blue-400 mr-4"/>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                            Dashboard Legislativo
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Câmara Municipal de Bento Gonçalves - Análise de Indicações
                        </p>
                    </div>
                </div>
                 <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors"
                    aria-label="Alternar modo claro/escuro"
                >
                    {isDarkMode ? (
                        <SunIcon className="w-6 h-6 text-yellow-400" />
                    ) : (
                        <MoonIcon className="w-6 h-6 text-slate-700" />
                    )}
                </button>
            </div>
        </header>
    );
};


//--- Componente CategoryChart ---
interface CategoryChartProps {
    data: CategoryData[];
    onSelectCategory: (category: Category | 'Todas') => void;
    selectedCategory: Category | 'Todas';
}

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-700 p-2 border border-gray-200 dark:border-slate-600 rounded shadow-lg">
                <p className="font-bold">{`${label}`}</p>
                <p className="text-blue-500">{`Total: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const CategoryChart: React.FC<CategoryChartProps> = ({ data, onSelectCategory, selectedCategory }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fill: '#9ca3af', fontSize: 11, width: 100 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}/>
                <Bar dataKey="value" barSize={20} onClick={(d) => onSelectCategory(d.name as Category)}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            opacity={selectedCategory === 'Todas' || selectedCategory === entry.name ? 1 : 0.4}
                            className="cursor-pointer transition-opacity duration-300"
                        />
                    ))}
                    <LabelList 
                        dataKey="value" 
                        position="right" 
                        offset={5} 
                        className="fill-gray-700 dark:fill-gray-300"
                        fontSize={12}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

//--- Componentes IndicationsList e IndicationCard ---
interface IndicationCardProps {
    indication: LegislativeMatter;
}

const categoryColorMap: { [key in Category]: string } = {
    [Category.UrbanInfrastructure]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    [Category.EnvironmentAndSanitation]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    [Category.MobilityAndTransit]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    [Category.PublicServices]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    [Category.PublicSafety]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    [Category.CommunitySpaces]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

const IndicationCard: React.FC<IndicationCardProps> = ({ indication }) => {
    return (
        <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1">
            <div className="flex justify-between items-start flex-wrap gap-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{indication.id}</h3>
                <span className={`text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${categoryColorMap[indication.category]} shrink-0`}>
                    {indication.category}
                </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{indication.summary}</p>
            
            <div className="mt-4 border-t border-gray-200 dark:border-slate-600 pt-3">
                 <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <PinIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span>{indication.location.address}{indication.location.neighborhood ? `, ${indication.location.neighborhood}` : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{indication.presentationDate}</span>
                    </div>
                    <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{indication.author}</span>
                    </div>
                    <div className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Protocolo: {indication.protocol}</span>
                    </div>
                    <a 
                        href={indication.pdfLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        <PdfIcon className="w-4 h-4 mr-2" />
                        <span>Ver PDF</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

interface IndicationsListProps {
    indications: LegislativeMatter[];
}

const IndicationsList: React.FC<IndicationsListProps> = ({ indications }) => {
    if (indications.length === 0) {
        return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma indicação encontrada. Tente um termo de busca diferente.</div>
    }
    
    return (
        <div className="space-y-4">
            {indications.map((indication) => (
                <IndicationCard key={indication.id} indication={indication} />
            ))}
        </div>
    );
};

//--- Componente Toast ---
interface ToastProps {
    message: string;
    type: 'success' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        if (type === 'success') {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [type, onClose]);

    const baseClasses = "fixed top-5 right-5 z-50 flex items-center py-3 px-5 rounded-lg shadow-xl text-white font-semibold animate-slide-in";
    const typeClasses = {
        success: "bg-green-600",
        info: "bg-blue-600",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {type === 'info' && <SyncIcon className="animate-spin w-5 h-5 mr-3" />}
            <span>{message}</span>
            {type === 'success' && (
                <button 
                    onClick={onClose} 
                    className="ml-4 -mr-2 p-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Fechar notificação"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};


//==============================================================================
// LÓGICA PRINCIPAL E RENDERIZAÇÃO DO APP
//==============================================================================

const ptMonths: { [key: string]: number } = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
};

const parsePtDate = (dateString: string): Date => {
    try {
        const dateParts = dateString.split(' ')[0].split('/');
        if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const year = parseInt(dateParts[2]);
            return new Date(year, month, day);
        }
        // Fallback para o formato "30 de Julho de 2025"
        const parts = dateString.toLowerCase().split(' de ');
        if (parts.length < 3) return new Date(0);
        const day = parseInt(parts[0]);
        const monthName = parts[1];
        const year = parseInt(parts[2]);
        const month = ptMonths[monthName];
        if (isNaN(day) || isNaN(year) || month === undefined) return new Date(0);
        return new Date(year, month, day);
    } catch (e) {
        console.error("Falha ao analisar a data:", dateString, e);
        return new Date(0);
    }
};


const App: React.FC = () => {
    const [allData, setAllData] = useState<LegislativeMatter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<Category | 'Todas'>('Todas');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<'date' | 'id'>('id');
    
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'info'>('info');

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') === 'dark';
        }
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/indications', { cache: 'no-cache' });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: `Erro no servidor: ${response.status} ${response.statusText}`
                    }));
                    throw new Error(errorData.message || 'Falha ao buscar os dados das indicações.');
                }

                const data: LegislativeMatter[] = await response.json();
                
                if (!Array.isArray(data)) {
                    throw new Error("A resposta da API não retornou um formato de dados válido.");
                }

                setAllData(data);
                if (data.length > 0) {
                    setLastUpdated(new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));
                }
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleSelectCategory = useCallback((category: Category | 'Todas') => {
        const newCategory = selectedCategory === category ? 'Todas' : category;
        setSelectedCategory(newCategory);
    }, [selectedCategory]);

    const filteredAndSortedData = useMemo(() => {
        let data = [...allData];

        if (selectedCategory !== 'Todas') {
            data = data.filter(item => item.category === selectedCategory);
        }

        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            data = data.filter(item =>
                item.id.toLowerCase().includes(lowercasedQuery) ||
                item.summary.toLowerCase().includes(lowercasedQuery) ||
                (item.location.address && item.location.address.toLowerCase().includes(lowercasedQuery)) ||
                (item.location.neighborhood && item.location.neighborhood.toLowerCase().includes(lowercasedQuery)) ||
                item.protocol.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        data.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = parsePtDate(a.presentationDate).getTime();
                const dateB = parsePtDate(b.presentationDate).getTime();
                return dateB - dateA;
            }
            if (sortBy === 'id') {
                const [, idPartA] = a.id.split(' ');
                const [numA, yearA] = idPartA.split('/').map(Number);
                const [, idPartB] = b.id.split(' ');
                const [numB, yearB] = idPartB.split('/').map(Number);
                if (yearA !== yearB) return yearB - yearA;
                return numB - numA;
            }
            return 0;
        });

        return data;
    }, [allData, selectedCategory, searchQuery, sortBy]);

    const categoryCounts = useMemo(() => {
        const counts = allData.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {} as Record<Category, number>);

        return Object.entries(counts).map(([name, value]) => ({
            name: name as Category,
            value,
        }));
    }, [allData]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-500 transition-colors duration-500">
                <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200 animate-pulse">
                    Carregando dados atualizados...
                </p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 text-red-600 dark:text-red-400 p-4 text-center">
                <XCircleIcon className="h-16 w-16" />
                <p className="mt-4 text-lg font-semibold">Ocorreu um erro:</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans">
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
            <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-1 w-full">
                <div className="flex flex-col gap-8">
                    {/* Seção do Gráfico */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <ChartIcon className="w-6 h-6 mr-3 text-blue-500" />
                            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">Indicações por Categoria</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Clique em uma barra para filtrar a lista.</p>
                        <div className="h-[400px]">
                           <CategoryChart data={categoryCounts} onSelectCategory={handleSelectCategory} selectedCategory={selectedCategory} />
                        </div>
                    </div>

                    {/* Seção da Lista */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-baseline justify-between flex-wrap gap-y-4 mb-4">
                             <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                                <div className="flex items-center">
                                    <ListIcon className="w-6 h-6 mr-3 text-blue-500" />
                                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
                                        {selectedCategory === 'Todas' ? 'Todas as Indicações' : `Indicações de ${selectedCategory}`}
                                    </h2>
                                </div>
                                {selectedCategory !== 'Todas' && (
                                     <button onClick={() => setSelectedCategory('Todas')} className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                         <XCircleIcon className="w-4 h-4 mr-1"/>
                                         Limpar filtro
                                     </button>
                                )}
                            </div>
                            <div className="flex items-center gap-x-4">
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full">
                                    {filteredAndSortedData.length} Encontradas
                                </span>
                                <div className="flex items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400">
                                    {lastUpdated && (
                                        <span className="shrink-0">
                                            Atualizado: {lastUpdated}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="relative flex-grow">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por ID, ementa, local..."
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 transition focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'date' | 'id')}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 transition focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
                                    aria-label="Ordenar por"
                                >
                                    <option value="id">ID da Indicação</option>
                                    <option value="date">Mais Recentes</option>
                                </select>
                            </div>
                         </div>
                        <IndicationsList indications={filteredAndSortedData} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
