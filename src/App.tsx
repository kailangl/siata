/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, Feather, Scroll, Bell, Sparkles, ChevronRight, X,
  Instagram, Twitter, Github, Zap, Activity, Crosshair, 
  Layers, Trophy, Menu, LogIn, Plus, Trash2, Send, Search,
  Music2, Pause, Play, SkipForward
} from 'lucide-react';
import { cn } from './lib/utils';
import { db, auth } from './lib/firebase';
import { 
  collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, onSnapshot 
} from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Markdown from 'react-markdown';
import SecretPage from './components/SecretPage';

// --- Types & Constants ---

interface Poem {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

interface BookEntity {
  id: string;
  title: string;
  description: string;
  status: 'writing' | 'completed' | 'planning';
}

type Tab = 'versos' | 'filosofia' | 'biblioteca';

const PHILOSOPHY_SECTIONS = [
  {
    id: 'sentido',
    title: '01 / Sentido Universal',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    content: "Se nada faz sentido, 'nada fazer sentido' é o esperado. A reflexão sobre o sentido depende de um próprio sentido implícito, sendo autodestrutiva. Todas as definições sobre o sentido universal são 'inúteis', pois refletem sobre algo no qual o valor é indefinido. Para o pós-lúcido, o sentido universal é uma variável não operacional: sua existência ou ausência é irrelevante para a execução do Ser. É utilidade deliberada, não verdade revelada."
  },
  {
    id: 'fases',
    title: '02 / Fases de Evolução',
    icon: <Activity className="w-5 h-5 text-blue-400" />,
    items: [
      { label: 'Pseudolucidez', desc: 'Operação em modo automático sob regência de normas externas. Crença ilusória de que a realidade possui um sentido intrínseco.' },
      { label: 'Lucidez', desc: 'Consciência da ausência de normas universais claras. Risco de estagnação no niilismo passivo e angústia.' },
      { label: 'Pós-Lucidez', desc: 'Domínio da Interfragmentação e gestão de estados operacionais estáveis. Ação baseada em utilidade estratégica.' }
    ]
  },
  {
    id: 'definicoes',
    title: '03 / Definições Gerais',
    icon: <Layers className="w-5 h-5 text-purple-500" />,
    items: [
      { label: 'Interfragmentação', desc: 'A identidade é composta por fragmentos especializados coordenados por um Núcleo de Continuidade.' },
      { label: 'Anulação Pragmática', desc: 'Filtro de interrupção imediata entre a entrada de dados e a síntese interpretativa.' },
      { label: 'Ataraxia Operacional', desc: 'Estabilidade em movimento. O Ser permanece inabalável enquanto executa a arquitetura deliberada do ambiente.' }
    ]
  },
  {
    id: 'siata',
    title: '04 / Método S.I.A.T.A',
    icon: <Crosshair className="w-5 h-5 text-red-400" />,
    content: 'O motor operacional da Autenticidade Dinâmica:',
    items: [
      { label: 'S - Ser', desc: 'Alocação de foco. Minimizar interferências de estados passados ou projeções futuras.' },
      { label: 'I - Identificar', desc: 'Mapeamento de ambiente. Seleção do fragmento operacional com maior eficiência.' },
      { label: 'A - Assumir', desc: 'Transição de comando. Autorizar a ativação do fragmento selecionado sem hesitação.' },
      { label: 'T - Tornar-se', desc: 'Execução plena. Atuação fiel às capacidades e limites do estado ativo.' },
      { label: 'A - Avançar', desc: 'Encerramento e limpeza. Desalocação do fragmento e preparação para o próximo estado.' }
    ]
  },
  {
    id: 'trindade',
    title: '05 / Trindade Funcional',
    icon: <Trophy className="w-5 h-5 text-yellow-400" />,
    items: [
      { label: 'Resistência', desc: 'Capacidade inabalável do Vetor de absorver as oscilações sem deformação do Núcleo.' },
      { label: 'Conveniência', desc: 'Substituição da busca por felicidade pela busca por estabilidade e utilidade estratégica.' },
      { label: 'Potência', desc: 'Entender a capacidade do ambiente de ser moldado como uma extensão deliberada da vontade do Ser.' }
    ]
  },
  {
    id: 'patologia',
    title: '06 / Patologia Emocional (PE)',
    icon: <Zap className="w-5 h-5 text-orange-400" />,
    content: 'Corrupção crônica do processamento de dados do Vetor quando falha a Anulação Pragmática.',
    items: [
      { label: 'Febre Mental', desc: 'Resposta inflamatória que gera a reafirmação cíclica de problemas em vez de execução.' },
      { label: 'Retorno Tátil', desc: 'Falha na Negação Eficiente; o Ser "toca" a ferida emocional repetidamente.' },
      { label: 'Vetor de Contágio', desc: 'O estágio em que o Ser infectado busca validar sua falta de conveniência infectando o ambiente.' }
    ]
  }
];

// --- Components ---

const SocialLinks = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <a 
      href="https://twitter.com" 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
    >
      <Twitter className="w-4 h-4" />
    </a>
    <a 
      href="https://instagram.com" 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
    >
      <Instagram className="w-4 h-4" />
    </a>
  </div>
);

