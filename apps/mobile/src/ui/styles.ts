import { StyleSheet } from 'react-native';

export const c = {
  bg: '#0b1220',
  card: '#111827',
  text: '#f9fafb',
  sub: '#9ca3af',
  accent: '#10b981',
  border: '#1f2937',
};

export const g = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.bg,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: c.text,
    textAlign: 'right',
    width: '100%',
  },
  p: { color: c.sub, textAlign: 'right', width: '100%', marginTop: 8, lineHeight: 22, fontSize: 15 },
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 12,
    marginTop: 10,
  },
  cardTitle: { color: c.text, fontWeight: '600', textAlign: 'right', fontSize: 16 },
  cardSub: { color: c.sub, textAlign: 'right', fontSize: 13, marginTop: 4 },
  btn: {
    marginTop: 16,
    backgroundColor: c.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  row: { marginTop: 8 },
  nav: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  link: {
    color: c.accent,
    textDecorationLine: 'underline',
    fontSize: 15,
    marginLeft: 12,
  },
});
