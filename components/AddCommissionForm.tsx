import React, { useState } from 'react';
import { Commission, CommissionStatus } from '../types';
import { Plus, X, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

interface AddCommissionFormProps {
  onAdd: (c: Commission) => void;
  onCancel: () => void;
}

export const AddCommissionForm: React.FC<AddCommissionFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Commission>>({
    clientName: '',
    title: '',
    description: '',
    type: '一般文字委託',
    price: 0,
    status: CommissionStatus.NOT_STARTED,
  });
  
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // Helper function to compress image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Resize to max 800px
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Compress to JPEG with 0.7 quality to save space
             const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
             resolve(dataUrl);
          } else {
             reject(new Error("Canvas context is null"));
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 3 - referenceImages.length;
      
      if (files.length > remainingSlots) {
        alert(`您最多只能再上傳 ${remainingSlots} 張圖片喔！`);
        return;
      }

      setIsCompressing(true);
      Promise.all(files.map(file => compressImage(file)))
        .then(compressedImages => {
             setReferenceImages(prev => [...prev, ...compressedImages]);
        })
        .catch(err => {
            console.error("Image compression failed", err);
            alert("圖片處理失敗，請試著上傳較小的圖片。");
        })
        .finally(() => {
            setIsCompressing(false);
        });
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompressing) return; // Prevent submit while processing

    const newCommission: Commission = {
      id: `c-${Date.now()}`,
      artistId: '', // Will be filled by parent
      clientName: formData.clientName || '匿名委託人',
      title: formData.title || '未命名委託',
      description: formData.description || '',
      referenceImages: referenceImages,
      type: formData.type as any,
      price: Number(formData.price),
      status: formData.status as CommissionStatus,
      dateAdded: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      thumbnailUrl: ''
    };
    onAdd(newCommission);
  };

  return (
    <div className="bg-white border-2 border-[#E7C2BB]/20 rounded-3xl p-8 mb-10 animate-in fade-in zoom-in-95 duration-200 shadow-xl shadow-[#E7C2BB]/10">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-stone-100">
        <h3 className="text-xl font-bold text-[#8d6e63] flex items-center gap-3">
            <div className="bg-[#E7C2BB]/30 p-2 rounded-xl text-[#8d6e63]">
                <Plus size={24} /> 
            </div>
            新增文字委託
        </h3>
        <button onClick={onCancel} className="bg-stone-100 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors">
            <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Basic Info */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">委託人名稱 (ID)</label>
            <input 
              required
              type="text" 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#E7C2BB]/10 focus:border-[#E7C2BB] focus:outline-none font-medium transition-all"
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              placeholder="例如: StoryLover99"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">委託項目標題</label>
            <input 
              required
              type="text" 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#E7C2BB]/10 focus:border-[#E7C2BB] focus:outline-none font-medium transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="例如: 原創小說 - 楔子"
            />
          </div>
           <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">委託類型</label>
            <div className="relative">
                <select 
                className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#E7C2BB]/10 focus:border-[#E7C2BB] focus:outline-none font-medium appearance-none cursor-pointer transition-all"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                    <option value="一般文字委託">一般文字委託</option>
                    <option value="驚喜包">驚喜包</option>
                    <option value="意識流">意識流</option>
                    <option value="R18">R18</option>
                    <option value="擦邊">擦邊</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    ▼
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Price */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">價格 (NTD/USD)</label>
            <input 
              type="number" 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#E7C2BB]/10 focus:border-[#E7C2BB] focus:outline-none font-medium transition-all"
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>
           <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">初始狀態</label>
            <div className="relative">
                <select 
                className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#E7C2BB]/10 focus:border-[#E7C2BB] focus:outline-none font-medium appearance-none cursor-pointer transition-all"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                {Object.values(CommissionStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    ▼
                </div>
            </div>
          </div>
          {/* Spacer to align height if needed, or leave blank */}
        </div>

        {/* Full Width Section: Images & Description */}
        <div className="md:col-span-2 space-y-6 pt-2 border-t border-stone-100">
            
            {/* Image Upload Section */}
            <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">
                    參考資料 (角色圖/世界觀設定)
                </label>
                <div className="space-y-4">
                    {/* Previews */}
                    {referenceImages.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {referenceImages.map((img, index) => (
                                <div key={index} className="relative group flex-shrink-0">
                                    <img 
                                        src={img} 
                                        alt={`Reference ${index + 1}`} 
                                        className="w-24 h-24 object-cover rounded-xl border-2 border-stone-200 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Upload Button */}
                    {referenceImages.length < 3 && (
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                disabled={isCompressing}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                            />
                            <div className={`w-full border-2 border-dashed border-stone-300 rounded-2xl p-6 flex flex-col items-center justify-center text-stone-400 transition-all gap-2 ${isCompressing ? 'opacity-50 bg-stone-50' : 'hover:bg-stone-50 hover:border-[#E7C2BB]/50 hover:text-[#E7C2BB]'}`}>
                                <div className="bg-stone-100 p-3 rounded-full group-hover:bg-[#E7C2BB]/20">
                                    <Upload size={24} />
                                </div>
                                <span className="text-sm font-bold">{isCompressing ? '處理中...' : '點擊或拖曳上傳圖片'}</span>
                                <span className="text-xs">上傳角色圖或設定集 (自動壓縮)</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Description Section */}
            <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">
                    詳細需求描述 (文章大綱/風格/字數要求)
                </label>
                <textarea 
                className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 focus:ring-4 focus:ring-[#E7C2BB]/10 focus:border-[#E7C2BB] focus:outline-none h-48 font-medium transition-all leading-relaxed"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="請詳細描述故事大綱、世界觀、角色性格、希望的文風、預計字數..."
                />
            </div>
        </div>
        
        <div className="md:col-span-2 pt-4 flex justify-end">
            <button 
                type="submit"
                disabled={isCompressing}
                className="bg-[#E7C2BB] hover:bg-[#d4aeb7] text-stone-700 font-bold py-3 px-10 rounded-full transition-all shadow-lg shadow-[#E7C2BB]/20 hover:-translate-y-0.5 active:scale-95 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isCompressing ? '處理中...' : '建立委託單'} <Plus size={18} strokeWidth={3} />
            </button>
        </div>
      </form>
    </div>
  );
};