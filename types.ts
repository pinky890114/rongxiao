export enum CommissionStatus {
  NOT_STARTED = '未開始',
  IN_PROGRESS = '進行中',
  REVISION = '待修改',
  COMPLETED = '完成'
}

export interface Commission {
  id: string;
  artistId: string; // 負責此委託的創作者
  clientName: string;
  contact?: string; // e.g., Discord handle or email
  title: string;
  description: string;
  referenceImages?: string[]; // 參考圖片 (Base64 strings) - For character refs, moodboards
  type: '驚喜包' | '一般文字委託' | '意識流' | 'R18' | '擦邊';
  price: number;
  status: CommissionStatus;
  dateAdded: string;
  lastUpdated: string;
  thumbnailUrl?: string; 
  notes?: string; 
}

export type ThemeMode = 'client' | 'admin';