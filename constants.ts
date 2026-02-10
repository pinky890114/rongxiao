import { Commission, CommissionStatus } from './types';

export const STATUS_STEPS = [
  CommissionStatus.NOT_STARTED,
  CommissionStatus.IN_PROGRESS,
  CommissionStatus.REVISION,
  CommissionStatus.COMPLETED,
];

export const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'c-101',
    artistId: '容霄',
    clientName: '星野光',
    title: '奇幻冒險 - 森林奇遇',
    description: '希望能撰寫一段關於精靈遊俠在雨中迷失的開場。風格偏向憂鬱、唯美，重點描寫環境氛圍與角色的內心獨白。',
    referenceImages: [],
    type: '一般文字委託',
    price: 1500,
    status: CommissionStatus.IN_PROGRESS,
    dateAdded: '2023-10-25',
    lastUpdated: '2023-11-02',
    thumbnailUrl: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: 'c-102',
    artistId: '容霄',
    clientName: 'MomoChan',
    title: '深夜的便利商店',
    description: '有點意識流的描寫，關於失眠的主角在便利商店觀察路人的獨白。',
    referenceImages: [],
    type: '意識流',
    price: 800,
    status: CommissionStatus.NOT_STARTED,
    dateAdded: '2023-10-28',
    lastUpdated: '2023-10-30',
    thumbnailUrl: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 'c-103',
    artistId: '容霄',
    clientName: '鐵拳阿豪',
    title: '地下城戰役回顧',
    description: '希望能把我們昨天的跑團紀錄寫成短篇小說，戰鬥場面要精彩。',
    referenceImages: [],
    type: '一般文字委託',
    price: 2000,
    status: CommissionStatus.COMPLETED,
    dateAdded: '2023-11-01',
    lastUpdated: '2023-11-01',
    thumbnailUrl: 'https://picsum.photos/400/250?random=3'
  },
  {
    id: 'c-104',
    artistId: '容霄',
    clientName: 'Viper007',
    title: '私密委託',
    description: '詳細設定已私訊。',
    referenceImages: [],
    type: 'R18',
    price: 3500,
    status: CommissionStatus.REVISION,
    dateAdded: '2023-10-20',
    lastUpdated: '2023-10-29',
    thumbnailUrl: 'https://picsum.photos/400/400?random=4'
  },
  {
    id: 'c-105',
    artistId: '容霄',
    clientName: '匿名K',
    title: '驚喜包測試',
    description: '關鍵字：雨天、咖啡廳、失戀。其餘自由發揮。',
    referenceImages: [],
    type: '驚喜包',
    price: 500,
    status: CommissionStatus.NOT_STARTED,
    dateAdded: '2023-11-05',
    lastUpdated: '2023-11-05'
  }
];