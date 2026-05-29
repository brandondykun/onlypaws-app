---
name: expo-router-screens
description: Add and modify OnlyPaws Expo Router screens, layouts, tabs, stacks, route params, redirects, dynamic headers, and navigation. Use when creating app routes under app/, wiring router.push params, reading useLocalSearchParams, editing _layout.tsx files, hiding tab bars, or configuring screen headers in the Expo mobile app.
---

# Expo Router Screens

## Route Structure

This app uses Expo Router file-based routes under `app/`.

Important route groups:

- `app/_layout.tsx`: root providers, root `Stack`, auth/onboarding/app entry points.
- `app/auth/`: unauthenticated stack with hidden headers.
- `app/onboarding/`: onboarding flow.
- `app/(app)/_layout.tsx`: authenticated tab layout and app-wide context providers.
- `app/(app)/(index)/`: feed tab stack.
- `app/(app)/explore/`: explore tab stack.
- `app/(app)/add/`: add-post stack and `AddPostContextProvider`.
- `app/(app)/posts/`: posts/notifications tab stack.
- `app/(app)/profile/`: profile/settings/reporting stack.

Route groups in parentheses are not URL segments, but they are used in `pathname` values in this app for clarity and type resolution.

## Adding A Screen

1. Add the screen file in the correct route group, using `camelCase.tsx` unless the route is dynamic like `[id].tsx`.
2. Export a default component named after the screen, such as `ProfileReportDetailScreen`.
3. Add a matching `<Stack.Screen name="...">` entry in that route group's `_layout.tsx`.
4. Set a short `title`; use `headerShown: false` for full-screen camera or custom-header screens.
5. Match the route group's background and header color conventions through its existing `screenOptions`.

Nested files use slash names in stack layouts:

```tsx
<Stack.Screen name="feedback/createFeedback" options={{ title: "New Feedback" }} />
<Stack.Screen name="feedback/[id]" options={{ title: "Details" }} />
```

## Navigation

Use `useRouter()` or the `router` singleton from `expo-router`. Prefer object navigation when passing params:

```tsx
const router = useRouter();

router.push({
  pathname: "/(app)/explore/profileDetails",
  params: { profileId, username },
});
```

Common patterns:

- Use `router.push(...)` for forward navigation.
- Use `router.back()` when closing a detail/list screen and returning to the previous stack entry.
- Pass IDs as strings when the destination reads them with `useLocalSearchParams`.
- Include optional params like `username` when they improve header placeholders before query data loads.
- Keep route paths inside the same tab stack when possible, such as `/(app)/explore/profileDetails` from explore screens.

## Route Params

Read params with a typed `useLocalSearchParams` call:

```tsx
const { profileId, username } = useLocalSearchParams<{
  profileId: string;
  username?: string;
}>();
```

Convert numeric params at the use site:

```tsx
const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

return <PostScrollList initialIndex={Number(initialIndex)} />;
```

Use `enabled` for queries when required params can be absent during the first render.

## Layouts And Guards

Root layout responsibilities belong in `app/_layout.tsx`: React Query provider, gesture root, color mode, maintenance gate, auth provider, interceptors, root stack, and toast config.

Authenticated app guards belong in `app/(app)/_layout.tsx`:

- Show a loading state while `authLoading`.
- Redirect unauthenticated users to `/auth`.
- Redirect unverified users to `/auth/verifyEmail`.
- Redirect users without profiles to onboarding.
- Wrap tabs in app-wide providers there, not inside individual screens.

Auth layout redirects verified authenticated users back to `/(app)/(index)`.

## Tabs

The authenticated app uses `Tabs` in `app/(app)/_layout.tsx`.

When adding a tab:

- Add a `<Tabs.Screen name="routeGroupName">`.
- Set `title`, `tabBarIcon`, and `headerShown: false`.
- Keep tab styling consistent with `s.tabBarStyle` and color values from `useColorMode`.
- Hide the tab bar for full-screen flows with per-tab `tabBarStyle` when needed.

Existing examples hide the tab bar for `add`, `posts/editPost`, and `profile/profileImageCamera`.

## Stack Layouts

Each tab owns a `Stack` with consistent options:

```tsx
<Stack
  screenOptions={{
    headerStyle: { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) },
    headerTintColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]),
    contentStyle: { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: "minimal",
  }}
>
  <Stack.Screen name="index" options={{ title: "Profile" }} />
</Stack>
```

Prefer extending the nearest existing stack over adding a new layout. Only add a new `_layout.tsx` when the route subtree needs its own providers or distinct screen options.

## Dynamic Headers

Use `useNavigation()` with `useLayoutEffect` when a screen needs dynamic titles or header buttons:

```tsx
const navigation = useNavigation();

useLayoutEffect(() => {
  navigation.setOptions({
    title: profile.data ? `@${profile.data.username}` : username ? `@${username}` : "",
    headerRight: () => <Pressable onPress={handleMenuPress}>{/* icon */}</Pressable>,
  });
}, [navigation, profile.data, username]);
```

Use `useEffect` when setting a custom animated header from screen state, as in the feed screen. Keep dependencies complete so dark mode and safe area changes update the header.

## Screen Layout

For screens under tabs, account for the bottom tab bar:

```tsx
const tabBarHeight = useBottomTabBarHeight();

<ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight + 24 }} />
```

For lists, pass bottom padding through `contentContainerStyle`. Use `FlashList` for large lists and match the existing empty/error/footer conventions from the data-fetching skill.

Use `COLORS` and `useColorMode()` for route backgrounds and screen-specific UI. Avoid custom CSS or style tags.

## Checklist

- Put the file under the correct route group in `app/`.
- Add or update the nearest `_layout.tsx` with a matching `Stack.Screen` or `Tabs.Screen`.
- Use typed `useLocalSearchParams` for all route params.
- Navigate with object `router.push({ pathname, params })` when passing params.
- Keep navigation within the current tab stack unless intentionally switching tabs.
- Use `useBottomTabBarHeight()` for tabbed screen bottom padding.
- Use `useNavigation()` plus `useLayoutEffect` for dynamic titles/header buttons.
- Preserve auth, onboarding, and profile guards in layouts rather than duplicating them in screens.
- Keep screen names, titles, colors, and header behavior consistent with neighboring screens.
