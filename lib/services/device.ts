export async function verifyDeviceToken(params: {
  token: string;
  userId: string;
}) {
  const res = await fetch("/api/device/verify-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function createDevice(params: {
  token: string;
  productId: string;
}) {
  const res = await fetch("/api/device/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}
