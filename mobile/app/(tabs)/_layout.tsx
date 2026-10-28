import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Platform, type ColorValue, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import WebSiteHeader from '../../components/WebSiteHeader';
import { isDemoPreviewEnabled } from '../../services/demoPreview';
import { colors } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const icon = (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) =>
    <Ionicons name={name} color={typeof color === 'number' ? colors.primary : color ?? colors.primary} size={size} />;

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  }
  if (!isDemoPreviewEnabled()) {
    if (!user) return <Redirect href="/login" />;
    if (!user.is_verified) return <Redirect href="/verify" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F1' }}>
      {Platform.OS === 'web' && <WebSiteHeader demo={isDemoPreviewEnabled()} />}
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: Platform.OS === 'web'
          ? { display: 'none' }
          : { backgroundColor: '#fff', borderTopColor: '#E9EBE3', height: 62, paddingTop: 6, paddingBottom: 5 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}>
        <Tabs.Screen name="index" options={{ title: 'Стрічка', tabBarIcon: icon('home-outline') }} />
        <Tabs.Screen name="map" options={{ title: 'Карта', tabBarIcon: icon('map-outline') }} />
        <Tabs.Screen name="favorites" options={{ title: 'Обране', tabBarIcon: icon('heart-outline') }} />
        <Tabs.Screen name="profile" options={{ title: 'Профіль', tabBarIcon: icon('person-outline') }} />
      </Tabs>
    </View>
  );
}