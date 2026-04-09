/**
 * تنسيق المبالغ بالجنيه السوداني
 */
export const formatSudanesePound = (amount: number): string => {
  return new Intl.NumberFormat('ar-SD', {
    style: 'currency',
    currency: 'SDG',
  }).format(amount);
};

/**
 * التحقق من صحة رقم الهاتف السوداني
 */
export const isValidSudanesePhone = (phone: string): boolean => {
  const re = /^(0[19][0-9]{8})$/;
  return re.test(phone);
};
