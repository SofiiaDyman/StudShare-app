import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { colors, ui } from '../../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(user.is_verified ? '/' : '/verify');
    } catch (e) {
      Alert.alert('Помилка входу', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="РАДІ БАЧИТИ ЗНОВУ" title="З поверненням!" description="Увійди, щоб продовжити пошук свого місця у Львові.">
        <Text style={s.label}>Університетська пошта</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none"
          keyboardType="email-address" placeholder="name@lnu.edu.ua" />
        <Text style={s.label}>Пароль</Text>
        <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Введи пароль" />

        <Button title="Увійти" onPress={onSubmit} loading={loading} />
        <Link href="/register" style={s.link}>
          Немає акаунта? Зареєструватись
        </Link>
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  label: { color: '#4E5B4E', fontSize: 12, fontWeight: '700', marginTop: 3 },
  input: { ...ui.input, borderRadius: 12, borderColor: '#E4E8DF', paddingHorizontal: 14, minHeight: 48, fontSize: 14 },
  link: { color: colors.primary, textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: '700' },
});