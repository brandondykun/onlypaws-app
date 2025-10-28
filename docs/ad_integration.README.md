# Ad Integration System

This document contains information about the Ad Integration System. It is a platform-agnostic ad integration system for OnlyPaws. The architecture is designed to make it easy to switch ad platforms in the future with minimal code changes.

## Architecture Overview

### 1. **Service Layer** (Platform Agnostic)

```
services/ads/
├── types.ts              # Platform-agnostic types and interfaces
├── GoogleAdsService.ts   # Google Ads implementation
└── adService.ts          # Main export (switch providers here)
```

#### Key Files:

- **`types.ts`**: Defines the `IAdService` interface that all ad providers must implement
- **`GoogleAdsService.ts`**: Current implementation using Google Mobile Ads
- **`adService.ts`**: Main export - **change this file to switch ad providers**

### 2. **UI Layer**

- **`components/AdPost/AdPost.tsx`**: A component that mimics the Post component styling to display native ads

### 3. **Utilities**

- **`utils/adUtils.ts`**: Helper functions for merging ads into post lists
  - `mergeAdsIntoPosts()`: Merges ads every N posts
  - `isAdItem()`: Type guard for checking if an item is an ad
  - `isPostItem()`: Type guard for checking if an item is a post

## Setup & Configuration

### 1. Backend Endpoint (Required)

Create a backend endpoint that returns ads configuration:

```
GET /ads/config
```

Response format:
```json
{
  "enabled": true,
  "adInterval": 6
}
```

See `api/ads.README.md` for detailed backend implementation guide.

### 2. Initialization

The ad service is initialized in `app/_layout.tsx` when the app starts:

```typescript
await adService.initialize({
  testMode: true, // Set to false in production
  androidAppId: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy', // Your Android ad unit ID
  iosAppId: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',     // Your iOS ad unit ID
});
```

### 3. Remote Ad Control (Kill Switch)

You can toggle ads on/off remotely via your backend:

```typescript
// In your component
const { adsEnabled, refetchConfig } = useAdsConfig();

// Check if ads are enabled
if (!adsEnabled) {
  // Ads are disabled - no ads will show
}

// Manually refresh config
await refetchConfig();
```

**Use Cases:**
- Emergency disable if ads have issues
- A/B testing different ad intervals
- Regional ad control
- Time-based ad control

See `context/AdsConfigContext.example.tsx` for usage examples.

### 4. Getting Production Ad Unit IDs

1. Go to [Google AdMob Console](https://apps.admob.google.com/)
2. Create a new Native Ad unit
3. Copy the ad unit IDs for iOS and Android
4. Update the configuration in `app/_layout.tsx`
5. Set `testMode: false` for production builds

### 5. Ad Preloading for Better Performance

The system includes an `AdManager` that preloads ads ahead of time to improve perceived performance:

- **Automatic Preloading**: First 3 ads are preloaded when posts load
- **Smart Caching**: Keeps up to 5 ads cached with 1-hour expiration
- **Instant Display**: Preloaded ads display immediately with no loading state
- **Memory Management**: Auto-cleans old ads and clears cache on screen unmount

### 6. Using Ads in Lists (Easy with `useAdsInList` Hook)

The `useAdsInList` hook makes adding ads to any list **plug-and-play**:

#### Basic Usage:

```typescript
import { useAdsInList } from "@/hooks/useAdsInList";
import Post from "@/components/Post/Post";

// Just 3 lines to add ads!
const { data, renderItem, keyExtractor } = useAdsInList({
  items: posts,
  adInterval: 6, // Show ad every 6 posts
  renderItem: (post) => <Post post={post} />,
});

// Use in FlatList/FlashList
<FlashList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
/>
```

**That's it!** The hook handles:
- ✅ Automatic ad merging
- ✅ Automatic preloading
- ✅ Cache management
- ✅ Memory cleanup
- ✅ Type safety

#### Advanced Example:

```typescript
const renderPost = useCallback(
  (post) => <Post post={post} onProfilePress={handlePress} />,
  [handlePress],
);

const { data, renderItem, keyExtractor } = useAdsInList({
  items: posts,
  adInterval: 5, // More frequent ads
  renderItem: renderPost,
  onItemsChange: (items, adCount) => {
    console.log(`${adCount} ads for ${items.length} posts`);
  },
});
```

See `hooks/useAdsInList.example.tsx` for more examples!

## Switching Ad Providers

To switch from Google Ads to another provider:

1. **Create a new service class** that implements `IAdService` interface:

```typescript
// services/ads/UnityAdsService.ts
import { IAdService, AdServiceConfig } from './types';

class UnityAdsService implements IAdService {
  async initialize(config: AdServiceConfig): Promise<void> {
    // Unity Ads initialization
  }

  getNativeAdUnitId(): string {
    // Return Unity ad unit ID
  }

  isInitialized(): boolean {
    // Return initialization status
  }
}

export const unityAdsService = new UnityAdsService();
```

2. **Update the main export** in `services/ads/adService.ts`:

```typescript
// Change this line:
import { googleAdsService } from './GoogleAdsService';
export const adService = googleAdsService;

// To this:
import { unityAdsService } from './UnityAdsService';
export const adService = unityAdsService;
```

3. **Update the UI component** (`components/AdPost/AdPost.tsx`) to use the new provider's components (if needed)

That's it! The rest of your app doesn't need to change.

## Configuration Options

### Ad Frequency

Change how often ads appear by modifying the second parameter in `mergeAdsIntoPosts()`:

```typescript
// Show ad every 6 posts (default)
mergeAdsIntoPosts(posts, 6);

// Show ad every 10 posts
mergeAdsIntoPosts(posts, 10);

// Show ad every 3 posts
mergeAdsIntoPosts(posts, 3);
```

### Test Mode

- **Development**: Keep `testMode: true` to use Google's test ad units
- **Production**: Set `testMode: false` and provide real ad unit IDs

### Ad Styling

Customize the ad appearance by editing `components/AdPost/AdPost.tsx`. The component is styled to match the regular Post component but can be customized independently.

## Troubleshooting

### Ads not showing?

1. **Check initialization**: Ensure `adService.isInitialized()` returns `true`
2. **Check ad unit IDs**: Verify you're using the correct ad unit IDs for your platform
3. **Check console logs**: Look for error messages in the console
4. **Test mode**: Use test mode during development to ensure ads load
5. **Network**: Ensure the device has internet connectivity

### Performance

Native ads are loaded asynchronously and won't block your UI. If an ad fails to load, the component returns `null` and doesn't render anything.

## Best Practices

1. **Always use test mode** during development to avoid policy violations
2. **Don't show too many ads** (every 6 posts is a good balance)
3. **Monitor ad performance** in the AdMob console
4. **Respect user experience** - ads should enhance, not disrupt the experience
5. **Clean up ads** when components unmount (handled automatically in `AdPost`)

## Resources

- [Google Mobile Ads Documentation](https://docs.page/invertase/react-native-google-mobile-ads)
- [AdMob Console](https://apps.admob.google.com/)
- [AdMob Best Practices](https://support.google.com/admob/answer/6128543)

