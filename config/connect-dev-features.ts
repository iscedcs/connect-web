export const CONNECT_DEV_FEATURES = {
  links: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: false,
    enableReorder: false,
    enableLongPressSelection: false,
    enableAutoCategoryGrouping: false,
    enableCategoryUI: false,
    enableCategoryManagement: false,
  },
  videos: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: false,
    enableGetVideoPlatform: false,
    enableLongPressSelection: false,
  },

  meetings: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: false,
    enableGetByProvider: false,
    enableLongPressSelection: false,
  },

  social: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: true,
    enableLongPressSelection: true,
    enableGrouping: false, // future
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
