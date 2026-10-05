const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function getSettings() {
  const { data } = await db.from("settings").select("*").eq("id", 1).single();
  return data || {};
}

function renderHeader(s, admin = false) {
  document.title = s.site_name || "THE312RP";
  const discord = s.discord_url
    ? `<a class="btn discord" href="${esc(s.discord_url)}" target="_blank" rel="noopener">Discord</a>`
    : "";
  document.getElementById("header").innerHTML = `
    <a class="logo" href="index.html">${esc(s.site_name || "THE312RP")}</a>
    <nav>${admin ? "" : discord}</nav>`;
}

// Recadre l'image en 1920x1080 (16:9) et la compresse en WebP
async function processImage(file) {
  const bmp = await createImageBitmap(file);
  const c = document.createElement("canvas");
  c.width = 1920;
  c.height = 1080;
  const scale = Math.max(1920 / bmp.width, 1080 / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;
  c.getContext("2d").drawImage(bmp, (1920 - w) / 2, (1080 - h) / 2, w, h);
  return new Promise((resolve) => c.toBlob(resolve, "image/webp", 0.85));
}

async function uploadImage(file) {
  const blob = await processImage(file);
  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await db.storage.from("images").upload(path, blob, { contentType: "image/webp" });
  if (error) throw error;
  return db.storage.from("images").getPublicUrl(path).data.publicUrl;
}

async function deleteImage(url) {
  if (!url) return;
  const name = url.split("/").pop();
  await db.storage.from("images").remove([name]);
}
