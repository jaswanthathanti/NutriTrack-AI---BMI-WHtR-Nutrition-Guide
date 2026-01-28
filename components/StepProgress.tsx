
import React from 'react';
import { STEPS } from '../constants';
import { Check } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  return (
    <div className="flex items-start justify-center w-full max-w-4xl mx-auto px-4 py-8 overflow-x-auto no-scrollbar">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center flex-1 min-w-[70px]">
              <div className="relative flex items-center justify-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 z-10 ${
                    isCompleted 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : isActive 
                        ? 'bg-white border-emerald-600 text-emerald-600 scale-110 shadow-md' 
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNum}
                </div>
              </div>
              <span className={`mt-3 text-[10px] font-bold uppercase tracking-tight text-center whitespace-nowrap ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                {label.split(' ').map((word, idx) => <span key={idx} className="block leading-none mb-1">{word}</span>)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] mt-5 bg-slate-200 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-500" 
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepProgress;
