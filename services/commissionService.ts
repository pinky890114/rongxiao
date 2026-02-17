import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Commission, CommissionStatus } from '../types';
import { MOCK_COMMISSIONS } from '../constants';

const TABLE_NAME = 'commissions';

export const fetchCommissions = async (): Promise<Commission[]> => {
  if (!db) {
    console.warn("Firestore not initialized. Using Mock Data.");
    const local = localStorage.getItem('arttrack_commissions_zh_v1');
    if (local) return JSON.parse(local);
    return MOCK_COMMISSIONS;
  }

  try {
    const q = query(collection(db, TABLE_NAME), orderBy('lastUpdated', 'desc'));
    const querySnapshot = await getDocs(q);
    
    // 如果雲端完全沒有資料，但本地有資料，可以提示使用者同步 (這裡僅回傳空陣列，由 UI 決定是否觸發同步)
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id, // 確保 ID 使用文件 ID
            referenceImages: data.referenceImages || []
        } as Commission;
    });
  } catch (error) {
    console.error("Error fetching commissions from Firebase:", error);
    return MOCK_COMMISSIONS;
  }
};

export const createCommission = async (commission: Commission): Promise<Commission | null> => {
  if (!db) return null;

  try {
    await setDoc(doc(db, TABLE_NAME, commission.id), commission);
    return commission;
  } catch (error) {
    console.error("Error creating commission:", error);
    throw error;
  }
};

export const updateCommissionStatus = async (id: string, status: CommissionStatus): Promise<void> => {
  if (!db) return;

  try {
    const docRef = doc(db, TABLE_NAME, id);
    await updateDoc(docRef, { 
      status, 
      lastUpdated: new Date().toISOString().split('T')[0] 
    });
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

export const deleteCommission = async (id: string): Promise<void> => {
  if (!db) return;

  try {
    await deleteDoc(doc(db, TABLE_NAME, id));
  } catch (error) {
    console.error("Error deleting commission:", error);
    throw error;
  }
};

// 新增：同步本地資料到雲端
export const syncLocalToCloud = async (): Promise<number> => {
    if (!db) throw new Error("Firebase not initialized");

    const localData = localStorage.getItem('arttrack_commissions_zh_v1');
    if (!localData) return 0;

    let parsed: Commission[] = [];
    try {
        parsed = JSON.parse(localData);
    } catch (e) {
        console.error("Parse local data error", e);
        return 0;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) return 0;

    let count = 0;
    // 批次寫入或逐筆寫入
    for (const comm of parsed) {
        try {
            // 使用 setDoc，若 ID 相同會覆蓋，這樣可以確保資料一致
            await setDoc(doc(db, TABLE_NAME, comm.id), comm);
            count++;
        } catch (e) {
            console.error(`Failed to sync commission ${comm.id}`, e);
        }
    }
    
    return count;
};