const Navbar = ({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tabs: Tab[] = ['versos', 'filosofia', 'biblioteca'];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center",
      scrolled 
        ? "bg-slate-950/70 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 shadow-lg shadow-purple-500/5" 
        : "bg-transparent py-6 px-6 md:px-12 md:py-8"
    )}>
      <div className="w-full max-w-7xl flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('versos')}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-2 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 group-hover:scale-105 transition-all duration-300">
            <Scroll className="text-white w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-serif italic tracking-wider text-glow leading-none group-hover:text-purple-300 transition-colors duration-300">
              A Biblioteca Extra-Lúcida
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] mt-1 ml-1 group-hover:text-slate-400 transition-colors duration-300">
              Kailan G. Lima
            </p>
          </div>
        </motion.div>

        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full relative backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative px-6 py-2 rounded-full text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300 cursor-pointer",
                activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <span className="relative z-20">{tab}</span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="nav_active_pill" 
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 rounded-full z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <SocialLinks className="hidden md:flex" />
          <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-white/10 z-[60] p-8 shadow-2xl">
               <div className="flex justify-end mb-12">
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white"><X /></button>
              </div>
              <div className="flex flex-col gap-8">
                {tabs.map((tab) => (
                  <button key={tab} onClick={() => { setActiveTab(tab); setIsOpen(false); }} className={cn("text-2xl font-serif italic text-left p-4 rounded-xl transition-all", activeTab === tab ? "bg-purple-600/10 text-purple-400" : "text-slate-400")}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};


// ... inside constants or top level ...

const CLASSICAL_TRACKS = [
  {
    title: "Fur Elise",
    author: "Beethoven",
    url: "https://www.mfiles.co.uk/mp3-downloads/fur-elise.mp3"
  },
  {
    title: "Clair de Lune",
    author: "Claude Debussy",
    url: "https://www.mfiles.co.uk/mp3-downloads/debussy-clair-de-lune.mp3"
  },
  {
    title: "Moonlight Sonata",
    author: "Beethoven",
    url: "https://www.mfiles.co.uk/mp3-downloads/moonlight-movement1.mp3"
  },
  {
    title: "Nocturne Op. 9 No. 2",
    author: "Chopin",
    url: "https://www.mfiles.co.uk/mp3-downloads/chopin-nocturne-op9-no2.mp3"
  },
  {
    title: "Canon in D",
    author: "Johann Pachelbel",
    url: "https://www.mfiles.co.uk/mp3-downloads/pachelbels-canon-arranged.mp3"
  },
  {
    title: "Liebestraum",
    author: "Franz Liszt",
  url: "https://www.mfiles.co.uk/mp3-downloads/franz-liszt-liebestraum-3.mp3"
  }
];

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.warn("Reprodução automática bloqueada ou erro de fonte:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % CLASSICAL_TRACKS.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const currentTrack = CLASSICAL_TRACKS[currentTrackIndex];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={nextTrack}
        onError={() => {
          console.error(`Erro ao carregar a trilha: ${currentTrack.title}. Tentando próxima...`);
          setTimeout(nextTrack, 1500);
        }}
      />
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="glass p-4 rounded-2xl border border-white/10 w-64 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center relative overflow-hidden",
                isPlaying && "animate-pulse"
              )}>
                <Music2 className="w-6 h-6 text-purple-400 opacity-40" />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                    {[0,1,2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [8, 16, 8] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.15 }}
                        className="w-1 bg-purple-400"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Sintonizando Éter</h4>
                <div className="text-white text-sm font-serif italic truncate">{currentTrack.title}</div>
                <p className="text-slate-400 text-[10px] truncate">{currentTrack.author}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-90"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={nextTrack}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-white transition-all flex items-center gap-2"
                >
                  Mudar <SkipForward className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border",
          isExpanded 
            ? "bg-slate-900 border-white/10 text-white" 
            : "bg-linear-to-br from-purple-600 to-blue-600 border-white/20 text-white shadow-purple-500/20"
        )}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="music" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative">
               <Music2 className="w-6 h-6" />
               {isPlaying && (
                 <motion.div 
                   animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute inset-0 bg-white rounded-full -z-10"
                 />
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

// --- Page Components ---

const VersosPage = ({ poems, onPoemSelect }: { poems: Poem[]; onPoemSelect: (p: Poem) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPoems = poems.filter(poem => {
    const query = searchQuery.toLowerCase();
    return (
      poem.title.toLowerCase().includes(query) ||
      poem.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-7xl font-serif mb-6 leading-tight">Autenticidade <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400 italic">Dinâmica</span></h2>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed font-light">Uma coleção de pensamentos capturados no limiar entre o que somos e o que ousamos imaginar.</p>
        </div>
        
        <div className="w-full md:w-80 group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar título ou tag..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-slate-200 placeholder:text-slate-600 focus:border-purple-500/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {filteredPoems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPoems.map((poem, index) => (
            <motion.div
              key={poem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
              whileHover={{ y: -5 }}
              onClick={() => onPoemSelect(poem)}
              className="glass p-6 md:p-8 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Feather className="w-12 h-12" />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {poem.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">{tag}</span>
                ))}
              </div>
              <h3 className="text-xl md:text-2xl font-serif mb-4 group-hover:text-purple-400 transition-colors">{poem.title}</h3>
              <p className="text-slate-400 line-clamp-3 font-light italic leading-relaxed text-sm md:text-base">
                "{poem.content.split('\n')[0].replace(/[#*]/g, '')}..."
              </p>
              <div className="mt-8 flex items-center text-xs text-slate-500 font-medium group-hover:text-slate-300 transition-colors uppercase tracking-widest">
                Ler Profundamente <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center opacity-40">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-700" />
          <p className="font-serif italic text-xl">Nenhum fragmento encontrado para esta busca.</p>
        </div>
      )}
    </motion.div>
  );
};

const BibliotecaPage = ({ books }: { books: BookEntity[] }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12 max-w-5xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="text-4xl md:text-5xl font-serif mb-4 italic">Futuras <span className="text-blue-400">Obras</span></h2>
        <p className="text-slate-400 font-light">Mundos sob construção...</p>
      </div>
      <Scroll className="text-slate-800 w-12 h-12 hidden md:block" />
    </div>

    <div className="grid grid-cols-1 gap-8">
      {books.map((book) => (
        <div key={book.id} className="flex flex-col lg:flex-row gap-8 items-center bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl group overflow-hidden relative">
          <div className="w-full lg:w-48 h-64 bg-gradient-to-t from-slate-900 to-purple-900 rounded-lg shadow-2xl flex-shrink-0 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform duration-500">
            <Book className="w-12 h-12 text-purple-400 opacity-20" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">
              {book.status === 'writing' ? 'Em Escrita' : book.status === 'completed' ? 'Concluído' : 'Planejamento'}
            </span>
            <h3 className="text-2xl md:text-3xl font-serif mt-4 mb-3">{book.title}</h3>
            <div className="text-slate-400 font-light text-sm md:text-base leading-relaxed mb-6 italic prose prose-invert prose-sm">
              <Markdown>{book.description}</Markdown>
            </div>
            <button className="w-full md:w-auto px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-[10px] uppercase tracking-widest font-bold">Acompanhar</button>
          </div>
        </div>
      ))}
      {books.length === 0 && (
        <div className="flex items-center justify-center glass p-10 md:p-16 text-center border-dashed border-2 border-white/5 opacity-40">
          <div>
            <Sparkles className="w-6 h-6 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 font-serif italic text-base md:text-lg">Próxima inspiração aguarda no horizonte...</p>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

const AdminPage = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'poems' | 'books'>('poems');
  const [loading, setLoading] = useState(false);

  // Forms
  const [poemTitle, setPoemTitle] = useState('');
  const [poemContent, setPoemContent] = useState('');
  const [poemTags, setPoemTags] = useState('');
  const [poemCustomDate, setPoemCustomDate] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [bookStatus, setBookStatus] = useState<'writing' | 'completed' | 'planning'>('writing');
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      // Map 'kailan_adm' to 'blayrandomxxx@gmail.com' for Firebase email authentication
      const email = username === 'kailan_adm' ? 'blayrandomxxx@gmail.com' : username;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.error(e);
      alert('Erro ao autenticar: ' + (e as Error).message);
    }
    setLoading(false);
  };

  const publishPoem = async () => {
    if (!poemTitle || !poemContent) return;
    setLoading(true);
    try {
      const targetDate = poemCustomDate ? new Date(poemCustomDate) : new Date();
      await addDoc(collection(db, 'poems'), {
        title: poemTitle,
        content: poemContent,
        tags: poemTags ? poemTags.split(',').map(t => t.trim()).filter(Boolean) : [],
        date: targetDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
        createdAt: targetDate.toISOString()
      });
      setPoemTitle(''); setPoemContent(''); setPoemTags(''); setPoemCustomDate('');
      alert('Poesia publicada!');
    } catch (e) { 
      console.error(e);
      alert('Erro ao publicar poesia: ' + (e as Error).message);
    }
    setLoading(false);
  };

  const publishBook = async () => {
    if (!bookTitle || !bookDesc) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'books'), {
        title: bookTitle,
        description: bookDesc,
        status: bookStatus,
        createdAt: new Date().toISOString()
      });
      setBookTitle(''); setBookDesc('');
      alert('Obra publicada!');
    } catch (e) {
      console.error(e);
      alert('Erro ao publicar obra: ' + (e as Error).message);
    }
    setLoading(false);
  };

  // If not authenticated with Firebase, show login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="glass p-8 w-full max-w-md space-y-6">
          <div className="text-center">
            <LogIn className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif italic text-white text-glow">Acesso Restrito</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Kailan G. Lima</p>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Usuário ou E-mail" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-purple-500 transition-colors outline-none"
            />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-purple-500 transition-colors outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 p-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Desbloquear Painel'}
          </button>
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => window.location.hash = ''} 
              className="text-slate-500 text-xs uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
            >
              Voltar ao Santuário
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-purple-500/50 p-1 flex items-center justify-center bg-slate-800">
             {user.photoURL ? (
               <img src={user.photoURL} alt="" className="w-full h-full rounded-full" />
             ) : (
               <Sparkles className="text-purple-400 w-5 h-5" />
             )}
          </div>
          <div>
            <h2 className="text-2xl font-serif italic text-white flex items-center gap-3">
              <Zap className="text-yellow-400 w-5 h-5" /> Painel Admin
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Logado como: {user.email}</p>
          </div>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button onClick={() => setMode('poems')} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer", mode === 'poems' ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-slate-500 hover:text-slate-300")}>Poesias</button>
          <button onClick={() => setMode('books')} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer", mode === 'books' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300")}>Obras</button>
          <button onClick={() => signOut(auth)} className="ml-2 px-3 py-2 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 md:p-10 space-y-8 rounded-3xl">
        {mode === 'poems' ? (
          <>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-bold">Título da Poesia</label>
                <input type="text" placeholder="Ex: Crepúsculo do Vetor" value={poemTitle} onChange={e => setPoemTitle(e.target.value)} className="w-full bg-slate-900/50 border border-white/5 p-4 rounded-xl text-white font-serif text-2xl focus:border-purple-500/50 outline-none transition-all shadow-inner" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-bold">Tags (vírgula)</label>
                <input type="text" placeholder="alma, sombra, vacuo" value={poemTags} onChange={e => setPoemTags(e.target.value)} className="w-full bg-slate-900/50 border border-white/5 p-3 rounded-xl text-white text-xs focus:border-purple-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-bold">Data de Manifestação (Opcional)</label>
                <input type="date" value={poemCustomDate} onChange={e => setPoemCustomDate(e.target.value)} className="w-full bg-slate-900/50 border border-white/5 p-3 rounded-xl text-white text-xs focus:border-purple-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-bold">Conteúdo Estético</label>
                <textarea placeholder="O silêncio ecoou..." value={poemContent} onChange={e => setPoemContent(e.target.value)} className="w-full bg-slate-900/50 border border-white/5 p-4 rounded-xl text-white h-80 font-serif text-lg focus:border-purple-500/50 outline-none transition-all resize-none" />
              </div>
            </div>
            <button onClick={publishPoem} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 p-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-900/20 active:scale-[0.98] cursor-pointer">
              {loading ? 'Transmutando Dados...' : <><Send className="w-5 h-5" /> Publicar no Éter</>}
            </button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-bold">Título da Obra</label>
                <input type="text" placeholder="Project name" value={bookTitle} onChange={e => setBookTitle(e.target.value)} className="w-full bg-slate-900/50 border border-white/5 p-4 rounded-xl text-white font-serif text-2xl focus:border-blue-500/50 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-bold">Estado de Existência</label>
                <select value={bookStatus} onChange={(e: any) => setBookStatus(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white appearance-none cursor-pointer">
                  <option value="planning">Arquitetando (Planejamento)</option>
                  <option value="writing">Em Execução (Escrita)</option>
                  <option value="completed">Manifesto (Concluído)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-bold">Sinopse Narrativa</label>
                <textarea placeholder="Markdown description..." value={bookDesc} onChange={e => setBookDesc(e.target.value)} className="w-full bg-slate-900/50 border border-white/5 p-4 rounded-xl text-white h-56 font-light focus:border-blue-500/50 outline-none resize-none" />
              </div>
            </div>
            <button onClick={publishBook} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 p-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] cursor-pointer">
               {loading ? 'Sincronizando...' : <><Book className="w-5 h-5" /> Registrar na Biblioteca</>}
            </button>
          </>
        )}
      </motion.div>

      <div className="text-center pt-8">
        <button onClick={() => window.location.hash = ''} className="group flex items-center gap-2 mx-auto text-slate-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold cursor-pointer">
           <X className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Voltar ao Santuário
        </button>
      </div>
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [isPrivate, setIsPrivate] = useState(window.location.hash === '#/private');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [books, setBooks] = useState<BookEntity[]>([]);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('versos');
  const [activePhilosSection, setActivePhilosSection] = useState(PHILOSOPHY_SECTIONS[0].id);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const philisSectionScrollRef = useRef<HTMLDivElement>(null);
 const isSecret = window.location.pathname === '/secret';

  if (isSecret) {
    return <SecretPage />;
  }
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    
    const handleHashChange = () => {
      setIsPrivate(window.location.hash === '#/private');
    };
    window.addEventListener('hashchange', handleHashChange);

    // Firestore setup
    const qPoems = query(collection(db, 'poems'), orderBy('createdAt', 'desc'));
    const unsubPoems = onSnapshot(qPoems, (snap) => {
      setPoems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem)));
    });

    const qBooks = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsubBooks = onSnapshot(qBooks, (snap) => {
      setBooks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookEntity)));
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('hashchange', handleHashChange);
      unsubPoems();
      unsubBooks();
    };
  }, []);

  // Auto-select philosophy section based on scroll position
  useEffect(() => {
    const scrollContainer = philisSectionScrollRef.current;
    if (!scrollContainer) return;

    const handlePhilosophyScroll = () => {
      const container = philisSectionScrollRef.current;
      if (!container) return;

      const containerCenter = container.scrollLeft + container.clientWidth / 2;
      const buttons = container.querySelectorAll('[data-section-id]');
      
      let closest: { section: string; distance: number } = {
        section: PHILOSOPHY_SECTIONS[0].id,
        distance: Infinity
      };

      buttons.forEach((button) => {
        const sectionId = button.getAttribute('data-section-id');
        const buttonCenter = button.offsetLeft + button.clientWidth / 2;
        const distance = Math.abs(containerCenter - buttonCenter);

        if (distance < closest.distance) {
          closest = { section: sectionId || PHILOSOPHY_SECTIONS[0].id, distance };
        }
      });

      setActivePhilosSection(closest.section);
    };

    scrollContainer.addEventListener('scroll', handlePhilosophyScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handlePhilosophyScroll);
  }, []);

  if (isPrivate) {
    return (
      <div className="min-h-screen atmospheric-bg relative overflow-hidden font-sans">
        <AdminPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen atmospheric-bg relative overflow-hidden flex flex-col font-sans selection:bg-purple-500/50">
      {/* Background Effects */}
      <motion.div animate={{ x: mousePos.x / 40, y: mousePos.y / 40 }} className="fixed top-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/10 blur-[100px] rounded-full z-0 pointer-events-none" />
      <motion.div animate={{ x: -mousePos.x / 30, y: -mousePos.y / 30 }} className="fixed bottom-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-600/10 blur-[120px] rounded-full z-0 pointer-events-none" />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <MusicPlayer />

      <main className="relative z-10 flex-1 container mx-auto px-6 pt-28 pb-12 md:pt-36 md:pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'versos' && <VersosPage poems={poems} onPoemSelect={setSelectedPoem} />}
          {activeTab === 'filosofia' && (
            <motion.div key="filosofia" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto py-4">
              <div className="space-y-8">
                {/* Mobile Header */}
                <div className="lg:hidden mb-6">
                  <h2 className="text-3xl md:text-4xl font-serif italic text-glow text-white mb-2">Autenticidade Dinâmica</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3">Estrutura Operacional</p>
                </div>

                {/* Mobile Scroll Instruction and Indicators */}
                <div className="lg:hidden">
                  <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-xs text-purple-300 font-medium">Deslize para ver os 6 tópicos</span>
                  </div>
                  {/* Slide Indicators */}
                  <div className="flex items-center justify-center gap-1.5">
                    {PHILOSOPHY_SECTIONS.map((section) => (
                      <motion.div
                        key={section.id}
                        animate={{ 
                          scale: activePhilosSection === section.id ? 1.3 : 1,
                          backgroundColor: activePhilosSection === section.id ? '#a78bfa' : '#64748b'
                        }}
                        className="w-1.5 h-1.5 rounded-full cursor-pointer transition-all"
                        onClick={() => setActivePhilosSection(section.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  <div ref={philisSectionScrollRef} className="w-full lg:w-64 flex lg:flex-col overflow-x-auto lg:overflow-x-visible flex-shrink-0 space-x-2 lg:space-x-0 lg:space-y-2 pb-4 lg:pb-0 scrollbar-hide snap-x relative">

                    <div className="hidden lg:block mb-8 pl-4">
                      <h2 className="text-2xl font-serif italic text-glow text-white">Autenticidade Dinâmica</h2>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 border-t border-white/5 pt-2">Estrutura Operacional</p>
                    </div>
                    {PHILOSOPHY_SECTIONS.map((section) => (
                      <button
                        key={section.id}
                        data-section-id={section.id}
                        onClick={() => {
                          setActivePhilosSection(section.id);
                        }}
                        className={cn(
                          "whitespace-nowrap flex-shrink-0 lg:w-full text-left p-3 md:p-4 rounded-lg transition-all flex items-center gap-3 group snap-start cursor-pointer border", 
                          activePhilosSection === section.id 
                            ? 'bg-white/10 text-white border-white/10 shadow-lg shadow-purple-500/5' 
                            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border-transparent hover:border-white/5'
                        )}
                      >
                        <span className={cn("transition-transform group-hover:scale-110 flex-shrink-0", activePhilosSection === section.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100')}>{section.icon}</span>
                        <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold line-clamp-2">{section.title.split(' / ')[1]}</span>
                      </button>
                    ))}
                  </div>
                      <div className="flex-1 w-full min-w-0">
                        <AnimatePresence mode="wait">
                          {PHILOSOPHY_SECTIONS.map((section) => section.id === activePhilosSection && (
                            <motion.div 
                              key={section.id} 
                              initial={{ opacity: 0, x: 20 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              exit={{ opacity: 0, x: -20 }} 
                              className="glass p-6 md:p-12 lg:p-16 relative min-h-[350px] md:min-h-[500px] rounded-2xl md:rounded-3xl overflow-hidden"
                            >
                              <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8">
                                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 rounded-full border border-white/5 shrink-0">
                                    {section.icon}
                                  </div>
                                  <h3 className="text-xl md:text-3xl font-serif italic">{section.title}</h3>
                                </div>
                                
                                {section.content && (
                                  <div className="prose prose-invert prose-slate max-w-none mb-8 md:mb-10">
                                    <p className="text-slate-300 text-base md:text-xl leading-relaxed font-light italic">
                                      "{section.content}"
                                    </p>
                                  </div>
                                )}

                                {section.items && (
                                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                                    {section.items.map((item, i) => (
                                      <motion.div 
                                        key={item.label} 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }} 
                                        className="p-4 md:p-6 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                      >
                                        <h4 className="text-purple-400 text-[10px] uppercase font-black tracking-widest mb-1 md:mb-2">{item.label}</h4>
                                        <p className="text-slate-400 font-light leading-relaxed text-xs md:text-base">{item.desc}</p>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                            
                            {section.id === 'siata' && (
                              <div className="mt-12 p-4 md:p-6 border-t border-purple-500/20 bg-purple-500/5 rounded-xl">
                                <p className="text-[10px] md:text-xs text-slate-500 italic uppercase tracking-wider">
                                  * O Método S.I.A.T.A deve ser aplicado ciclicamente para garantir a Ataraxia Operacional contínua.
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Decorative Background Blob inside the section */}
                          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'biblioteca' && <BibliotecaPage books={books} />}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 p-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="text-slate-500 text-[10px] md:text-xs tracking-widest font-medium uppercase">&copy; 2026 Kailan G. Lima.</div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <button onClick={() => window.location.hash = '#/private'} className="text-slate-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold cursor-pointer">Acesso Admin</button>
          <div className="w-1 h-1 bg-slate-800 rounded-full hidden md:block" />
          <div className="text-slate-400 font-serif italic text-xs md:text-sm">"O sentido é uma variável não operacional."</div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedPoem && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/95 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              layoutId={selectedPoem.id} 
              className="bg-slate-900 border border-white/10 w-full max-w-2xl min-h-[50vh] max-h-[90vh] p-6 md:p-16 relative overflow-y-auto rounded-3xl my-auto shadow-2xl"
            >
              <div className="sticky top-0 right-0 flex justify-end z-20 -mr-2 -mt-2">
                <button 
                  onClick={() => setSelectedPoem(null)} 
                  className="p-2 bg-slate-900/80 backdrop-blur-md text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all border border-white/5"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              <div className="relative z-10 pt-4">
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPoem.tags.map(tag => (
                    <span key={tag} className="text-[9px] md:text-[10px] uppercase tracking-widest text-purple-400 font-black bg-purple-500/10 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl md:text-5xl font-serif mb-2 text-white leading-tight">{selectedPoem.title}</h2>
                <p className="text-slate-500 text-[9px] md:text-[10px] mb-8 md:mb-12 uppercase tracking-[0.2em] font-medium">{selectedPoem.date}</p>
                
                <div className="markdown-body text-base md:text-lg leading-[1.8]">
                  <Markdown>{selectedPoem.content}</Markdown>
                </div>

                <div className="mt-12 md:mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
                  <button className="text-slate-400 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-black">Compartilhar</button>
                  <Sparkles className="text-purple-500/20 w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
