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
    enableAllVisibilityActions: true,
    enableGetVideoPlatform: false,
    enableLongPressSelection: true,
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

  forms: {
    enableBulkActions: false,
    enableBulkRestore: false,
    enableBulkVisible: false,

    enableLongPressSelection: true,

    enableCustomTemplates: false, // create_custom_template
    enableTemplateCreation: false, // from template
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
