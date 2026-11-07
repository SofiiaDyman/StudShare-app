import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextStyle } from 'react-native';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  style: StyleProp<TextStyle>;
};

export default function PasswordInput({ value, onChangeText, placeholder, style }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={s.wrap}>
      <TextInput
        style={style}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        style={s.toggle}
        onPress={() => setVisible((current) => !current)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Приховати пароль' : 'Показати пароль'}
      >
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color="#7C8378" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'relative', justifyContent: 'center' },
  toggle: { position: 'absolute', right: 12, alignItems: 'center', justifyContent: 'center', padding: 4 },
});
