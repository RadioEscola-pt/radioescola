import React from 'react';

interface ExamTimerProps {
  timeLeft: number; // seconds
}

const ExamTimer: React.FC<ExamTimerProps> = ({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <div className="font-mono text-lg p-2 bg-gray-100 dark:bg-slate-800 dark:text-white rounded mb-4">
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default ExamTimer;
