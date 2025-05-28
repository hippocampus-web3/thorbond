import React, { useEffect, useState } from 'react';

interface SlotMachineProps {
  text: string;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState<string[]>([]);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  useEffect(() => {
    const finalText = text.split('');
    const slots = finalText.map(() => '');
    setDisplayText(slots);

    const intervals = finalText.map((_, index) => {
      let iterations = 0;
      const maxIterations = 3 + index;

      return setInterval(() => {
        setDisplayText(prev => {
          const newText = [...prev];
          if (iterations < maxIterations) {
            newText[index] = characters[Math.floor(Math.random() * characters.length)];
            iterations++;
          } else {
            newText[index] = finalText[index];
            clearInterval(intervals[index]);
          }
          return newText;
        });
      }, 10 + index * 2);
    });

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [text]);

  return (
    <div className="relative">
      <div className="text-lg md:text-xl mt-2 opacity-90 font-mono bg-black/20 px-4 py-2 rounded-lg inline-block">
        <span className="text-white tracking-wider">{displayText.join('')}</span>
      </div>
    </div>
  );
};

export default SlotMachine; 