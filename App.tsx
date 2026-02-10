
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppView, GameState } from './types';
import { ANIMALS_LIST, TIMER_DURATION, HINT_THRESHOLD } from './constants';
import { generateAnimalImages } from './services/geminiService';
import Button from './components/Button';
import Icon from './components/Icon';

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
        error: "¡Oh no! No pudimos encontrar al animalito. ¿Probamos otra vez?"
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FFFBEB]">
        <div className="max-w-4xl w-full text-center space-y-12 bg-white p-16 rounded-[4rem] border-[12px] border-yellow-200 shadow-xl">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black text-sky-500 leading-tight drop-shadow-sm">
              ¿DE QUIÉN SON<br/>
              <span className="text-rose-400">ESTOS HUESOS?</span>
            </h1>
            <p className="text-2xl md:text-3xl text-amber-500 font-bold tracking-wide uppercase">
              ¡Conviértete en un gran biólogo! 🩺
            </p>
          </div>

          <div className="flex justify-center gap-12 py-4">
            <div className="w-32 h-32 bg-sky-100 rounded-[3rem] flex items-center justify-center text-sky-500 animate-float">
              <Icon name="bone" className="w-16 h-16" />
            </div>
            <div className="w-32 h-32 bg-rose-100 rounded-[3rem] flex items-center justify-center text-rose-500 animate-bounce">
              <Icon name="heart" className="w-16 h-16" />
            </div>
            <div className="w-32 h-32 bg-emerald-100 rounded-[3rem] flex items-center justify-center text-emerald-500 animate-float" style={{animationDelay: '1s'}}>
              <Icon name="stethoscope" className="w-16 h-16" />
            </div>
          </div>

          <Button size="xl" variant="yellow" onClick={() => setView('game')}>
            ¡A JUGAR! 🐾
          </Button>

          <p className="text-slate-400 font-bold tracking-widest uppercase text-xl">
            15 AMIGUITOS POR CONOCER
          </p>
        </div>
      </div>
    );
  }

  if (view === 'gameover') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-sky-400">
        <div className="max-w-2xl w-full text-center bg-white p-16 rounded-[4rem] shadow-2xl space-y-10 border-[12px] border-sky-100">
          <Icon name="trophy" className="w-40 h-40 text-yellow-400 mx-auto animate-bounce" />
          <h2 className="text-6xl font-black text-slate-900">¡ERES GENIAL!</h2>
          <div className="space-y-2">
            <p className="text-7xl font-black text-sky-500">
              {gameState.score} / {ANIMALS_LIST.length}
            </p>
            <p className="text-2xl text-amber-500 font-black uppercase">¡Qué gran corazón tienes!</p>
          </div>
          <Button size="lg" variant="yellow" onClick={() => {
            setGameState(prev => ({ ...prev, currentIndex: 0, score: 0 }));
            setView('landing');
          }}>
            ¡OTRA VEZ! 🏠
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 p-4 md:p-8">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between mb-8">
        <Button variant="secondary" size="sm" onClick={() => setView('landing')} className="rounded-full">
          <Icon name="home" />
        </Button>

        <div className="bg-white px-10 py-3 rounded-full shadow-md border-4 border-sky-200">
          <span className="text-sky-400 font-black text-2xl">
            Animalito {gameState.currentIndex + 1} de {ANIMALS_LIST.length}
          </span>
        </div>

        <div className={`w-20 h-20 flex items-center justify-center rounded-full border-[6px] shadow-lg text-4xl font-black transition-colors ${gameState.timeLeft <= 10 ? 'bg-rose-50 border-rose-400 text-rose-500 animate-pulse' : 'bg-white border-sky-200 text-sky-400'}`}>
          {gameState.timeLeft}
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto relative bg-white rounded-[4rem] shadow-xl overflow-hidden flex flex-col items-center justify-center p-8 border-[16px] border-white">
        {gameState.loading ? (
          <div className="text-center space-y-8">
            <Icon name="loader" className="w-32 h-32 text-sky-400 animate-spin mx-auto" />
            <p className="text-4xl font-black text-sky-500 animate-pulse">¿QUIÉN SERÁ?... 🧐</p>
          </div>
        ) : gameState.error ? (
          <div className="text-center space-y-8 max-w-md">
            <Icon name="alert" className="w-32 h-32 text-rose-400 mx-auto" />
            <p className="text-3xl font-black text-slate-800">{gameState.error}</p>
            <Button size="lg" onClick={() => startLevel(gameState.currentIndex)}>
              INTENTAR DE NUEVO 🔄
            </Button>
          </div>
        ) : (
          <div className="w-full h-full relative flex flex-col items-center justify-center">
            {/* Images */}
            <div className="relative w-full h-full flex items-center justify-center min-h-[50vh]">
              {gameState.skeletonUrl && (
                <img 
                  src={gameState.skeletonUrl} 
                  alt="Esqueleto" 
                  className={`absolute max-h-full max-w-full object-contain transition-all duration-1000 ${gameState.isRevealed ? 'opacity-10 grayscale scale-90' : 'opacity-100 scale-100'}`}
                />
              )}
              {gameState.animalUrl && (
                <img 
                  src={gameState.animalUrl} 
                  alt="Animal" 
                  className={`absolute max-h-full max-w-full object-contain transition-all duration-1000 ${gameState.isRevealed ? 'opacity-100 scale-110' : 'opacity-0 scale-75 pointer-events-none'}`}
                />
              )}
            </div>

            {/* Hint Overlay */}
            {gameState.timeLeft <= HINT_THRESHOLD && !gameState.isRevealed && (
              <div className="absolute top-0 bg-yellow-50 border-4 border-yellow-200 text-amber-700 px-8 py-5 rounded-[2rem] shadow-lg flex items-center gap-4 animate-bounce max-w-xl text-center">
                <Icon name="info" className="w-10 h-10 shrink-0 text-yellow-500" />
                <span className="font-black text-2xl">{currentAnimal.hint}</span>
              </div>
            )}

            {/* Reveal Label */}
            {gameState.isRevealed && (
              <div className="mt-8 bg-sky-500 text-white px-12 py-6 rounded-full text-5xl font-black shadow-2xl animate-bounce border-b-[10px] border-sky-700">
                ¡ES UN {currentAnimal.name}! ✨
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-3 gap-8 mt-10">
        <Button 
          variant="secondary" 
          size="lg" 
          disabled={gameState.currentIndex === 0 || gameState.loading}
          onClick={() => startLevel(gameState.currentIndex - 1)}
          className="rounded-[3rem]"
        >
          <Icon name="chevron-left" className="w-10 h-10" />
        </Button>

        <Button 
          size="xl" 
          variant={gameState.isRevealed ? 'success' : 'yellow'}
          disabled={gameState.loading || gameState.isRevealed}
          onClick={() => handleReveal(true)}
          className="rounded-[3rem]"
        >
          {gameState.isRevealed ? '¡SÍÍÍ!' : '¡LO SÉ! 🤩'}
        </Button>

        <Button 
          variant={gameState.isRevealed ? 'primary' : 'secondary'} 
          size="lg" 
          disabled={gameState.loading || !gameState.isRevealed}
          onClick={handleNext}
          className="rounded-[3rem]"
        >
          {gameState.currentIndex === ANIMALS_LIST.length - 1 ? '¡FIN! 🏆' : <Icon name="chevron-right" className="w-10 h-10" />}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-6xl mx-auto mt-10 bg-white h-8 rounded-full overflow-hidden shadow-inner border-4 border-white">
        <div 
          className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700" 
          style={{ width: `${((gameState.currentIndex + (gameState.isRevealed ? 1 : 0)) / ANIMALS_LIST.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default App;
