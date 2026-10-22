import { Text, View } from 'react-native';
import type { Post } from '../types';

export default function PostsMap(_: { posts: Post[]; onSelect: (post: Post) => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Карта доступна лише в мобільному застосунку</Text>
    </View>
  );
}