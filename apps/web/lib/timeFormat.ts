export function formatIqTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('ar-IQ', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function formatIqDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ar-IQ');
  } catch {
    return iso;
  }
}
