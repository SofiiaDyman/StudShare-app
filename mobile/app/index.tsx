import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { enableDemoPreview } from '../services/demoPreview';

const BENEFITS = [
  { icon: 'people-outline' as const, title: 'Свої люди', text: 'Знайомся зі студентами, які теж шукають комфортне житло у Львові.' },
  { icon: 'options-outline' as const, title: 'Сумісний побут', text: 'Обирай за звичками, бюджетом і тим, як уявляєш спільне життя.' },
  { icon: 'shield-checkmark-outline' as const, title: 'Студентська спільнота', text: 'Реєстрація з університетською поштою допомагає зберегти довіру.' },
];

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  if (loading) {
    return <View style={s.loading}><ActivityIndicator color="#49633D" /></View>;
  }
  if (user?.is_verified) return <Redirect href="/(tabs)" />;
  if (user) return <Redirect href="/verify" />;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.page}>
      <View style={s.nav}>
        <Pressable style={s.brand} onPress={() => router.replace('/')}>
          <View style={s.brandIcon}><Ionicons name="home" size={17} color="#F9F8F2" /></View>
          <Text style={s.brandName}>studshare</Text>
        </Pressable>
        <Pressable style={s.navLogin} onPress={() => router.push('/login')}>
          <Text style={s.navLoginText}>Увійти</Text>
          <Ionicons name="arrow-forward" size={16} color="#304632" />
        </Pressable>
      </View>

      <View style={[s.hero, wide && s.heroWide]}>
        <View style={[s.heroCopy, wide && s.heroCopyWide]}>
          <View style={s.eyebrow}>
            <View style={s.eyebrowDot} />
            <Text style={s.eyebrowText}>ТВОЄ СТУДЕНТСЬКЕ ЖИТТЯ У ЛЬВОВІ</Text>
          </View>
          <Text style={s.headline}>Знайди не просто житло.{'\n'}Знайди <Text style={s.headlineAccent}>своїх.</Text></Text>
          <Text style={s.description}>StudShare допоможе знайти співмешканців, з якими збігаються плани, бюджет і ритм життя.</Text>

          <View style={[s.actions, !wide && s.actionsStack]}>
            <Pressable style={s.primaryButton} onPress={() => router.push('/register')}>
              <Text style={s.primaryButtonText}>Знайти співмешканця</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
            <Pressable style={s.secondaryButton} onPress={() => router.push('/login')}>
              <Text style={s.secondaryButtonText}>У мене вже є акаунт</Text>
            </Pressable>
            {__DEV__ && (
              <Pressable
                style={s.demoButton}
                onPress={() => {
                  enableDemoPreview();
                  router.replace('/(tabs)');
                }}
              >
                <Ionicons name="eye-outline" size={16} color="#536C47" />
                <Text style={s.demoButtonText}>Переглянути демо без акаунта</Text>
              </Pressable>
            )}
          </View>

          <View style={s.socialProof}>
            <View style={s.avatarStack}>
              <View style={[s.avatar, { backgroundColor: '#D5A179' }]}><Text style={s.avatarText}>А</Text></View>
              <View style={[s.avatar, { backgroundColor: '#A9B88C' }]}><Text style={s.avatarText}>М</Text></View>
              <View style={[s.avatar, { backgroundColor: '#C7A7A0' }]}><Text style={s.avatarText}>С</Text></View>
            </View>
            <Text style={s.socialProofText}>Студенти знаходять комфорт разом</Text>
          </View>
        </View>

        <View style={[s.art, wide && s.artWide]}>
          <View style={s.artCircle} />
          <View style={s.locationPill}>
            <Ionicons name="location" size={15} color="#49633D" />
            <Text style={s.locationText}>Львів, Україна</Text>
          </View>
          <View style={s.listingCard}>
            <View style={s.listingTop}>
              <View style={s.listingIcon}><Ionicons name="bed-outline" size={21} color="#49633D" /></View>
              <View style={s.available}><View style={s.availableDot} /><Text style={s.availableText}>Є місце</Text></View>
            </View>
            <Text style={s.listingTitle}>Кімната для своїх</Text>
            <Text style={s.listingMeta}>Франківський район · 2 сусіди</Text>
            <View style={s.listingDivider} />
            <View style={s.listingBottom}>
              <View>
                <Text style={s.price}><Text style={s.priceValue}>4 500</Text> грн<Text style={s.priceUnit}> / міс</Text></Text>
                <Text style={s.matchLabel}>СХОЖИЙ РИТМ ЖИТТЯ</Text>
              </View>
              <View style={s.matchBadge}><Ionicons name="sparkles" size={15} color="#49633D" /><Text style={s.matchValue}>92%</Text></View>
            </View>
          </View>
          <View style={s.noteCard}>
            <View style={s.noteIcon}><Ionicons name="heart" size={16} color="#B46F5A" /></View>
            <View><Text style={s.noteTitle}>Починається з розмови</Text><Text style={s.noteText}>Знайомся до переїзду</Text></View>
          </View>
        </View>
      </View>

      <View style={s.benefitsSection}>
        <Text style={s.sectionEyebrow}>БІЛЬШЕ, НІЖ ОГОЛОШЕННЯ</Text>
        <Text style={s.sectionTitle}>Дім починається з людей</Text>
        <View style={[s.benefits, wide && s.benefitsWide]}>
          {BENEFITS.map((benefit) => (
            <View key={benefit.title} style={s.benefitCard}>
              <View style={s.benefitIcon}><Ionicons name={benefit.icon} size={21} color="#49633D" /></View>
              <Text style={s.benefitTitle}>{benefit.title}</Text>
              <Text style={s.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.footerBrand}>studshare</Text>
        <Text style={s.footerText}>Знайди своїх. Відчуй себе вдома.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F1' },
  screen: { flex: 1, backgroundColor: '#F7F7F1' },
  page: { width: '100%', maxWidth: 1160, alignSelf: 'center', paddingHorizontal: 28 },
  nav: { height: 84, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#304632', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#26372A', fontSize: 20, fontWeight: '800', letterSpacing: -0.6 },
  navLogin: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingLeft: 14 },
  navLoginText: { color: '#304632', fontSize: 15, fontWeight: '700' },
  hero: { paddingTop: 42, paddingBottom: 72, gap: 44 },
  heroWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingBottom: 96, gap: 54 },
  heroCopy: { gap: 22 },
  heroCopyWide: { flex: 1.1 },
  eyebrow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#E9EDDF', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  eyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#698453' },
  eyebrowText: { color: '#49633D', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  headline: { color: '#25352A', fontSize: 43, fontWeight: '800', lineHeight: 50, letterSpacing: -1.7 },
  headlineAccent: { color: '#718B53' },
  description: { maxWidth: 460, color: '#72796E', fontSize: 16, lineHeight: 26 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  actionsStack: { alignItems: 'stretch', flexDirection: 'column' },
  primaryButton: { minHeight: 52, backgroundColor: '#304632', borderRadius: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondaryButton: { minHeight: 52, borderRadius: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: '#445542', fontSize: 14, fontWeight: '700' },
  demoButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#DCE3D4', borderRadius: 13, paddingHorizontal: 14 },
  demoButtonText: { color: '#536C47', fontSize: 12, fontWeight: '700' },
  socialProof: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  avatarStack: { flexDirection: 'row', paddingLeft: 2 },
  avatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#F7F7F1', alignItems: 'center', justifyContent: 'center', marginLeft: -3 },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  socialProofText: { color: '#7D8279', fontSize: 12 },
  art: { minHeight: 330, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  artWide: { flex: 0.9, minHeight: 390 },
  artCircle: { position: 'absolute', width: 290, height: 290, borderRadius: 145, backgroundColor: '#E8EBDD' },
  locationPill: { position: 'absolute', zIndex: 2, top: 14, right: '7%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, backgroundColor: '#fff', shadowColor: '#243329', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  locationText: { color: '#455343', fontSize: 12, fontWeight: '700' },
  listingCard: { width: '88%', maxWidth: 365, borderRadius: 22, backgroundColor: '#fff', padding: 21, shadowColor: '#243329', shadowOpacity: 0.11, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 7 },
  listingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  listingIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EFF2E8', alignItems: 'center', justifyContent: 'center' },
  available: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF5E9', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#729456' },
  availableText: { color: '#547044', fontSize: 11, fontWeight: '700' },
  listingTitle: { color: '#29362B', fontSize: 19, fontWeight: '800', marginBottom: 6 },
  listingMeta: { color: '#858B80', fontSize: 12 },
  listingDivider: { height: 1, backgroundColor: '#EEF0E9', marginVertical: 17 },
  listingBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: '#899080', fontSize: 12 },
  priceValue: { color: '#334735', fontSize: 20, fontWeight: '800' },
  priceUnit: { color: '#92978D', fontSize: 11 },
  matchLabel: { color: '#9A9F91', fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 6 },
  matchBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F2F4EC', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  matchValue: { color: '#49633D', fontSize: 13, fontWeight: '800' },
  noteCard: { position: 'absolute', bottom: 10, left: '2%', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 13, paddingVertical: 11, shadowColor: '#243329', shadowOpacity: 0.09, shadowRadius: 16, elevation: 5 },
  noteIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: '#F8ECE8', alignItems: 'center', justifyContent: 'center' },
  noteTitle: { color: '#39443A', fontSize: 11, fontWeight: '700' },
  noteText: { color: '#93988E', fontSize: 10, marginTop: 3 },
  benefitsSection: { borderTopWidth: 1, borderTopColor: '#E7E9E1', paddingTop: 40, paddingBottom: 50 },
  sectionEyebrow: { color: '#82916F', textAlign: 'center', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  sectionTitle: { color: '#29382C', textAlign: 'center', fontSize: 25, fontWeight: '800', letterSpacing: -0.5, marginBottom: 26 },
  benefits: { gap: 12 },
  benefitsWide: { flexDirection: 'row' },
  benefitCard: { flex: 1, borderRadius: 18, borderWidth: 1, borderColor: '#E9EBE3', backgroundColor: '#FBFBF7', padding: 18, gap: 9 },
  benefitIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#EEF1E7', alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  benefitTitle: { color: '#344435', fontSize: 15, fontWeight: '800' },
  benefitText: { color: '#7C8378', fontSize: 12, lineHeight: 19 },
  footer: { borderTopWidth: 1, borderTopColor: '#E7E9E1', minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerBrand: { color: '#506747', fontSize: 13, fontWeight: '800' },
  footerText: { color: '#95998F', fontSize: 11 },
});
