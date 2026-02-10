import React, { useState } from 'react';
import { Commission, CommissionStatus } from '../types';
import { ProgressBar } from './ProgressBar';
import { STATUS_STEPS } from '../constants';
import { AdminTools } from './AdminTools';
import { 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  DollarSign, 
  Sparkles,
  Palette,
  Image as ImageIcon
} from 'lucide-react';

interface CommissionCardProps {
  commission: Commission;
  isAdmin: boolean;
  onUpdateStatus: (id: string, newStatus: CommissionStatus) => void;
  onDelete: (id: string) => void;
}

export const CommissionCard: React.FC<CommissionCardProps> = ({ 
  commission, 
  isAdmin, 
  onUpdateStatus,
  onDelete 
}) => {
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Updated Status Colors for Cute Theme (#E7C2BB)
  const getStatusColor = (status: CommissionStatus) => {
    switch(status) {
      case CommissionStatus.NOT_STARTED: return 'bg-stone-100 text-stone-500 border-stone-200';
      case CommissionStatus.IN_PROGRESS: return 'bg-[#fff0ed] text-[#8d6e63] border-[#E7C2BB]/50';
      case CommissionStatus.REVISION: return 'bg-[#fff5f5] text-red-400 border-red-100';
      case CommissionStatus.COMPLETED: return 'bg-[#E7C2BB] text-stone-700 border-[#E7C2BB]';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const handleNextStep = () => {
    const currentIndex = STATUS_STEPS.indexOf(commission.status);
    if (currentIndex < STATUS_STEPS.length - 1) {
      onUpdateStatus(commission.id, STATUS_STEPS[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STATUS_STEPS.indexOf(commission.status);
    if (currentIndex > 0) {
      onUpdateStatus(commission.id, STATUS_STEPS[currentIndex - 1]);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isDeleting) {
          onDelete(commission.id);
      } else {
          setIsDeleting(true);
          // Optional: Auto reset after 3 seconds if not confirmed
          setTimeout(() => setIsDeleting(false), 3000);
      }
  };

  return (
    <>
    <div className="bg-white border-2 border-stone-100 rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
      
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(commission.status)}`}>
                    {commission.status}
                  </span>
                  
                  {/* Artist Tag */}
                  <span className="bg-[#fff8f6] text-[#bcaaa4] border border-[#E7C2BB]/30 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Palette size={10} /> {commission.artistId}
                  </span>

                  <p className="text-[#8d6e63] text-sm font-bold tracking-wide flex items-center gap-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E7C2BB]"></span>
                    {commission.clientName}
                  </p>
              </div>
              <h3 className="text-xl font-bold text-stone-700">{commission.title}</h3>
            </div>
            
            {isAdmin && (
              <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowAdminTools(!showAdminTools)}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${showAdminTools ? 'bg-[#E7C2BB] text-stone-700 rotate-12 scale-110' : 'bg-stone-50 text-stone-400 hover:text-[#8d6e63] hover:bg-[#E7C2BB]/20 hover:scale-110'}`}
                    title="AI 小幫手"
                  >
                    <Sparkles size={20} />
                  </button>
                  
                  {/* Custom Delete Confirmation UI */}
                  <button 
                    type="button"
                    onClick={handleDeleteClick}
                    className={`p-2.5 rounded-xl transition-all duration-200 flex items-center gap-1 hover:scale-105 ${
                        isDeleting 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 w-auto px-4' 
                        : 'bg-stone-50 text-stone-400 hover:text-red-500 hover:bg-red-50 w-10'
                    }`}
                    title="刪除"
                  >
                    {isDeleting ? (
                        <>
                            <span className="text-xs font-bold whitespace-nowrap">確定?</span>
                        </>
                    ) : (
                        <Trash2 size={20} />
                    )}
                  </button>
              </div>
            )}
          </div>

          <p className="text-stone-500 text-sm leading-relaxed mb-5 font-medium whitespace-pre-wrap">
            {commission.description}
          </p>
          
          {/* Reference Images Preview */}
          {commission.referenceImages && commission.referenceImages.length > 0 && (
            <div className="mb-5">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-stone-400">
                    <ImageIcon size={12} /> 參考圖片
                </div>
                <div className="flex gap-3">
                    {commission.referenceImages.map((img, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedImage(img)}
                            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-stone-100 cursor-pointer hover:border-[#E7C2BB] transition-all hover:scale-105"
                        >
                            <img src={img} alt="Ref" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-stone-500 font-bold mb-5">
            <span className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
              <Calendar size={14} className="text-stone-400" /> {commission.dateAdded}
            </span>
            <span className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
              <DollarSign size={14} className="text-stone-400" /> {commission.price}
            </span>
            <span className="bg-[#E7C2BB]/10 px-3 py-1.5 rounded-full border border-[#E7C2BB]/20 text-[#8d6e63]">
                {commission.type}
            </span>
          </div>
        </div>

        <div className="mt-2 bg-stone-50/50 rounded-2xl p-4 border border-stone-100">
          <ProgressBar currentStatus={commission.status} />
          
          {isAdmin && (
            <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={handlePrevStep}
                  disabled={commission.status === CommissionStatus.NOT_STARTED}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-700 disabled:opacity-30 hover:bg-stone-100 rounded-full transition-all"
                >
                  <ChevronLeft size={16} /> 上一步
                </button>
                <button 
                  type="button"
                  onClick={handleNextStep}
                  disabled={commission.status === CommissionStatus.COMPLETED}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#E7C2BB] hover:bg-[#d4aeb7] text-stone-700 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#E7C2BB]/20 hover:-translate-y-0.5"
                >
                  下一步 <ChevronRight size={16} />
                </button>
            </div>
          )}
        </div>
      </div>
      
      {isAdmin && showAdminTools && (
         <AdminTools commission={commission} onClose={() => setShowAdminTools(false)} />
      )}
    </div>

    {/* Lightbox for Images */}
    {selectedImage && (
        <div 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
        >
            <div className="relative max-w-4xl max-h-full">
                <img 
                    src={selectedImage} 
                    alt="Full View" 
                    className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
                />
                 <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-12 right-0 text-white/80 hover:text-white font-bold flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full"
                 >
                    關閉 <X className="w-4 h-4" />
                 </button>
            </div>
        </div>
    )}
    </>
  );
};
// Helper X icon for lightbox
const X = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);