/** Map shared aggregate followup keys to Arabic (internal keys remain English in shared). */
const map: Record<string, string> = {
  late_risk: 'يحتاج متابعة',
  no_show_risk: 'احتمال عدم حضور',
  stable: 'مستقر',
};

export function followupLabelAr(key: string) {
  return map[key] ?? key;
}
