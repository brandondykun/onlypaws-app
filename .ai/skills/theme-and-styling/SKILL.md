---
name: theme-and-styling
description: Apply OnlyPaws React Native theme and styling conventions. Use when adding or modifying colors, dark mode, light mode, StyleSheet styles, Text, Button, TextInput, Pressable, cards, status badges, route backgrounds, tab/header colors, spacing, typography, or UI states in the Expo app.
---

# Theme And Styling

## Core Primitives

Use `COLORS` from `@/constants/Colors` for app colors. Do not introduce ad hoc hex values unless there is a strong reason and nearby code already does it.

Use `useColorMode()` for light/dark decisions:

```tsx
const { isDarkMode, setLightOrDark } = useColorMode();
```

Use `setLightOrDark(lightColor, darkColor)` when assigning paired colors:

```tsx
backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900])
```

Use `isDarkMode` when branching is clearer, especially in route layouts or icon colors:

```tsx
headerTintColor: isDarkMode ? COLORS.zinc[50] : COLORS.zinc[950]
```

## Text

Prefer the shared `Text` component from `@/components/Text/Text` instead of React Native `Text`. It defaults to `COLORS.zinc[50]` in dark mode and `COLORS.zinc[950]` in light mode.

Use `darkColor` and `lightColor` for secondary text:

```tsx
<Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
  Profiles you block will appear here.
</Text>
```

Common text conventions:

- Titles: `fontSize` around `20`-`22`, `fontWeight: "600"` or `"700"`.
- Body text: `fontSize` around `16`.
- Secondary/meta text: `fontSize` around `13`-`14`, zinc `400`-`600`.
- Uppercase labels: `fontSize: 13`, `fontWeight: "500"`, `textTransform: "uppercase"`, `letterSpacing: 0.5`.

## Buttons And Pressables

Use the shared `Button` component for standard actions. Prefer variants instead of rebuilding styles:

- `primary` for main actions.
- `secondary` for less prominent actions.
- `outline` for bordered actions.
- `text` for inline links or retry-style actions.

Use `buttonStyle` and `textStyle` only for screen-specific adjustments, such as destructive red buttons:

```tsx
<Button buttonStyle={{ backgroundColor: COLORS.red[600] }} text="Discard" />
```

Use the shared `Pressable` component when you want opacity feedback. For inline React Native pressables, match the local convention:

```tsx
style={({ pressed }) => [pressed && { opacity: 0.5 }]}
```

## Inputs

Use the shared `TextInput` component for regular forms. It already handles labels, focus borders, errors, clear buttons, secure text toggle, character count, and light/dark colors.

Use `focusedBorderColor`, `inputStyle`, `rootStyle`, and `errorStyle` for local variants instead of copying the component.

For bottom sheets, use `BottomSheetTextInput` from `@/shared/ui/BottomSheet/BottomSheet`.

## Surfaces And Cards

Common surface colors:

```tsx
backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900])
```

Common card shape:

```tsx
card: {
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
}
```

Use `ModalCard` for grouped modal/sheet option rows. It uses `borderRadius: 16`, `overflow: "hidden"`, and light/dark zinc backgrounds.

Use separators with paired zinc colors:

```tsx
backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[700])
```

## Route And Screen Backgrounds

Stack layouts should set both header and content colors:

```tsx
screenOptions={{
  headerStyle: { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) },
  headerTintColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]),
  contentStyle: { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: "minimal",
}}
```

Feed-style screens commonly use `COLORS.zinc[200]` in light mode and `COLORS.zinc[950]` in dark mode. Auth/root screens may use lighter `COLORS.zinc[50]` backgrounds.

For tabbed screens, account for the tab bar with `useBottomTabBarHeight()` and bottom padding.

## Status, Feedback, And Semantic Colors

Use semantic palettes consistently:

- Destructive/error: `COLORS.red[500]` or `COLORS.red[600]`.
- Primary accent/action: `COLORS.sky[500]` or `COLORS.sky[600]`.
- Success/resolved: `COLORS.lime[500]`.
- Warning/pending: `COLORS.amber[500]`.
- Neutral/dismissed/disabled: zinc `400`-`600`.

Status badges use a tinted background plus saturated text:

```tsx
<View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[status] + "20" }]}>
  <Text style={[s.statusText, { color: STATUS_COLORS[status] }]}>{label}</Text>
</View>
```

Use `toast.success`, `toast.error`, and `toast.info` for feedback rather than custom transient UI unless the component already has inline error state.

## Style Organization

Use `StyleSheet.create` for stable reusable styles at the bottom of the file:

```tsx
const s = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
});
```

Use inline style arrays for theme-dependent values:

```tsx
<View style={[s.card, { backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) }]} />
```

Keep local style names short and descriptive, usually via `const s = StyleSheet.create(...)`. Avoid stylesheet churn or broad refactors when only one component needs a small style change.

## Checklist

- Import colors from `@/constants/Colors`.
- Use `useColorMode()` for all light/dark choices.
- Prefer shared `Text`, `Button`, `TextInput`, and `Pressable` components.
- Use `darkColor` and `lightColor` for secondary text.
- Use zinc surfaces for cards and screen backgrounds.
- Use sky, red, lime, and amber only for semantic/accent states.
- Set both header and content background colors in stack layouts.
- Put reusable styles in `StyleSheet.create`; keep theme-dependent colors inline with style arrays.
- Preserve existing spacing, border radius, and typography patterns near the code being edited.
