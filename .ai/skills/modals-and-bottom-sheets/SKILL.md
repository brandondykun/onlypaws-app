---
name: modals-and-bottom-sheets
description: Build OnlyPaws modal and bottom-sheet UI using @gorhom/bottom-sheet, BottomSheetModal, BottomSheetFlatList, ModalCard, confirmation sheets, report flows, refs, present/dismiss behavior, keyboard handling, and modal state reset. Use when adding or modifying modals, sheets, post menus, comments modal, confirmation actions, report modals, or bottom-sheet forms in the Expo app.
---

# Modals And Bottom Sheets

## Default Choice

Use the shared `@/shared/ui/BottomSheet/BottomSheet` wrapper for bottom-sheet UI. It already handles dark/light background, custom handle, backdrop, keyboard behavior, pan-to-close, and testing accessibility.

Use `ModalCard` and `ModalCardItemSeparator` for grouped option rows inside sheets.

Use simple screen-local state and refs for opening/closing:

```tsx
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";

const optionsModalRef = useRef<RNBottomSheetModal>(null);

optionsModalRef.current?.present();
optionsModalRef.current?.dismiss();
```

## Sheet Component Pattern

Reusable sheets usually receive a ref prop from the parent:

```tsx
type Props = {
  confirmSheetRef: React.RefObject<RNBottomSheetModal | null>;
  onConfirmPress: () => void;
};

const ConfirmSheet = ({ confirmSheetRef, onConfirmPress }: Props) => {
  return (
    <BottomSheetModal handleTitle="Options" ref={confirmSheetRef} enableDynamicSizing={true} snapPoints={[]}>
      <BottomSheetView style={{ paddingTop: 24, paddingBottom: 48, paddingHorizontal: 36 }}>
        {/* actions */}
      </BottomSheetView>
    </BottomSheetModal>
  );
};
```

Components that are opened directly by a parent can also use `forwardRef`, especially menu-style components:

```tsx
const PostMenu = forwardRef((props: Props, ref: ForwardedRef<RNBottomSheetModal>) => {
  return <BottomSheetModal handleTitle="Post Options" ref={ref} enableDynamicSizing={true} snapPoints={[]} />;
});
```

Set `displayName` after `forwardRef`.

## Sizing And Content

Use `enableDynamicSizing={true}` with `snapPoints={[]}` for short confirmation and option sheets.

Use explicit snap points for large forms or scrollable flows:

```tsx
<BottomSheetModal
  handleTitle="Report Post"
  ref={ref}
  snapPoints={["80%"]}
  keyboardBehavior="interactive"
  android_keyboardInputMode="adjustResize"
  enableDynamicSizing={false}
>
  <BottomSheetScrollView keyboardShouldPersistTaps="handled">{/* content */}</BottomSheetScrollView>
</BottomSheetModal>
```

Use:

- `BottomSheetView` for static content.
- `BottomSheetScrollView` for long forms or animated multi-step content.
- `BottomSheetFlatList` for paginated lists inside a sheet, like comments.
- `BottomSheetTextInput` from the shared wrapper for inputs that live inside bottom sheets.

## Option Rows

Option menus commonly use a rounded card with pressable rows:

```tsx
<ModalCard>
  <Pressable style={s.cardButton} onPress={handleAction}>
    <Text style={{ textAlign: "center", fontSize: 18 }}>Action</Text>
  </Pressable>
  <ModalCardItemSeparator />
</ModalCard>
```

Use red `COLORS.red[500]` or `COLORS.red[600]` for destructive actions. Use `pressed && { opacity: 0.5 }` or the shared `Pressable` component for press feedback.

## Opening Nested Sheets

When opening a nested confirmation or report sheet from another sheet, present the nested sheet and dismiss the current one if both should not remain visible:

```tsx
const handleShowReportModal = () => {
  reportModalRef.current?.present();
  mainMenuRef.current?.dismiss();
};
```

For delete flows, keep the main menu open only when the UX intentionally needs context. Otherwise dismiss both after success.

## State Reset

Reset transient modal state on dismiss or shortly after dismissing:

```tsx
const resetState = () => {
  setSelectedReasonId(null);
  setErrorText(null);
};

<BottomSheetModal ref={ref} onDismiss={resetState} handleTitle="Report Post">
  {/* content */}
</BottomSheetModal>
```

For smoother report/delete flows, this app sometimes delays reset until the dismiss animation completes:

```tsx
ref.current?.dismiss();
setTimeout(resetState, 300);
```

Clear form refs and reply/selection state when closing complex sheets like comments.

## Async Actions

Use local loading state for async actions and disable submit/cancel when needed:

```tsx
setLoading(true);
const { error } = await apiCall();

if (!error) {
  ref.current?.dismiss();
  toast.success("Done.");
} else {
  toast.error("There was an error.");
}

setLoading(false);
```

For destructive confirmations, dismiss the confirmation sheet and parent sheet after a successful mutation, then update React Query caches through the appropriate manager/context.

## Comments And List Sheets

For lists inside bottom sheets:

- Use `BottomSheetFlatList`.
- Enable the query only while the modal is open.
- Use `onChange` to track open state.
- Remove modal-scoped queries on close when stale sheet data should not persist.
- Reuse `ListEmptyComponent`, `RefreshControl`, and `LoadingRetryFooter`.
- Keep input footers outside the list but inside the `BottomSheetModal`.
- Add a local `<Toast config={toastConfig} />` when toasts must render above the sheet.

```tsx
const handleSheetChanges = useCallback((index: number) => {
  setIsModalOpen(index > -1);
  if (index === -1) {
    queryClient.removeQueries({ queryKey: commentsQueryKey });
  }
}, [queryClient, commentsQueryKey]);
```

## Checklist

- Use the shared `BottomSheetModal` wrapper, not `RNBottomSheetModal` directly for app UI.
- Type refs as `React.RefObject<RNBottomSheetModal | null>` or `ForwardedRef<RNBottomSheetModal>`.
- Use `present()` and `dismiss()` through refs.
- Use `enableDynamicSizing={true}` and `snapPoints={[]}` for compact sheets.
- Use explicit snap points plus `BottomSheetScrollView` for large forms.
- Use `ModalCard` for grouped option rows.
- Reset modal state in `onDismiss` or after the dismiss animation.
- Use local loading/error state for async actions.
- Dismiss parent/nested sheets deliberately after success or navigation.
- Use `BottomSheetFlatList` and modal-open query gating for paginated sheet lists.
