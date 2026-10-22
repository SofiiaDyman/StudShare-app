import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { colors, ui } from '../../theme';

const UNI_EMAIL = /@([a-z0-9-]+\.)*lnu\.edu\.ua$/i;

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) return Alert.alert('Вкажи ім’я та прізвище');
    if (!UNI_EMAIL.test(email.trim())) return Alert.alert('Потрібна пошта @lnu.edu.ua');
    if (password.length < 6) return Alert.alert('Пароль має містити мінімум 6 символів');

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/verify');
    } catch (e) {
      Alert.alert('Не вдалося зареєструватись', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="ПРИЄДНУЙСЯ ДО СПІЛЬНОТИ" title="Почни з простого" description="Створи акаунт, щоб знайти співмешканців серед студентів ЛНУ.">
        <Text style={s.label}>Ім’я та прізвище</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Наприклад, Олена Коваль" />
        <Text style={s.label}>Університетська пошта</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none"
          keyboardType="email-address" placeholder="name@lnu.edu.ua" />
        <Text style={s.label}>Пароль</Text>
        <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Не менше 6 символів" />

        <Button title="Створити акаунт" onPress={onSubmit} loading={loading} />
        <Link href="/login" style={s.link}>
          Вже є акаунт? Увійти
        </Link>
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  label: { color: '#4E5B4E', fontSize: 12, fontWeight: '700', marginTop: 3 },
  input: { ...ui.input, borderRadius: 12, borderColor: '#E4E8DF', paddingHorizontal: 14, minHeight: 48, fontSize: 14 },
  link: { color: colors.primary, textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: '700' },
});