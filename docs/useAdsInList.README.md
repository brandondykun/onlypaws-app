# useAdsInList Hook - Quick Reference

## 🎯 Purpose

Make adding ads to any list **plug-and-play** across the entire app.

## ✨ Features

- ✅ **3-line integration** - Add ads to any list in seconds
- ✅ **Automatic preloading** - Ads load in background before user scrolls
- ✅ **Smart caching** - Keeps ads ready, cleans up automatically  
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Memory efficient** - Auto-cleanup on unmount
- ✅ **Zero boilerplate** - No manual merging, preloading, or cleanup needed

## 📖 Basic Usage

```typescript
import { useAdsInList } from "@/hooks/useAdsInList";

const { data, renderItem, keyExtractor } = useAdsInList({
  items: posts,                                    // Your array of items
  adInterval: 6,                                   // Show ad every 6 items (default: 6 this is optional override)
  renderItem: (post) => <Post post={post} />,     // How to render each item
});

<FlashList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
/>
```

## 🚀 Quick Start

### 1. Feed Screen

```typescript
const FeedScreen = () => {
  const { posts } = useFeedPosts();
  
  const { data, renderItem, keyExtractor } = useAdsInList({
    items: posts,
    renderItem: (post) => <Post post={post} />,
  });

  return <FlashList data={data} renderItem={renderItem} keyExtractor={keyExtractor} />;
};
```

### 2. Profile Posts

```typescript
const ProfilePostsScreen = () => {
  const { posts } = useProfilePosts();
  
  const renderPost = useCallback(
    (post) => <Post post={post} captionExpandable={false} />,
    [],
  );
  
  const { data, renderItem, keyExtractor } = useAdsInList({
    items: posts,
    adInterval: 4, // Show ad every 4 posts - override default
    renderItem: renderPost,
  });

  return <FlashList data={data} renderItem={renderItem} keyExtractor={keyExtractor} />;
};
```

### 3. Saved Posts

```typescript
const SavedPostsScreen = () => {
  const { savedPosts } = useSavedPosts();
  
  const { data, renderItem, keyExtractor } = useAdsInList({
    items: savedPosts,
    adInterval: 8, // Less frequent for saved content
    renderItem: (post) => <Post post={post} />,
  });

  return <FlashList data={data} renderItem={renderItem} keyExtractor={keyExtractor} />;
};
```

## ⚙️ API

### Parameters

```typescript
{
  items: T[];                                // Array of items (must have 'id' property)
  adInterval?: number;                       // Show ad every N items (backend decides the default interval)
  renderItem: (item: T) => React.ReactElement; // How to render non-ad items
  onItemsChange?: (items: T[], adCount: number) => void; // Optional callback
}
```

### Returns

```typescript
{
  data: Array<T | AdItem>;                   // Merged array of items and ads
  renderItem: (params) => React.ReactElement; // Render function for FlashList
  keyExtractor: (item) => string;            // Key extractor for FlashList
}
```

## 💡 Tips

### Different Ad Frequencies

```typescript
// High-value content - fewer ads
adInterval: 10

// Regular content - balanced
adInterval: 6

// Low-value content - more ads
adInterval: 4
```

### With Navigation

```typescript
const navigate = useNavigation();

const renderPost = useCallback(
  (post) => (
    <Pressable onPress={() => navigate.push('PostDetail', { id: post.id })}>
      <Post post={post} />
    </Pressable>
  ),
  [navigate],
);

const { data, renderItem, keyExtractor } = useAdsInList({
  items: posts,
  adInterval: 6,
  renderItem: renderPost,
});
```

### Debug Info

```typescript
const { data, renderItem, keyExtractor } = useAdsInList({
  items: posts,
  adInterval: 6,
  renderItem: (post) => <Post post={post} />,
  onItemsChange: (items, adCount) => {
    console.log(`📊 ${items.length} posts, ${adCount} ads`);
  },
});
```

## 🎨 How It Works

1. **Merges** ads into your item array automatically
2. **Preloads** all expected ads when items change
3. **Renders** posts or ads based on item type
4. **Cleans up** cache when component unmounts

## 📚 Examples

See `hooks/useAdsInList.example.tsx` for more detailed examples!

## 🔧 Requirements

- Items must have an `id` property (string or number)
- Uses FlashList or FlatList (any list that accepts `data`, `renderItem`, `keyExtractor`)
- Google Mobile Ads must be initialized (handled in `app/_layout.tsx`)

## 🚨 Common Mistakes

❌ **Don't** wrap the hook return values
```typescript
// BAD
const ads = useAdsInList({ ... });
<FlashList data={ads.data} ... />
```

✅ **Do** destructure directly
```typescript
// GOOD
const { data, renderItem, keyExtractor } = useAdsInList({ ... });
<FlashList data={data} renderItem={renderItem} keyExtractor={keyExtractor} />
```

❌ **Don't** manually merge ads
```typescript
// BAD - Hook already handles this
const merged = mergeAdsIntoPosts(data, 6);
```

✅ **Do** use the returned data directly
```typescript
// GOOD
<FlashList data={data} ... />
```

