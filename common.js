const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function getSettings() {
  const { data } = await db.from("settings").select("*").eq("id", 1).single();
  return data || {};
}

// Barre du haut + menu avec les catégories (boutons arrondis)
async function renderHeader(s, admin = false, activeId = null) {
  const name = s.site_name || "THE312RP";
  document.title = name;
  if (s.background_url) {
    document.body.style.backgroundImage = `linear-gradient(#141414bb,#141414e6), url("${s.background_url}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  }
  const discordUrl = s.discord_url ? esc(s.discord_url) : "";
  const top = !admin && discordUrl
    ? `<div class="topbar">N'oublie pas de rejoindre notre Discord · <a href="${discordUrl}" target="_blank" rel="noopener">Rejoindre</a></div>`
    : "";
  const head = (pills) => `${top}
    <div class="nav">
      <a class="logo" href="index.html">${esc(name)}</a>
      <nav class="pills">${pills}</nav>
      <div class="nav-right">${!admin && discordUrl ? `<a class="btn" href="${discordUrl}" target="_blank" rel="noopener">Discord</a>` : ""}</div>
    </div>`;
  const box = document.getElementById("header");
  box.innerHTML = head("");
  if (admin) return;
  const { data } = await db.from("categories").select("*").order("position").order("created_at");
  box.innerHTML = head(
    `<a href="index.html" class="${activeId ? "" : "active"}">Accueil</a>` +
      (data || []).map((c) => `<a href="category.html?id=${c.id}" class="${c.id === activeId ? "active" : ""}">${esc(c.name)}</a>`).join("")
  );
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

// Liste des photos d'un élément (compatible avec l'ancien champ image_url)
function imgs(i) {
  return i.images && i.images.length ? i.images : i.image_url ? [i.image_url] : [];
}
