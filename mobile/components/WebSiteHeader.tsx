import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { title: 'Стрічка', icon: 'home-outline' as const, route: '/(tabs)', match: '/' },
  { title: 'Карта', icon: 'map-outline' as const, route: '/(tabs)/map', match: '/map' },
  { title: 'Обране', icon: 'heart-outline' as const, route: '/(tabs)/favorites', match: '/favorites' },
  { title: 'Профіль', icon: 'person-outline' as const, route: '/(tabs)/profile', match: '/profile' },
] as const;

export default function WebSiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={s.outer}>
      <View style={s.header}>
        <Pressable style={s.brand} onPress={() => router.replace('/(tabs)')}>
          <View style={s.brandIcon}><Ionicons name="home" size={17} color="#F9F8F2" /></View>
          <View>
            <Text style={s.brandName}>studshare</Text>
            <Text style={s.brandCaption}>ТВОЄ МІСЦЕ У ЛЬВОВІ</Text>
          </View>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.navigation}>
          {LINKS.map((link) => {
            const active = link.match === '/' ? pathname === '/' || pathname.endsWith('/index') : pathname.endsWith(link.match);
            return (
              <Pressable
                key={link.title}
                style={[s.navLink, active && s.navLinkActive]}
                onPress={() => router.push(link.route)}
              >
                <Ionicons name={link.icon} size={16} color={active ? '#304632' : '#858B80'} />
                <Text style={[s.navText, active && s.navTextActive]}>{link.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {user && (
          <Pressable style={s.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={16} color="#536C47" />
            <Text style={s.logoutText}>Вийти</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: { zIndex: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E9EBE3' },
  header: { width: '100%', maxWidth: 1160, minHeight: 74, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24, paddingHorizontal: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#304632', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#26372A', fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
  brandCaption: { color: '#92998E', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  navigation: { flexDirection: 'row', alignItems: 'center', gap: 5, flexGrow: 1, justifyContent: 'center' },
  navLink: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 12, paddingHorizontal: 13 },
  navLinkActive: { backgroundColor: '#EEF1E8' },
  navText: { color: '#737B70', fontSize: 12, fontWeight: '600' },
  navTextActive: { color: '#304632', fontWeight: '800' },
  logoutButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#DCE3D4', borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 12 },
  logoutText: { color: '#536C47', fontSize: 11, fontWeight: '700' },
});
