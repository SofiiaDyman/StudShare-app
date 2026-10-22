import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function AuthLayout({ eyebrow, title, description, children }: Props) {
  const router = useRouter();
  const wide = useWindowDimensions().width >= 800;

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.page}>
          <Pressable style={s.brand} onPress={() => router.replace('/')}>
            <View style={s.brandIcon}><Ionicons name="home" size={17} color="#F9F8F2" /></View>
            <Text style={s.brandName}>studshare</Text>
          </Pressable>
          <View style={[s.panel, wide && s.panelWide]}>
            {wide && (
              <View style={s.story}>
                <View style={s.storyBadge}><Ionicons name="leaf-outline" size={15} color="#DCE8CD" /><Text style={s.storyBadgeText}>ТВОЄ МІСЦЕ У ЛЬВОВІ</Text></View>
                <Text style={s.storyTitle}>Дім — це люди, з якими добре.</Text>
                <Text style={s.storyText}>Знайомся, знаходь спільне та облаштовуй своє студентське життя разом.</Text>
                <View style={s.storyBottom}>
                  <View style={s.storyIcon}><Ionicons name="people-outline" size={19} color="#E7EDD9" /></View>
                  <Text style={s.storyFootnote}>Створено для студентів ЛНУ</Text>
                </View>
                <View style={s.decorCircle} />
              </View>
            )}
            <View style={s.formPanel}>
              <View style={s.eyebrow}><View style={s.dot} /><Text style={s.eyebrowText}>{eyebrow}</Text></View>
              <Text style={s.title}>{title}</Text>
              <Text style={s.description}>{description}</Text>
              <View style={s.fields}>{children}</View>
            </View>
          </View>
          <Text style={s.footer}>Знайди своїх. Відчуй себе вдома.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F1' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  page: { width: '100%', maxWidth: 960, alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20, paddingLeft: 2 },
  brandIcon: { width: 31, height: 31, borderRadius: 11, backgroundColor: '#304632', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#26372A', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  panel: { overflow: 'hidden', borderRadius: 24, backgroundColor: '#fff', shadowColor: '#243329', shadowOpacity: 0.08, shadowRadius: 25, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  panelWide: { flexDirection: 'row', minHeight: 500 },
  story: { flex: 0.88, overflow: 'hidden', position: 'relative', justifyContent: 'space-between', backgroundColor: '#304632', padding: 34 },
  storyBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#60715C', backgroundColor: '#3C5640', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8 },
  storyBadgeText: { color: '#E0E8D8', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  storyTitle: { maxWidth: 320, color: '#F8F7F0', fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -1, marginTop: 46 },
  storyText: { maxWidth: 305, color: '#D0D9CC', fontSize: 14, lineHeight: 23, marginTop: 16 },
  storyBottom: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 54 },
  storyIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#49634D', alignItems: 'center', justifyContent: 'center' },
  storyFootnote: { color: '#DFE6D9', fontSize: 12, fontWeight: '600' },
  decorCircle: { position: 'absolute', width: 210, height: 210, borderRadius: 105, borderWidth: 1, borderColor: '#82917B', opacity: 0.19, right: -105, bottom: 80 },
  formPanel: { flex: 1, justifyContent: 'center', padding: 32 },
  eyebrow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 18, backgroundColor: '#EEF1E8', paddingHorizontal: 11, paddingVertical: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#718B53' },
  eyebrowText: { color: '#536C47', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: '#29382C', fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 17 },
  description: { color: '#7C8378', fontSize: 13, lineHeight: 20, marginTop: 7, marginBottom: 23 },
  fields: { gap: 12 },
  footer: { color: '#92978D', fontSize: 11, textAlign: 'center', marginTop: 18 },
});
