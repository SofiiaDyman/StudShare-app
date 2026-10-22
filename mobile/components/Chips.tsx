import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Props = {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
};

export default function Chips({ options, value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.chip, active && s.active]}>
            <Text style={[s.text, active && s.activeText]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontWeight: '500' },
  activeText: { color: '#fff' },
});