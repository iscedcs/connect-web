export const CONNECT_DEV_FEATURES = {
  links: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: false,
    enableReorder: false,
    enableLongPressSelection: true,
    enableAutoCategoryGrouping: false, // A: auto-detect + group links by category
    enableCategoryUI: false, // C: show category headers, collapse/expand
    enableUserCategoryOverride: false, // C: allow editing category per link
    enableCategoryManagement: false, // C: full category creation/rename/delete
  },
  videos: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: false,
    enableGetVideoPlatform: false,
    enableLongPressSelection: true,
  },

  contacts: {
    enableReorder: false,
    enableMerge: false,
  },

  // future modules...
  gallery: {
    enableAlbums: false,
    enableBulkDelete: false,
  },

  // global toggles
  global: {
    showDevTools: false, // overrides showing internal DEV UI
  },
} as const;
