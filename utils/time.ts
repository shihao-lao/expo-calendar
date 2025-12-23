// utils/time.ts (如果你放在根目录，请确保路径引用正确)

// 统一时间计算工具函数
export const calculateTimeDifference = (targetDate: string | Date): number => {
  // 处理不同类型的输入
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  
  // 验证时间有效性
  if (!(target instanceof Date) || isNaN(target.getTime())) {
    throw new Error('无效的时间参数');
  }
  
  // 计算时间差（毫秒）
  return target.getTime() - Date.now();
};

// 转换为 UTC 时间字符串
export const toUTCString = (date: Date): string => {
  return date.toUTCString();
};

// 从 UTC 时间字符串转换为 Date 对象
export const fromUTCString = (utcString: string): Date => {
  return new Date(utcString);
};

// 转换为秒数
export const toSeconds = (milliseconds: number): number => {
  return Math.floor(milliseconds / 1000);
};
