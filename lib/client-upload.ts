export async function uploadImage(file: File, folder: "profiles" | "covers") {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/upload?folder=${folder}`, {
    method: "POST",
    body: fd,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Upload failed");
  return json as { url: string; key: string };
}
