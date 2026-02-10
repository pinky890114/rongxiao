import React from 'react';
import { CommissionStatus } from '../types';
import { STATUS_STEPS } from '../constants';

interface ProgressBarProps {
  currentStatus: CommissionStatus;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStatus }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="w-full mt-6 mb-2 px-4">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-stone-200 rounded-full -z-0"></div>
        
        {/* Active Line (Pink) */}
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 bg-[#E7C2BB] rounded-full transition-all duration-500 -z-0"
            style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        ></div>

        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex flex-col items-center relative z-10 group cursor-default">
              
              {/* Dot Container */}
              <div className="relative flex items-center justify-center">
                
                {/* Glowing Effect for Current Status */}
                {isCurrent && (
                    <div className="absolute w-8 h-8 bg-[#E7C2BB]/40 rounded-full animate-ping opacity-75"></div>
                )}
                
                {/* Main Dot */}
                <div 
                  className={`
                    w-4 h-4 rounded-full transition-all duration-300 shadow-sm border-2
                    ${isCompleted ? 'bg-[#E7C2BB] border-[#E7C2BB]' : 'bg-white border-stone-300'}
                    ${isCurrent ? 'scale-125 ring-4 ring-[#E7C2BB]/30' : ''}
                  `}
                >
                </div>
              </div>

              {/* Label */}
              <span className={`
                absolute top-6 text-[10px] md:text-xs font-bold tracking-wide transition-colors duration-300 whitespace-nowrap bg-stone-50/80 px-1.5 py-0.5 rounded-md backdrop-blur-sm
                ${isCurrent ? 'text-[#8d6e63] -translate-y-1' : isCompleted ? 'text-stone-500' : 'text-stone-300'}
              `}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};