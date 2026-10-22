import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export default function Button({ title, onPress, loading = false, variant = 'primary' }: Props) {
  const secondary = variant === 'secondary';
  const bg = variant === 'danger' ? colors.danger : secondary ? '#fff' : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[s.btn, { backgroundColor: bg }, secondary && s.border, loading && { opacity: 0.6 }]}
    >
      {loading
        ? <ActivityIndicator color={secondary ? colors.dark : '#fff'} />
        : <Text style={[s.text, secondary && { color: colors.dark }]}>{title}</Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  border: { borderWidth: 1, borderColor: colors.border },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
});