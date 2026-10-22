import { Stack, usePathname } from 'expo-router';
import { Platform, View } from 'react-native';
import WebSiteHeader from '../components/WebSiteHeader';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { isDemoPreviewEnabled } from '../services/demoPreview';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <RootNavigator />
      </FavoritesProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const pathname = usePathname();
  const demo = isDemoPreviewEnabled();
  const showWebHeader = Platform.OS === 'web'
    && (pathname.startsWith('/post/') || pathname.startsWith('/user/'));

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F1' }}>
      {showWebHeader && <WebSiteHeader demo={demo} />}
      <Stack screenOptions={Platform.OS === 'web' ? { headerShown: false } : undefined}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
        <Stack.Screen
          name="user/[id]"
          options={{ title: 'Профіль студента' }}
        />
      </Stack>
    </View>
  );
}