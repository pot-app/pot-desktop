import { atom } from 'jotai';

// 工具函数：从 localStorage 获取已禁用的服务
const getTempDisabledSetFromStorage = () => {
  const savedData = localStorage.getItem('tempDisabledServices');
  return savedData ? new Set(JSON.parse(savedData)) : new Set();
};

// 工具函数：保存已禁用的服务到 localStorage
const saveTempDisabledSetToStorage = (set) => {
  localStorage.setItem('tempDisabledServices', JSON.stringify([...set]));
};

// 存放“被临时禁用”的翻译服务实例 key
export const tempTranslateDisabledSetAtom = atom(getTempDisabledSetFromStorage());

export const toggleTempTranslateDisabledAtom = atom(
  null,
  (get, set, instanceKey) => {
    const prev = get(tempTranslateDisabledSetAtom);
    const next = new Set(prev);
    if (next.has(instanceKey)) {
      next.delete(instanceKey);
    } else {
      next.add(instanceKey);
    }
    // 更新状态
    set(tempTranslateDisabledSetAtom, next);
    // 保存到 localStorage
    saveTempDisabledSetToStorage(next);
  }
);

// 工具函数：判断某个实例 key 是否被禁用
export const isTempDisabledAtom = (instanceKey) =>
  atom((get) => get(tempTranslateDisabledSetAtom).has(instanceKey));
