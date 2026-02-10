import React, { useState } from 'react';
import { Commission } from '../types';
import { generateClientUpdate, suggestWorkPlan } from '../services/geminiService';
import { Wand2, Send, ListTodo, X } from 'lucide-react';

interface AdminToolsProps {
  commission: Commission;
  onClose: () => void;
}

export const AdminTools: React.FC<AdminToolsProps> = ({ commission, onClose }) => {
  const [generatedText, setGeneratedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'plan'>('email');

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedText('');
    let result = '';
    
    if (activeTab === 'email') {
      result = await generateClientUpdate(commission);
    } else {
      result = await suggestWorkPlan(commission);
    }
    
    setGeneratedText(result);
    setLoading(false);
  };

  return (
    <div className="mt-6 bg-stone-50 p-5 rounded-3xl border-2 border-stone-200 relative animate-in fade-in slide-in-from-top-4 shadow-inner">
      <button 
        onClick={onClose} 
        className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 bg-white p-1 rounded-full border border-stone-200"
      >
        <X size={14} />
      </button>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'email' ? 'bg-[#E7C2BB] text-stone-700 shadow-md' : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Send size={14} /> 草擬回信
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'plan' ? 'bg-[#E7C2BB] text-stone-700 shadow-md' : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <ListTodo size={14} /> 工作建議
        </button>
      </div>

      <div className="min-h-[120px] bg-white rounded-2xl p-4 text-stone-700 text-sm whitespace-pre-wrap border-2 border-stone-200 font-medium leading-relaxed">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-20 gap-2 text-[#8d6e63]">
                <Wand2 className="animate-spin" size={24} /> 
                <span className="text-xs font-bold">正在動腦筋...</span>
            </div>
        ) : generatedText ? (
            generatedText
        ) : (
            <div className="flex flex-col items-center justify-center h-20 text-stone-400 gap-1">
                 <Wand2 size={20} className="text-stone-300" />
                 <span className="text-xs">AI 小幫手隨時待命！</span>
            </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#E7C2BB] to-[#dcb0a8] hover:from-[#dcb0a8] hover:to-[#cfa69f] text-stone-700 rounded-full text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-[#E7C2BB]/20 hover:-translate-y-0.5 active:scale-95"
        >
            <Wand2 size={16} /> {loading ? '思考中...' : '生成內容'}
        </button>
      </div>
    </div>
  );
};