'use client';

import React from 'react';

const AnimatedEvaluatingBorder: React.FC = () => {
  return (
    <>
      <div
        className="min-h-[126px] absolute resize-none w-min-full inset-0 rounded-md pointer-events-none"
        style={{
          borderStyle: 'solid',
          background: 'linear-gradient(270deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6) border-box',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          backgroundClip: 'border-box',
          WebkitBackgroundClip: 'border-box',
          animation: 'ai-glow 3s linear infinite',
          backgroundSize: '1200% 1200%',
          filter: 'blur(3px)',
          boxShadow: '0 0 16px 6px rgba(139,92,246,0.3), 0 0 32px 12px rgba(59,130,246,0.15)',
        }}
      />
      <style jsx>{`
        @keyframes ai-glow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedEvaluatingBorder;