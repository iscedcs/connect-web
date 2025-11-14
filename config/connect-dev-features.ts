export const CONNECT_DEV_FEATURES = {
  videos: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: false,
    enableGetVideoPlatform: false,
    enableLongPressSelection: true,
  },

  links: {
    enableReorder: false,
    enableBulkActions: false,
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
