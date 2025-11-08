import React from 'react';
import { useGameStore } from '@/lib/game/store';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
const StartScreen: React.FC = () => {
  const startGame = useGameStore((s) => s.startGame);
  return (
    <div className="w-full h-full bg-sky flex flex-col items-center justify-center text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-8xl font-display font-bold mb-4 text-yellow-300" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.2)' }}>
          Pixel Hopper
        </h1>
        <p className="text-2xl mb-12">A playful platformer adventure!</p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={startGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-2xl px-12 py-8 rounded-lg shadow-lg border-4 border-white/50"
          >
            Play Game
          </Button>
        </motion.div>
      </motion.div>
      <footer className="absolute bottom-4 text-white/70 text-sm">
        Built with ❤️ at Cloudflare
      </footer>
    </div>
  );
};
const EndScreen: React.FC<{ message: string }> = ({ message }) => {
  const resetGame = useGameStore((s) => s.resetGame);
  const score = useGameStore((s) => s.score);
  return (
    <div className="absolute inset-0 w-full h-full bg-gray-800/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 z-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center bg-black/50 p-12 rounded-2xl shadow-2xl"
      >
        <h1 className="text-7xl font-display font-bold mb-4">{message}</h1>
        <p className="text-3xl mb-8">Final Score: {score}</p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl px-10 py-6 rounded-lg shadow-lg border-4 border-white/50"
          >
            Play Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
const PauseMenu: React.FC = () => {
  const togglePause = useGameStore((s) => s.togglePause);
  const resetGame = useGameStore((s) => s.resetGame);
  return (
    <div className="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 z-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h1 className="text-8xl font-display font-bold mb-12">Paused</h1>
        <div className="flex flex-col gap-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={togglePause}
              className="bg-green-500 hover:bg-green-600 text-white font-bold text-2xl px-12 py-6 rounded-lg shadow-lg border-4 border-white/50 w-64"
            >
              Resume
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl px-12 py-6 rounded-lg shadow-lg border-4 border-white/50 w-64"
            >
              Restart
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
export function HomePage() {
  const status = useGameStore((s) => s.status);
  return (
    <main className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="w-full h-full max-w-[1280px] aspect-video relative">
        {status === 'startScreen' && <StartScreen />}
        {(status === 'playing' || status === 'paused' || status === 'gameOver' || status === 'win') && <GameCanvas />}
        {status === 'paused' && <PauseMenu />}
        {status === 'gameOver' && <EndScreen message="Game Over" />}
        {status === 'win' && <EndScreen message="You Win!" />}
      </div>
    </main>
  );
}