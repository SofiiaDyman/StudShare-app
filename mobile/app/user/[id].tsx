import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import CompatibilityBadge from '../../components/CompatibilityBadge';
import { TRAITS } from '../../data';
import { api, errorMessage } from '../../services/api';
import { colors, ui } from '../../theme';
import type { Profile } from '../../types';

type Data = {
  user: { id: number; full_name: string; is_verified: boolean };
  profile: Profile | null;
  compatibility: number | null;
};

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    api.get(`/profile/${id}`)
      .then(({ data }) => setData(data))
      .catch((e) => Alert.alert('Помилка', errorMessage(e)));
  }, [id]);

  if (!data) return <ActivityIndicator style={{ marginTop: 60 }} />;
  const { user, profile } = data;

  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.container}>
      <Text style={ui.title}>{user.full_name}</Text>
      {user.is_verified && <Text style={{ color: colors.primary }}>✓ Верифікований студент</Text>}
      <CompatibilityBadge value={data.compatibility} />
      {data.compatibility == null && (
        <Text style={ui.hint}>Сумісність не порахована: заповни свою анкету (і дочекайся, поки заповнить співмешканець).</Text>
      )}

      {!profile ? (
        <Text style={ui.subtitle}>Цей студент ще не заповнив анкету</Text>
      ) : (
        <View style={ui.card}>
          {TRAITS.map((t) => (
            <Text key={t.key} style={{ fontSize: 16 }}>
              {t.label}: {profile[t.key] ?? 'не вказано'}
              <Text style={ui.hint}>  ({t.left} → {t.right})</Text>
            </Text>
          ))}
          {profile.budget_max != null && (
            <Text style={{ fontSize: 16 }}>Бюджет: {profile.budget_min ?? 0}–{profile.budget_max} грн</Text>
          )}
          {!!profile.bio && <Text style={{ fontSize: 16, marginTop: 8 }}>{profile.bio}</Text>}
        </View>
      )}
    </ScrollView>
  );
}