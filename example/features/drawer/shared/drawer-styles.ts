import { StyleSheet } from "react-native";
import { drawerTheme } from "./drawer-theme";

export const drawerStyles = StyleSheet.create({
  playgroundRoot: {
    flex: 1,
  },
  screenContent: {
    padding: drawerTheme.spacing.screenPadding,
    gap: drawerTheme.spacing.sectionGap,
  },
  sectionTitle: {
    fontSize: drawerTheme.typography.sectionTitleSize,
    fontWeight: "700",
  },
  sectionHint: {
    fontSize: drawerTheme.typography.sectionHintSize,
    lineHeight: drawerTheme.typography.sectionHintLineHeight,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  input: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#94a3b8",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    color: "#111827",
  },
  metaText: {
    fontSize: 13,
    color: "#334155",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    borderRadius: 14,
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sheetOverlay: {
    justifyContent: "flex-end",
  },
  sheetCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#cbd5e1",
    padding: 14,
    gap: 8,
    minHeight: 220,
  },
});
