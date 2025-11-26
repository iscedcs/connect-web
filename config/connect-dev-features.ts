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
    enableAllVisibilityActions: false,
    enableLongPressSelection: false,
    enableGrouping: false,
  },

  appointments: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: false,
    enableLongPressSelection: false,

    enableAutoProviderDetection: true,
    enableProviderUI: true,
  },

  spotify: {
    enableBulkActions: false,
    enableAllRestoreActions: false,
    enableAllVisibilityActions: false,
    enableLongPressSelection: false,
    enableAutoDetectType: true,
  },

  files: {
    enableLongPressSelection: true,
    enablePermanentDelete: true,
    enableBulkActions: false,
    enableBulkRestore: false, // future
    enableBulkVisibility: true, // future
    enableDownload: false,
  },

  contacts: {
    enableReorder: false,
    enableMerge: false,
  },

  gallery: {
    enableAlbums: false,
    enableBulkDelete: false,
  },

  global: {
    showDevTools: false,
  },
} as const;
