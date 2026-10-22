import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#536c47',
  dark: '#304632',
  text: '#455343',
  muted: '#7c8378',
  bg: '#f7f7f1',
  border: '#e4e8df',
  has: '#2f80ed',   // "Мають житло"
  seek: '#e67e22',  // "Шукають підселення"
  danger: '#d64545',
};

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 24, gap: 14 },
  title: { fontSize: 28, fontWeight: '800', color: colors.dark, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 },
  hint: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: 13, fontSize: 14, backgroundColor: '#fff', color: colors.text,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 10,
    borderWidth: 1, borderColor: '#e9ebe3',
  },
});