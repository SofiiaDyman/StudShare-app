import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import type { Trait } from '../data';
import { colors } from '../theme';

type Props = { trait: Trait; value: number | null; onChange: (v: number) => void };

export default function TraitSlider({ trait, value, onChange }: Props) {
  return (
    <View style={s.card}>
      <View style={s.labelRow}>
        <Text style={s.label}>{trait.label}</Text>
        <Text style={s.value}>{value == null ? '—' : value}</Text>
      </View>
      <Slider
        minimumValue={trait.min}
        maximumValue={trait.max}
        step={1}
        value={value ?? Math.round((trait.min + trait.max) / 2)}
        onSlidingComplete={onChange}
        minimumTrackTintColor={colors.primary}
        thumbTintColor={colors.primary}
      />
      <View style={s.range}>
        <Text style={s.hint}>{trait.left}</Text>
        <Text style={s.hint}>{trait.right}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 14, backgroundColor: '#FBFBF7', paddingHorizontal: 13, paddingTop: 11, paddingBottom: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#455343', fontSize: 12, fontWeight: '700' },
  value: { color: '#536C47', fontSize: 12, fontWeight: '800' },
  range: { flexDirection: 'row', justifyContent: 'space-between' },
  hint: { color: '#92998E', fontSize: 10 },
});