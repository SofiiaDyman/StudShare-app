import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput } from 'react-native';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { ui } from '../../theme';

export default function VerifyScreen() {
  const { user, verify, resendCode, logout } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    setLoading(true);
    try {
      await verify(code);
      router.replace('/');
    } catch (e) {
      Alert.alert('Помилка', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      await resendCode();
      Alert.alert('Готово', 'Новий код надіслано на пошту');
    } catch (e) {
      Alert.alert('Помилка', errorMessage(e));
    }
  };

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={[ui.container, { paddingTop: 100 }]} style={ui.screen} keyboardShouldPersistTaps="handled">
      <Text style={ui.title}>Підтвердь пошту</Text>
      <Text style={ui.subtitle}>Ми надіслали 6-значний код на {user?.email}</Text>
      {__DEV__ && <Text style={ui.hint}>Dev-режим: якщо SMTP не налаштований, код дивись у консолі бекенду.</Text>}

      <TextInput
        style={[ui.input, { fontSize: 28, textAlign: 'center', letterSpacing: 8 }]}
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
      />
      <Button title="Підтвердити" onPress={onVerify} loading={loading} />
      <Button title="Надіслати код ще раз" onPress={onResend} variant="secondary" />
      <Button title="Вийти" onPress={onLogout} variant="secondary" />
    </ScrollView>
  );
}