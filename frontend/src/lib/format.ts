export const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
/** Chuỗi số thập phân dương, tối đa `decimals` chữ số sau dấu chấm (không chấp nhận 1e5, -1, ...). */
export function amountError(v: string, decimals = 18): string {
  if (!v) return "";
  const re = new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`);
  if (!re.test(v.trim())) return "Số lượng không hợp lệ";
  if (!(Number(v) > 0)) return "Số lượng phải > 0";
  return "";
}
