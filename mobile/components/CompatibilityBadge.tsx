import { StyleSheet, Text, View } from 'react-native';

export default function CompatibilityBadge({ value }: { value: number | null }) {
  if (value == null) return null;
  const color = value >= 75 ? '#2e9e5b' : value >= 50 ? '#d99a1b' : '#c0504d';
  return (
    <View style={[s.badge, { backgroundColor: color + '22' }]}>
      <Text style={[s.text, { color }]}>{value}% сумісності</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  text: { fontSize: 13, fontWeight: '600' },
});