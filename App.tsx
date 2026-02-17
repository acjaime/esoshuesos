
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppView, GameState } from './types.ts';
import { ANIMALS_LIST, TIMER_DURATION, HINT_THRESHOLD } from './constants.ts';
import { generateAnimalImages } from './services/geminiService.ts';
import Button from './components/Button.tsx';
import Icon from './components/Icon.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [gameState, setGameState] = useState<GameState>({
    currentIndex: 0,
    isRevealed: false,
    score: 0,
    loading: false,
    error: null,
    skeletonUrl: null,
    animalUrl: null,
    timeLeft: TIMER_DURATION,
  });

  const timerRef = useRef<number | null>(null);

  const startLevel = useCallback(async (index: number) => {
    setGameState(prev => ({
      ...prev,
      currentIndex: index,
      loading: true,
      error: null,
      skeletonUrl: null,
      animalUrl: null,
      isRevealed: false,
      timeLeft: TIMER_DURATION
    }));

    try {
      const animal = ANIMALS_LIST[index];
      const urls = await generateAnimalImages(animal.name);
      setGameState(prev => ({
        ...prev,
        loading: false,
        skeletonUrl: urls.skeleton,
        animalUrl: urls.living,
      }));
    } catch (err: any) {
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: err.message || "¡Uy! Hubo un problema con los Rayos X."
      }));
    }
  }, []);

  useEffect(() => {
    if (view === 'game') {
      startLevel(gameState.currentIndex);
    }
  }, [view, startLevel]);

  useEffect(() => {
    if (view === 'game' && !gameState.loading && !gameState.isRevealed && gameState.timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeLeft: 0, isRevealed: true };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, gameState.loading, gameState.isRevealed, gameState.timeLeft]);

  const handleReveal = (guessedCorrect: boolean) => {
    if (gameState.isRevealed) return;
    setGameState(prev => ({
      ...prev,
      isRevealed: true,
      score: guessedCorrect ? prev.score + 1 : prev.score
    }));
  };

  const handleNext = () => {
    if (gameState.currentIndex < ANIMALS_LIST.length - 1) {
      startLevel(gameState.currentIndex + 1);
    } else {
      setView('gameover');
    }
  };

  const currentAnimal = ANIMALS_LIST[gameState.currentIndex];

  if (view === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0FDFA]">
        <div className="max-w-4xl w-full text-center space-y-12 bg-white p-16 bubbly-card border-[12px] border-emerald-100 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-100 rounded-full opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-100 rounded-full opacity-50"></div>
          
          <div className="relative space-y-6">
            <h1 className="text-6xl md:text-8xl font-black text-emerald-500 leading-tight drop-shadow-sm">
              ¿DE QUIÉN SON<br/>
              <span className="text-rose-400">ESTOS HUESOS?</span>
            </h1>
            <p className="text-2xl md:text-3xl text-sky-400 font-bold tracking-wide uppercase">
              🩺 ¡BIENVENIDO A LA CLÍNICA ANIMAL! 🩺
            </p>
          </div>

          <div className="flex justify-center gap-12 py-4 relative">
            <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center animate-soft shadow-inner">
              <Icon name="stethoscope" className="w-20 h-20" />
            </div>
            <div className="w-32 h-32 bg-rose-50 rounded-[3rem] flex items-center justify-center animate-bounce shadow-inner">
              <Icon name="heart" className="w-20 h-20" />
            </div>
            <div className="w-32 h-32 bg-sky-50 rounded-[3rem] flex items-center justify-center animate-soft shadow-inner" style={{animationDelay: '1s'}}>
              <Icon name="bone" className="w-20 h-20" />
            </div>
          </div>

          <div className="relative z-10">
            <Button size="xl" variant="success" onClick={() => setView('game')} className="rounded-full shadow-lg">
              ¡PASAR A CONSULTA! 🐾
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'gameover') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-emerald-400">
        <div className="max-w-2xl w-full text-center bg-white p-16 rounded-[4rem] shadow-2xl space-y-10 border-[12px] border-emerald-100">
          <div className="relative inline-block">
            <Icon name="trophy" className="w-40 h-40 mx-auto animate-bounce" />
          </div>
          <h2 className="text-6xl font-black text-slate-900 leading-tight">¡DOCTOR/A,<br/>ERES GENIAL!</h2>
          <div className="space-y-2">
            <p className="text-7xl font-black text-emerald-500">
              {gameState.score} / {ANIMALS_LIST.length}
            </p>
            <p className="text-2xl text-sky-400 font-black uppercase">¡Todos los animalitos están felices!</p>
          </div>
          <Button size="lg" variant="yellow" onClick={() => {
            setGameState(prev => ({ ...prev, currentIndex: 0, score: 0 }));
            setView('landing');
          }} className="rounded-full">
            ¡OTRA VEZ! 🏠
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50 p-4 md:p-8">
      {/* Top Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between mb-8">
        <Button variant="secondary" size="sm" onClick={() => setView('landing')} className="rounded-full border-none shadow-md">
          <Icon name="home" className="w-8 h-8" />
        </Button>

        <div className="bg-white px-10 py-3 rounded-full shadow-md border-4 border-emerald-100">
          <span className="text-emerald-500 font-black text-2xl">
            Paciente {gameState.currentIndex + 1} 🏥
          </span>
        </div>

        <div className={`w-20 h-20 flex items-center justify-center rounded-full border-[6px] shadow-lg text-4xl font-black transition-colors ${gameState.timeLeft <= 10 ? 'bg-rose-50 border-rose-400 text-rose-500 animate-pulse' : 'bg-white border-emerald-200 text-emerald-400'}`}>
          {gameState.timeLeft}
        </div>
      </div>

      {/* Main Examination Room */}
      <div className="flex-1 w-full max-w-6xl mx-auto relative bg-white bubbly-card overflow-hidden flex flex-col items-center justify-center p-8 border-[16px] border-white min-h-[500px]">
        {gameState.loading ? (
          <div className="text-center space-y-8">
            <div className="relative inline-block">
              <Icon name="loader" className="w-32 h-32 text-emerald-300 animate-spin mx-auto" />
            </div>
            <p className="text-4xl font-black text-emerald-400 animate-pulse uppercase">Cargando Rayos X... 📸</p>
          </div>
        ) : gameState.error ? (
          <div className="text-center space-y-8 max-w-md">
            <Icon name="alert" className="w-32 h-32 mx-auto" />
            <p className="text-3xl font-black text-slate-700 leading-tight">{gameState.error}</p>
            <Button size="lg" variant="primary" onClick={() => startLevel(gameState.currentIndex)} className="rounded-full">
              REINTENTAR 🔄
            </Button>
          </div>
        ) : (
          <div className="w-full h-full relative flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center flex-1">
              {gameState.skeletonUrl && (
                <img 
                  src={gameState.skeletonUrl} 
                  alt="Rayos X" 
                  className={`max-h-full max-w-full object-contain transition-all duration-1000 ${gameState.isRevealed ? 'opacity-5 grayscale blur-sm' : 'opacity-100'}`}
                />
              )}
              {gameState.animalUrl && (
                <img 
                  src={gameState.animalUrl} 
                  alt="Animalito Sano" 
                  className={`absolute max-h-full max-w-full object-contain transition-all duration-1000 ${gameState.isRevealed ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-12 pointer-events-none'}`}
                />
              )}
            </div>

            {gameState.timeLeft <= HINT_THRESHOLD && !gameState.isRevealed && (
              <div className="absolute top-0 bg-sky-50 border-4 border-sky-100 text-sky-700 px-8 py-5 rounded-[3rem] shadow-xl flex items-center gap-4 animate-soft max-w-xl text-center">
                <Icon name="info" className="w-12 h-12 shrink-0" />
                <span className="font-black text-2xl leading-tight">{currentAnimal.hint}</span>
              </div>
            )}

            {gameState.isRevealed && (
              <div className="mt-8 bg-emerald-500 text-white px-12 py-6 rounded-full text-5xl font-black shadow-2xl animate-bounce border-b-[12px] border-emerald-700">
                ¡ES UN {currentAnimal.name}! ✨
              </div>
            )}
          </div>
        )}
      </div>

      {/* Veterinarian Controls */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-3 gap-8 mt-10">
        <Button 
          variant="secondary" 
          size="lg" 
          disabled={gameState.currentIndex === 0 || gameState.loading}
          onClick={() => startLevel(gameState.currentIndex - 1)}
          className="rounded-full border-b-[10px]"
        >
          <Icon name="chevron-left" className="w-12 h-12" />
        </Button>

        <Button 
          size="xl" 
          variant={gameState.isRevealed ? 'success' : 'yellow'}
          disabled={gameState.loading || gameState.isRevealed}
          onClick={() => handleReveal(true)}
          className="rounded-full border-b-[12px] text-4xl"
        >
          {gameState.isRevealed ? '¡SÍ!' : <span className="flex items-center gap-3">¡LO SÉ! <Icon name="stethoscope" className="w-12 h-12" /></span>}
        </Button>

        <Button 
          variant={gameState.isRevealed ? 'primary' : 'secondary'} 
          size="lg" 
          disabled={gameState.loading || !gameState.isRevealed}
          onClick={handleNext}
          className="rounded-full border-b-[10px]"
        >
          {gameState.currentIndex === ANIMALS_LIST.length - 1 ? '¡FIN! 🏆' : <Icon name="chevron-right" className="w-12 h-12" />}
        </Button>
      </div>

      {/* Medicine Progress Bar */}
      <div className="w-full max-w-6xl mx-auto mt-10 bg-white h-10 rounded-full overflow-hidden shadow-inner border-4 border-emerald-100 p-1">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-rose-400 rounded-full transition-all duration-700 relative" 
          style={{ width: `${((gameState.currentIndex + (gameState.isRevealed ? 1 : 0)) / ANIMALS_LIST.length) * 100}%` }}
        >
          <div className="absolute right-0 top-0 w-8 h-full flex items-center justify-center">
            <Icon name="heart" className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
