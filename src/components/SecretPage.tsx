import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, Heart, ChevronRight, MessageCircle, AlertTriangle, 
  RefreshCw, Lock, Sparkles, Smile, MessageSquare, Check, HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types for the game steps
type Step = 
  | 'start'           // Letra "lua"
  | 'numbers'         // Escolha de números (correto = 7)
  | 'colors'          // Diálogo WhatsApp & troca de tema
  | 'meme_runaway'    // Meme do tenor + botão de próximo fujão
  | 'binary_portrait' // Retrato em número binário da pessoa especial
  | 'poetry'          // Exibição da poesia
  | 'quiz'            // Quiz (código "limão")
  | 'fake_error'      // Erro falso da página
  | 'jumpscare'       // Jumpscare repentino
  | 'final';          // Middle finger e emoji rindo (🖕 😂)

export default function SecretPage() {
  const [step, setStep] = useState<Step>('start');
  const [keywordInput, setKeywordInput] = useState('');
  const [showKeywordError, setShowKeywordError] = useState(false);
  const [isKeywordCorrect, setIsKeywordCorrect] = useState(false);

  // Numbers step states
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [numberFeedback, setNumberFeedback] = useState('');

  // Whatsapp conversation step states
  const [colorsOpinion, setColorsOpinion] = useState<string | null>(null);

  // Runaway button states
  const [runawayCount, setRunawayCount] = useState(0);
  const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 });
  const [runawaySuccess, setRunawaySuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Quiz states
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // General interactive states
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; size: number; dx: number; dy: number; rotation: number }[]>([]);

  // Jumpscare/Monster states
  const [monsterHealth, setMonsterHealth] = useState(100);
  const [monsterScale, setMonsterScale] = useState(1);
  const [isMonsterHurt, setIsMonsterHurt] = useState(false);
  const [flippedEmoji, setFlippedEmoji] = useState(false);

  // Function to add flying hearts/particles
  const addHeart = (e: React.MouseEvent) => {
    if (step === 'start' || step === 'fake_error') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Burst of 5 hearts for high visibility and visual satisfaction!
    const burst = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + Math.random() + i,
      x,
      y,
      size: Math.random() * 26 + 14, // 14px to 40px - much sharper!
      dx: (Math.random() - 0.5) * 140, // random spread along X axis
      dy: -Math.random() * 160 - 80,   // float upwards by 80px to 240px
      rotation: Math.random() * 80 - 40, // random tilt
    }));

    setHearts((prev) => [...prev.slice(-60), ...burst]);

    if (step === 'jumpscare') {
      handleMonsterHit();
    }
  };

  // Inflict damage with hearts
  const handleMonsterHit = () => {
    if (monsterHealth <= 0) return;
    setIsMonsterHurt(true);
    setTimeout(() => setIsMonsterHurt(false), 150);

    setMonsterHealth((prev) => {
      const next = prev - 20;
      if (next <= 0) {
        // Defeated! Move to congrats/final step after a small cool effect delay
        setTimeout(() => {
          setStep('final');
        }, 1200);
        return 0;
      }
      return next;
    });
    setMonsterScale((prev) => Math.max(0.65, prev - 0.07));
  };

  // Keyboard binding for quick pass or secret hacks (helps debugging, but kept clean)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Secret bypass to start if wanted (optional)
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Handler for Password Step
  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = keywordInput.trim().toLowerCase();
    if (sanitized === 'lua') {
      setIsKeywordCorrect(true);
      setShowKeywordError(false);
      // Brief feedback before auto-advance
      setTimeout(() => {
        setStep('numbers');
      }, 800);
    } else {
      setShowKeywordError(true);
      setKeywordInput('');
    }
  };

  // Handler for Numbers Step
  const handleNumberSelect = (num: number) => {
    setSelectedNumber(num);
    if (num === 7) {
      setNumberFeedback('Excelente escolha! Sete é místico, perfeito e o número correto! ✨ Clique em Próximo para continuar.');
    } else {
      const responses: Record<number, string> = {
        3: 'Três é legal, mas falta um toque de mistério... Tente outro!',
        4: 'Quatro é muito quadrado! ⬜ Tente outro número.',
        11: 'Onze é bom, mas é meio solitário... Que tal tentar mais uma vez?',
        13: 'Treze atrai sorte ou azar? Melhor tentar outro número! 🕵️‍♂️',
        21: 'Vinte e um é alto demais! Escolha algo mais aconchegante.'
      };
      setNumberFeedback(responses[num] || 'Número interessante, mas tem um que brilha mais aqui... Tente novamente!');
    }
  };

  // Handle Runaway Button Escape Move
  const handleButtonEscape = () => {
    if (runawaySuccess) return;

    if (runawayCount >= 4) {
      // Give up after 5 escapes (0 to 4)
      setRunawaySuccess(true);
      setButtonOffset({ x: 0, y: 0 });
      return;
    }

    setRunawayCount(prev => prev + 1);

    // Calculate a random displacement inside a reasonable boundary
    let dx = (Math.random() - 0.5) * 260;
    let dy = (Math.random() - 0.5) * 180;

    // Avoid placing it exactly under the cursor which is near dx=0 dy=0
    if (Math.abs(dx) < 60) dx = dx > 0 ? dx + 70 : dx - 70;
    if (Math.abs(dy) < 40) dy = dy > 0 ? dy + 50 : dy - 50;

    setButtonOffset({ x: dx, y: dy });
  };

  // Handler for poetry quiz answer
  const handleQuizAnswer = (option: string) => {
    if (option === 'd') {
      setQuizAnswer('d');
      setQuizFeedback('não vou deixar vc escolher essa, escolha outra.');
      return;
    }
    
    setQuizAnswer(option);
    
    if (option === 'c') {
      setQuizFeedback('Acertou em cheio! 🍋 Afinal, nada expressa melhor o afeto do que ganhar alguns limõezinhos colhidos especialmente pra você kkkk.');
    } else if (option === 'a') {
      setQuizFeedback('Painel solar?! kkkk A tecnologia é linda, mas os sentimentos aqui são de outra fonte. Escolha outra opção!');
    } else if (option === 'b') {
      setQuizFeedback('Raquete elétrica?! Rápido e chocante, mas não é bem isso kkk. Tente outra!');
    }
  };

  // Triggers jumpscare with a monster battle
  const handleReload = () => {
    setMonsterHealth(100);
    setMonsterScale(1);
    setIsMonsterHurt(false);
    setStep('jumpscare');
  };

  // Active theme classes based on current step
  // Custom chat color palette themes: Black background (preto), electric blue/cyan accents (azul), deep sweet pink (rosa), violet/purple details (roxo)
  const isPostColorStep = step !== 'start' && step !== 'numbers';

  return (
    <div 
      onClick={addHeart}
      className={cn(
        "min-h-screen text-white relative transition-colors duration-1000 overflow-hidden flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-pink-500/50 select-none",
        isPostColorStep 
          ? "bg-slate-950 text-slate-100" // Preto (deep obsidian slate) 
          : "bg-slate-900 text-slate-100"  // Deep midnight blue
      )}
    >
      {/* Dynamic theme accents glow for steps beyond colors selection */}
      {isPostColorStep && (
        <>
          <div className="absolute top-[10%] left-[20%] w-80 h-80 rounded-full bg-blue-600/10 blur-[130px] -z-10 pointer-events-none" />
          <div className="absolute bottom-[10%] right-[20%] w-80 h-80 rounded-full bg-pink-500/10 blur-[130px] -z-10 pointer-events-none" />
          <div className="absolute top-[40%] right-[10%] w-96 h-96 rounded-full bg-purple-600/10 blur-[160px] -z-10 pointer-events-none" />
        </>
      )}

      {/* Floating hearts container (renders above normal layout elements for vibrant focus) */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, scale: 0.2, x: h.x, y: h.y }}
              animate={{ 
                opacity: [1, 1, 0], // stay solid then fade elegantly
                x: h.x + h.dx, 
                y: h.y + h.dy, 
                scale: [0.2, 1.4, 0.9], // scales up then dynamic size
                rotate: h.rotation 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              className="absolute text-pink-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.95)] font-bold pointer-events-none select-none"
              style={{ fontSize: h.size }}
            >
              ❤️
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-lg mx-auto flex items-center justify-between pointer-events-none opacity-40 text-xs tracking-[0.25em] uppercase">
        <span className="flex items-center gap-1.5 font-mono">
          <Moon className="w-3.5 h-3.5 text-blue-400 rotate-12" /> COMENTÁRIO SECRETO
        </span>
        <span className="font-mono">ÁREA INDEPENDENTE v2.0</span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: START (Password 'lua') */}
          {step === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl shadow-cyan-950/20 text-center relative overflow-hidden"
              id="start-panel"
            >
              {/* Spinning/floating glowing crescent moon */}
              <div className="mb-6 flex justify-center relative">
                <div className="absolute w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="p-4 bg-white/5 border border-white/10 rounded-full text-amber-100 z-10 shadow-inner"
                >
                  <Moon className="w-10 h-10 fill-amber-100/10 text-amber-300" />
                </motion.div>
              </div>

              <h2 className="text-2xl md:text-3xl font-serif tracking-wide text-glow text-white mb-2">
                Acesso Restrito
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Este espaço contém memórias especiais. Para abri-lo, por favor insira a palavra-chave que nos conecta.
              </p>

              <form onSubmit={handleKeywordSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Digite a palavra-chave..."
                    value={keywordInput}
                    onChange={(e) => {
                      setKeywordInput(e.target.value);
                      if (showKeywordError) setShowKeywordError(false);
                    }}
                    className={cn(
                      "w-full bg-slate-950/70 border text-center p-4 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600",
                      showKeywordError 
                        ? "border-red-500/80 focus:border-red-500" 
                        : isKeywordCorrect 
                          ? "border-green-500/80 focus:border-green-500 text-green-400" 
                          : "border-white/10 focus:border-cyan-500/50"
                    )}
                  />
                  {showKeywordError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 mt-2 font-medium"
                    >
                      Palavra-chave incorreta... 🤫 Dica: Símbolo da noite.
                    </motion.p>
                  )}
                  {isKeywordCorrect && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-400 mt-2 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 shrink-0" /> Perfeito! Acesso liberado...
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isKeywordCorrect}
                  className={cn(
                    "w-full p-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg",
                    isKeywordCorrect
                      ? "bg-green-600/20 text-green-400 border border-green-500/30"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
                  )}
                  id="unlock-btn"
                >
                  <Lock className="w-4 h-4" /> Desbloquear
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 1: NUMBERS (Correct = 7) */}
          {step === 'numbers' && (
            <motion.div
              key="numbers"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl text-center"
              id="numbers-panel"
            >
              <HelpCircle className="w-10 h-10 mx-auto text-cyan-400 mb-4 animate-bounce" />
              <h2 className="text-xl md:text-2xl font-serif text-white mb-2">
                Uma Escolha Inicial
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Qual desses números você acha o mais interessante?
              </p>

              {/* Numbers Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[3, 4, 7, 11, 13, 21].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumberSelect(num)}
                    className={cn(
                      "aspect-square rounded-2xl border text-xl font-bold flex items-center justify-center transition-all cursor-pointer",
                      selectedNumber === num
                        ? num === 7
                          ? "bg-gradient-to-br from-pink-500 to-rose-600 border-pink-400 text-white shadow-lg shadow-pink-500/30 scale-105"
                          : "bg-slate-800 border-red-500/50 text-red-300"
                        : "bg-slate-950/40 border-white/5 hover:border-white/20 hover:bg-slate-900 text-slate-300"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Display Feedback */}
              {selectedNumber !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl text-xs leading-relaxed mb-6 border",
                    selectedNumber === 7 
                      ? "bg-green-500/10 border-green-500/20 text-green-300" 
                      : "bg-red-500/5 border-red-500/10 text-red-300"
                  )}
                >
                  {numberFeedback}
                </motion.div>
              )}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setStep('colors')}
                disabled={selectedNumber !== 7}
                className={cn(
                  "w-full p-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-md",
                  selectedNumber === 7
                    ? "bg-white text-slate-950 hover:bg-slate-100 cursor-pointer"
                    : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
                )}
                id="numbers-next-btn"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: COLORS (WhatsApp bubbles & themed change) */}
          {step === 'colors' && (
            <motion.div
              key="colors"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-lg bg-slate-950/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6"
              id="colors-panel"
            >
              {/* Simulated WhatsApp Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-lg text-pink-400 font-bold shadow-inner">
                    🌸
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      Nunuzinha Flor ❤️❤️🥰 🪷
                    </h4>
                    <p className="text-[10px] text-green-400 font-medium tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /> online
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">Hoje</div>
              </div>

              {/* Message bubbles list */}
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                {/* Bubble 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="self-start max-w-[85%] bg-slate-900 border border-white/5 p-3.5 rounded-2xl rounded-tl-sm text-slate-300 relative text-xs md:text-sm shadow-md"
                >
                  <p className="text-slate-100 font-medium">preto, azul e rosa</p>
                  <span className="text-[9px] text-slate-500 block text-right mt-1.5">12:30</span>
                </motion.div>

                {/* Bubble 2 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="self-start max-w-[85%] bg-slate-900 border border-white/5 p-3.5 rounded-2xl rounded-tl-sm text-slate-300 relative text-xs md:text-sm shadow-md"
                >
                  <p className="text-slate-100 font-medium">acho que são essas</p>
                  <span className="text-[9px] text-slate-500 block text-right mt-1.5">12:30</span>
                </motion.div>

                {/* Bubble 3 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.7 }}
                  className="self-start max-w-[85%] bg-slate-900 border border-white/5 p-3.5 rounded-2xl rounded-tl-sm text-slate-300 relative text-xs md:text-sm shadow-md"
                >
                  <p className="text-slate-100 font-medium">mas também gosto bastante do roxo</p>
                  <span className="text-[9px] text-slate-500 block text-right mt-1.5">12:30</span>
                </motion.div>
              </div>

              {/* The interactive question */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-sm font-medium italic text-pink-300 mb-3 text-center">
                  O que você acha dessas cores?? ✨
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    ['As melhores!', 'lindas'],
                    ['Combinação perfeita 🖤', 'perfeitas'],
                    ['São as nossas cores! ❤️', 'nossas'],
                    ['Simplesmente amei!', 'amei']
                  ].map(([label, value]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setColorsOpinion(value)}
                      className={cn(
                        "p-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer",
                        colorsOpinion === value
                          ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-white text-white shadow-md shadow-purple-500/15"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme description hint */}
              <div className="text-[10px] text-center text-slate-500 italic px-2">
                * Nota: Estas foram escolhidas como as cores oficiais e temáticas desta página secreta! 🖤 💙 💗 💜
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setStep('meme_runaway')}
                disabled={!colorsOpinion}
                className={cn(
                  "w-full p-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-md",
                  colorsOpinion
                    ? "bg-white text-slate-950 hover:bg-slate-100 cursor-pointer"
                    : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
                )}
                id="colors-next-btn"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 3: RUNAWAY BUTTON + MEME */}
          {step === 'meme_runaway' && (
            <motion.div
              key="meme_runaway"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-950/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col items-center gap-6 relative min-h-[480px]"
              ref={containerRef}
              id="runaway-panel"
            >
              <div className="text-center w-full">
                <span className="text-[10px] uppercase tracking-widest text-pink-400 font-bold bg-pink-500/10 px-3 py-1 rounded-full mb-2 inline-block">
                  Descontração
                </span>
                <h3 className="text-lg md:text-xl font-serif text-white mt-1">
                  Um gif fofinho para aquecer o coração
                </h3>
              </div>

              {/* Tenor / Giphy Love GIF representation */}
              <div className="w-full max-w-xs aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center relative shadow-inner">
                <img 
                  src="https://media1.tenor.com/m/kRlG2TkDrBoAAAAC/cat-cat-meme.gif"
                  alt="Cute love cats"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  onError={(e) => {
                    // Fallback to static portrait if external GIF fails
                    e.currentTarget.src = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500";
                  }}
                />
              </div>

              {/* Running dialogues near the button */}
              <div className="h-10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {!runawaySuccess ? (
                    <motion.p
                      key={runawayCount}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-blue-300 font-mono italic"
                    >
                      {runawayCount === 0 && "Tente clicar no Próximo!"}
                      {runawayCount === 1 && "Epa! Quase! kkkk 😄"}
                      {runawayCount === 2 && "Muito lenta! Tenta mais uma vez! 💨"}
                      {runawayCount === 3 && "Vixi, o botão está animado hoje..."}
                      {runawayCount === 4 && "Tá quase travando ele..."}
                    </motion.p>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 font-semibold"
                    >
                      🗣️ "pode ir lá vai"
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Runaway Button space */}
              <div className="relative w-full h-24 flex items-center justify-center overflow-visible mt-2">
                <motion.div
                  animate={{ x: buttonOffset.x, y: buttonOffset.y }}
                  transition={runawaySuccess ? { type: 'spring' } : { type: 'tween', duration: 0.12 }}
                  className="absolute"
                >
                  <button
                    type="button"
                    onMouseEnter={handleButtonEscape}
                    onMouseLeave={() => {}} // dummy
                    onTouchStart={(e) => {
                      if (!runawaySuccess) {
                        e.preventDefault();
                        handleButtonEscape();
                      }
                    }}
                    onClick={() => {
                      if (runawaySuccess) {
                        setStep('binary_portrait');
                      } else {
                        handleButtonEscape();
                      }
                    }}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg flex items-center gap-2",
                      runawaySuccess
                        ? "bg-green-500 text-white hover:bg-green-600 active:scale-95 cursor-pointer"
                        : "bg-white text-slate-950 cursor-pointer"
                    )}
                    id="runaway-next-btn"
                  >
                    {runawaySuccess ? "Avançar" : "Próximo"} <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP: BINARY PORTRAIT */}
          {step === 'binary_portrait' && (
            <motion.div
              key="binary_portrait"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-950/70 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 relative"
              id="binary-portrait-panel"
            >
              {/* Decorative top badge */}
              <div className="text-center w-full">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-extrabold bg-cyan-400/10 px-4.5 py-1.5 rounded-full mb-2 inline-block">
                  🌌 Retrato Digital em Códigos (Binary Art)
                </span>
                <h3 className="text-xl md:text-2xl font-serif text-white mt-1">
                  Retrato de Alguém Especial
                </h3>
                <p className="text-slate-400 text-xs md:text-sm mt-1 leading-relaxed max-w-md mx-auto">
                  Desenhei você pixel por pixel usando apenas zeros e uns. Cada bit aqui conta um pedaço de sentimento... 💻💖
                </p>
              </div>

              {/* 
                DIRETRIZ DE ALTERAÇÃO AMIGÁVEL PARA O USUÁRIO:
                -------------------------------------------------------------------
                Se você tiver um arquivo de imagem (jpg, png, gif) da sua arte de números, 
                substitua a propriedade 'src' abaixo pela URL ou caminho da sua imagem.
                Se você fez uma arte em formato de TEXTO (ASCII de zeros e uns),
                você pode colar seu texto no bloco de código mono logo abaixo da tag img!
              */}
              <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 bg-black/60 relative p-4 flex flex-col items-center justify-center min-h-[300px] shadow-inner gap-4">
                
                {/* 1. SE VOCÊ USAR UMA IMAGEM DO SEU RETRATO: */}
                {/* Troque a URL abaixo pela imagem do seu retrato binário quando quiser! */}
                <img 
                  src="/foto.png" 
                  alt="Retrato de números binários de alguém especial"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-contain rounded-xl max-h-72 opacity-90 hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    // Se o usuário não colocar imagem ou der erro, esconde a tag de imagem e deixa apenas o layout conceitual
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* 2. CASO SEU RETRATO SEJA TEXTO PURO (ASCII / COORDENADAS) DE 0 e 1: */}
                <div className="w-full font-mono text-[7px] leading-[1.3] text-cyan-500/85 tracking-tighter text-center select-all select-none border border-cyan-550/20 bg-cyan-950/10 p-3 rounded-xl overflow-hidden whitespace-pre">
                  {/*
                    Cole sua arte de texto binário abaixo! 
                    Exemplo de demonstração de arte de zeros e uns se você optar por usar o formato texto:
                  */}
{`010011000101010101000001
011011110111011001100101  011011110111011001100101
011110010110111101110101011110010110111101110101
011011110111011001100101011011110111011001100101
 0111100101101111011101010111100101101111011101
  01101111011101100110010101101111011101100110
   0111100101101111011101010111100101101111
    011011110111011001100101011011110111
     011110010110111101110101011110
      011011110111011001100101
       01111001011011110111
        0110111101110110
         011110010110
          01101111
           0111
            01`}
                </div>

                <div className="text-[9px] text-slate-500 italic font-mono text-center px-1">
                  * Dica: TUdo isso foi feito com zeros e uns kkkkk! 🌸
                </div>
              </div>

              {/* Next step button */}
              <button
                type="button"
                onClick={() => setStep('poetry')}
                className="w-full p-4 bg-gradient-to-r from-blue-600 to-pink-500 text-white font-bold uppercase tracking-wider text-xs rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                id="binary-portrait-next-btn"
              >
                Continuar para a Poesia <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 4: POETRY */}
          {step === 'poetry' && (
            <motion.div
              key="poetry"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col gap-8 relative overflow-hidden"
              id="poetry-panel"
            >
              {/* Back decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-pink-400 font-bold mb-3 inline-block">
                  Poesia de Algum Instante
                </span>
                <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mx-auto" />
              </div>

              {/* Poem Content block */}
              <div className="prose prose-invert max-w-none text-center">
                <p className="font-serif italic text-base md:text-lg leading-[1.8] text-slate-200 whitespace-pre-line px-2">
                  {`Tu afeta como um ser mitológico acima do que considero lógico, acerca da minha própria lógica, e muito mais cosmológico.
Tantos cometas cômicos em sua atmosfera...
Os genes autossômicos não definem o que te espera.
As plantas fabricam flores como também formam espinhos;
Também edificam dores e recolhem os próprios caminhos.

sinto isso a todo instante, e de certa forme é uma vitória.
esse texto clichê e brochante, espero que você releve.
Para uma rotina sufocante, você deixa tudo mais leve.
Lembra que isso já foi escrito? procure na sua memória .

Para soar diferente eu juntei os fragmentos, 
Fique aqui, não se afaste, não restará revolta.
venha pra cá, no seu momento, te livrarei desses tormentos.
O cansaço nem me bate quando você está em volta.`}
                </p>
              </div>

              <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mx-auto" />

              {/* Done/Next */}
              <button
                type="button"
                onClick={() => setStep('quiz')}
                className="w-full md:w-auto md:mx-auto px-10 py-4 bg-white text-slate-950 font-bold uppercase tracking-wider text-xs rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-md shadow-black/20 cursor-pointer flex items-center justify-center gap-2"
                id="poetry-next-btn"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 5: QUIZ (O que achou da poesia?) */}
          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-950/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6"
              id="quiz-panel"
            >
              <div className="text-center">
                <HelpCircle className="w-10 h-10 mx-auto text-pink-400 mb-2" />
                <h2 className="text-xl md:text-2xl font-serif text-white mb-2">
                  O que você achou da poesia??
                </h2>
                <p className="text-slate-400 text-xs">
                  Responda com honestidade de acordo com as evidências históricas... 😄
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {[
                  ['a', 'painel solar'],
                  ['b', 'raquete elétrica'],
                  ['c', 'limão'],
                  ['d', 'six-seven ( não clique aqui plmds)']
                ].map(([opt, text]) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleQuizAnswer(opt)}
                    className={cn(
                      "w-full p-4 rounded-2xl text-left text-xs md:text-sm font-semibold border transition-all flex items-center justify-between cursor-pointer",
                      quizAnswer === opt
                        ? opt === 'c'
                          ? "bg-green-600/10 border-green-500 text-green-300"
                          : "bg-red-600/10 border-red-500 text-red-300"
                        : "bg-white/5 border-white/5 hover:border-white/20 text-slate-300 hover:text-white"
                    )}
                  >
                    <span>
                      <strong className="uppercase mr-2 font-mono text-pink-400">{opt})</strong> {text}
                    </span>
                    {quizAnswer === opt && (
                      <span className="text-lg">
                        {opt === 'c' ? '🍋' : '❌'}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Answer Feedback / Alerts */}
              {quizFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl text-xs leading-relaxed border font-medium text-center",
                    quizAnswer === 'c'
                      ? "bg-green-500/10 border-green-500/20 text-green-300"
                      : "bg-red-500/10 border-red-500/20 text-red-300"
                  )}
                >
                  {quizFeedback}
                </motion.div>
              )}

              {/* Progress Lock Check */}
              <button
                type="button"
                onClick={() => setStep('fake_error')}
                disabled={quizAnswer !== 'c'}
                className={cn(
                  "w-full p-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-md",
                  quizAnswer === 'c'
                    ? "bg-white text-slate-950 hover:bg-slate-100 cursor-pointer"
                    : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
                )}
                id="quiz-next-btn"
              >
                Avançar <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 6: FAKE ERROR */}
          {step === 'fake_error' && (
            <motion.div
              key="fake_error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl bg-[#0010ff] font-mono text-white p-8 md:p-12 rounded-lg border-4 border-white shadow-2xl relative"
              id="fake-error-block"
            >
              {/* Cute BSOD representation */}
              <div className="flex items-start gap-4 mb-8">
                <AlertTriangle className="w-16 h-16 text-yellow-300 shrink-0 animate-pulse" />
                <div>
                  <h1 className="text-xl md:text-3xl font-black tracking-tight mb-2 uppercase text-yellow-300 leading-none">
                    FATAL SYSTEM EXCEPTION
                  </h1>
                  <p className="text-[11px] text-blue-200">
                    Ocorreu um erro catastrófico no renderizador emocional.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs md:text-sm text-blue-100 leading-relaxed py-4 border-y border-white/10 mb-8 font-mono">
                <p>*** EXCEPTION CODE: 0x880L1MA_LEMON_ERROR_CRASH ***</p>
                <p>&gt; O feedback de limão colapsou nossa largura de banda afetiva.</p>
                <p>&gt; Memória alocada na pilha do amor estourou o limite máximo.</p>
                <p>&gt; Todos os pixels da tela foram transformados em azedos e corrompidos.</p>
                <p className="text-yellow-300 font-bold">Por favor, clique no botão abaixo para tentar recarregar os dados do site.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="text-[10px] text-blue-300 font-mono italic">
                  Recarregando, o sistema tentará autorrecuperação...
                </div>
                <button
                  type="button"
                  onClick={handleReload}
                  className="px-6 py-4 bg-white text-blue-800 font-black tracking-widest text-xs uppercase rounded-none hover:bg-yellow-300 hover:text-slate-900 transition-all flex items-center gap-2 border-2 border-transparent active:scale-95 cursor-pointer shadow-lg animate-pulse"
                  id="reload-fake-btn"
                >
                  <RefreshCw className="w-4 h-4 shrink-0" /> Recarregar Página
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: JUMPSCARE */}
          {step === 'jumpscare' && (
            <motion.div
              key="jumpscare"
              initial={{ scale: 3, opacity: 0 }}
              animate={{ 
                scale: [1.2, 1.3, 1.25, 1.35, 1.25], 
                opacity: 1,
                rotate: [0, 4, -4, 3, -3, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.15,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="fixed inset-0 bg-red-950 flex flex-col items-center justify-center z-[9999] overflow-hidden cursor-crosshair"
              id="jumpscare-overlay"
            >
              {/* scary flashing background colors */}
              <div className="absolute inset-0 bg-black animate-flash-extreme" />

              {/* Glowing Heart Health Bar of the Monster */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 md:w-96 z-50 bg-slate-950/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-red-500/30 shadow-2xl">
                <div className="flex justify-between items-center text-xs font-mono tracking-wider text-pink-400 mb-1.5 font-bold">
                  <span className="flex items-center gap-1.5">👿 VIDA DO MONSTRO:</span>
                  <span>{monsterHealth > 0 ? `${monsterHealth}% HP` : "DERROTADO! 🎉"}</span>
                </div>
                <div className="h-3.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-red-500/20">
                  <motion.div 
                    animate={{ width: `${monsterHealth}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                    className="h-full bg-gradient-to-r from-red-600 via-pink-500 to-rose-400 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-slate-300 font-mono tracking-wide text-center mt-2 uppercase animate-pulse">
                  💖 toque/clique em qualquer lugar para atacar! 💖
                </p>
              </div>

              {/* Shaking demon SVG monster face drawn entirely inline */}
              <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center px-4">
                {monsterHealth > 0 ? (
                  <motion.div
                    animate={{ 
                      scale: [monsterScale, monsterScale * 1.04, monsterScale],
                    }}
                    transition={{ repeat: Infinity, duration: 0.12 }}
                    style={{ 
                      filter: isMonsterHurt ? 'brightness(1.8) saturate(2.2) drop-shadow(0 0 35px rgba(239,68,68,1))' : 'none' 
                    }}
                    className="transition-all duration-75"
                  >
                    <svg viewBox="0 0 400 400" className="w-72 h-72 md:w-80 md:h-80 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                      {/* Burning custom eye background */}
                      <circle cx="120" cy="160" r="28" fill="#ff0000" className="animate-pulse" />
                      <ellipse cx="120" cy="160" rx="10" ry="16" fill="#ffffff" />
                      
                      <circle cx="280" cy="160" r="28" fill="#ff0000" className="animate-pulse" />
                      <ellipse cx="280" cy="160" rx="10" ry="16" fill="#ffffff" />

                      {/* Pupils */}
                      <circle cx="120" cy="160" r="5" fill="#000000" />
                      <circle cx="280" cy="160" r="5" fill="#000000" />

                      {/* Eyebrows */}
                      <path d="M70 120 L160 145" stroke="#ff0000" strokeWidth="12" strokeLinecap="round" />
                      <path d="M330 120 L240 145" stroke="#ff0000" strokeWidth="12" strokeLinecap="round" />

                      <polygon points="200,180 180,240 220,240" fill="#220000" stroke="#f43f5e" strokeWidth="4" />

                      <path d="M80 280 Q200 380 320 280 Z" fill="#000000" stroke="#ff0000" strokeWidth="8" />
                      
                      <polygon points="120,282 140,320 160,284" fill="#ffffff" />
                      <polygon points="170,285 200,340 230,285" fill="#ffffff" />
                      <polygon points="240,284 260,320 280,282" fill="#ffffff" />
                      
                      <polygon points="140,325 160,296 180,325" fill="#ffffff" />
                      <polygon points="220,325 240,296 260,325" fill="#ffffff" />

                      <line x1="50" y1="50" x2="100" y2="80" stroke="#ff0000" strokeWidth="3" />
                      <line x1="350" y1="50" x2="300" y2="90" stroke="#ff0000" strokeWidth="3" />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.3, rotate: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.4, 1.2], rotate: 720, opacity: 1 }}
                    className="text-8xl my-12"
                  >
                    💥💖✨
                  </motion.div>
                )}

                <h1 className="text-red-500 font-mono font-extrabold text-4xl md:text-5xl tracking-widest uppercase animate-pulse mt-6 filter drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                  {monsterHealth > 0 ? "BUUUUUUUUU!" : "Venceu! 🎉"}
                </h1>
                <p className="text-white font-mono text-xs md:text-sm uppercase mt-2 opacity-80">
                  {monsterHealth > 0 ? "COMO SE ATREVE??? ATAQUE-O COM CORAÇÕES!" : "Você purificou o monstro do limão com o amor!"}
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 8: FINAL (Middle finger / Crying-laughing / Message) */}
          {step === 'final' && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-xl bg-slate-950/80 border-2 border-pink-500/30 p-8 md:p-12 rounded-3xl shadow-2xl text-center relative overflow-hidden"
              id="final-panel"
            >
              {/* Back ambient colorful balls */}
              <div className="absolute top-[-10%] left-[-10%] w-44 h-44 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-44 h-44 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />

              {/* Congratulations header and interactive middle finger */}
              <div className="mb-6 flex flex-col items-center justify-center gap-3">
                <div className="text-[10px] sm:text-xs uppercase tracking-widest text-green-400 font-extrabold bg-green-500/10 px-4 py-2 border border-green-500/20 rounded-full mb-2 shadow-inner inline-flex items-center gap-1.5 animate-bounce">
                  🏆 PARABÉNS! Você derrotou o monstro! 🎉💖
                </div>

                <div 
                  className="relative cursor-pointer py-2 px-6 bg-white/[0.02] border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/5 rounded-3xl transition-all duration-300 shadow-md flex flex-col items-center gap-2" 
                  onClick={() => setFlippedEmoji(!flippedEmoji)}
                  id="interactive-emoji-box"
                >
                  <AnimatePresence mode="wait">
                    {!flippedEmoji ? (
                      <motion.div
                        key="middle-finger"
                        initial={{ rotateY: 180, scale: 0.9 }}
                        animate={{ rotateY: 0, scale: 1 }}
                        exit={{ rotateY: -180, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="text-8xl select-none filter drop-shadow-[0_4px_8px_rgba(255,255,255,0.1)]"
                      >
                        🖕
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cute-hearts"
                        initial={{ rotateY: -180, scale: 0.9 }}
                        animate={{ rotateY: 0, scale: [1, 1.25, 1.1] }}
                        exit={{ rotateY: 180, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="text-8xl select-none filter drop-shadow-[0_4px_15px_rgba(236,72,153,0.4)]"
                      >
                        🥰✨💖
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-semibold">
                    {!flippedEmoji ? "👉 Dê um peteleco no dedo do meio!" : "💙 Ele virou puro carinho! 🥰"}
                  </span>
                </div>

                <motion.div
                  animate={{ 
                    y: [0, -6, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="text-6xl"
                >
                  😂
                </motion.div>
              </div>

              {/* Laugh lines */}
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-pink-400 mb-4 tracking-wide text-glow">
                {!flippedEmoji ? "Pego de surpresa! kkkkkk" : "Surpresa de Verdade! ❤️"}
              </h1>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-8">
                {!flippedEmoji 
                  ? "Tinha que ter um sustinho de leve pra compensar a poesia né?! 🤫 Espero que essa pequena jornada tenha colocado um lindo sorriso no seu rosto hoje!"
                  : "Brincadeiras à parte! Aquele monstrinho assustador não tinha nenhuma chance contra o poder dos seus cliques românticos kkkk! Obrigado por entrar no jogo!"
                }
              </p>

              {/* Heart letter divider */}
              <div className="flex justify-center items-center gap-2 mb-8 text-pink-500">
                <div className="h-[1px] w-12 bg-pink-500/20" />
                <Heart className="w-5 h-5 fill-pink-500 animate-ping" />
                <div className="h-[1px] w-12 bg-pink-500/20" />
              </div>

              {/* Sweet final letter */}
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl text-slate-300 text-sm text-left italic leading-relaxed font-light font-serif">
                "Brincadeiras e sustos à parte... Obrigado por ser essa Flor incrível e iluminar os dias comuns com tanto carinho. Que a nossa sintonia (e as nossas cores!) continue brilhando sob qualquer lua. Você é uma pessoa incrivelmente especial. ❤️ 🪷"
              </div>

              {/* Reset to make it interactive/playable again */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setStep('start');
                    setKeywordInput('');
                    setSelectedNumber(null);
                    setColorsOpinion(null);
                    setRunawayCount(0);
                    setRunawaySuccess(false);
                    setQuizAnswer(null);
                    setQuizFeedback(null);
                    setFlippedEmoji(false);
                  }}
                  className="px-6 py-3 border border-white/10 text-[10px] uppercase tracking-widest font-bold font-mono text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
                >
                  Jogar Novamente 🔄
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md mx-auto text-center text-[10px] font-mono tracking-widest text-slate-600 pointer-events-none uppercase">
        feito com carinho &copy; {new Date().getFullYear()} / todos os direitos reservados
      </footer>
    </div>
  );
}
