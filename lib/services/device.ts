type BaseRes<T = any> = { ok: boolean; status: number; data: T };

const baseInit: RequestInit = {
  cache: "no-store",
};

export async function verifyDeviceToken(params: {
  token: string;
  userId: string;
  init?: RequestInit;
}) {
  const res = await fetch("/api/device/verify-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: params.token, userId: params.userId }),
    ...baseInit,
    ...(params.init ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function createDevice(params: {
  token: string;
  productId: string;
  init?: RequestInit;
}) {
  const res = await fetch("/api/device/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: params.token, productId: params.productId }),
    ...baseInit,
    ...(params.init ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
