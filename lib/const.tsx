export const NEXT_PUBLIC_CONNECT_API_ORIGIN =
  process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL;
export const AUTH_API = process.env.NEXT_PUBLIC_LIVE_ISCEAUTH_BACKEND_URL;
export const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const URLS = {
  contact: {
    leave: "/api/contact/leave",
    recieved: "/api/contact/received",
    one: "/api/contact/one/{id}",
    delete: "/api/contact/delete/{id}",
    search: "/api/contact/search",
    recent: "/api/contact/recent",
    stats: "/api/contact/stats",
  },
  profile: {
    create: "/api/profile/create",
    profile: "/api/profile/me",
    update: "/api/profile/update",
    delete: "/api/profile/delete",
    stats: "/api/profile/stats",
  },
  social: {
    add: "/api/social/add",
    all: "/api/social/all",
    one: "/api/social/one/{id}",
    update: "/api/social/update/{id}",
    delete_one: "/api/social/delete/{id}",
    delete_all: "/api/social/all/delete",
    platform: "/api/social/platform/{platform}",
    stats: "/api/social/stats/overview",
  },
  notification: {
    create: "/api/notification/create",
    all: "/api/notification/all",
    one: "/api/notification/one/{id}",
    read_one: "/api/notification/read/{id}",
    read_all: "/api/notification/read-all",
    delete: "/api/notification/delete/{id}",
    unread: "/api/notification/unread",
    type: "/api/notification/type/{type}",
    recent: "/api/notification/recent",
    stats: "/api/notification/stats",
  },
  support: {
    submit: "/api/support-request/submit",
    all: "/api/support-request/all",
    one: "/api/support-request/one/{id}",
    update: "/api/support-request/update/{id}",
    delete: "/api/support-request/update/{id}",
    search: "/api/support-request/search",
    recent: "/api/support-request/recent",
    stats: "/api/support-request/stats",
  },
  card: {
    record: "/api/card-interactions/record",
    all: "/api/card-interactions/all",
    one: "/api/card-interactions/one/{id}",
    update: "/api/card-interactions/update/{id}",
    delete: "/api/card-interactions/delete/{id}",
    method: "/api/card-interactions/method/{method}",
    device: "/api/card-interactions/device/{deviceId}",
    recent: "/api/card-interactions/recent",
    stats: "/api/card-interactions/stats",
    date_range: "/api/card-interactions/date-range",
  },
  user: {
    one: "/user/one/{id}",
  },
  device: {
    create: "/device/create",
  },
};
