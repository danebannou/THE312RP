const products = [
  { id: 1, name: "Casque audio", cat: "Électronique", price: 59, icon: "🎧" },
  { id: 2, name: "Clavier mécanique", cat: "Électronique", price: 79, icon: "⌨️" },
  { id: 3, name: "T-shirt noir", cat: "Mode", price: 19, icon: "👕" },
  { id: 4, name: "Sneakers", cat: "Mode", price: 89, icon: "👟" },
  { id: 5, name: "Lampe de bureau", cat: "Maison", price: 29, icon: "💡" },
  { id: 6, name: "Mug", cat: "Maison", price: 9, icon: "☕" },
  { id: 7, name: "Sac à dos", cat: "Mode", price: 49, icon: "🎒" },
  { id: 8, name: "Souris gaming", cat: "Électronique", price: 39, icon: "🖱️" },
];

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let category = "Tout";
let query = "";

const $ = (id) => document.getElementById(id);

function renderFilters() {
  const cats = ["Tout", ...new Set(products.map((p) => p.cat))];
  $("filters").innerHTML = cats
    .map((c) => `<button class="${c === category ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderGrid() {
  const list = products.filter(
    (p) => (category === "Tout" || p.cat === category) && p.name.toLowerCase().includes(query)
  );
  $("grid").innerHTML = list
    .map(
      (p) => `<div class="card"><div class="img">${p.icon}</div><div class="body">
      <span class="cat">${p.cat}</span><h3>${p.name}</h3>
      <span class="price">${p.price} €</span>
      <button data-add="${p.id}">Ajouter au panier</button></div></div>`
    )
    .join("") || "<p>Aucun produit trouvé.</p>";
}

function renderCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  $("count").textContent = cart.length;
  $("cartItems").innerHTML = cart
    .map((p, i) => `<li><span>${p.icon} ${p.name} — ${p.price} €</span><button data-rm="${i}">✕</button></li>`)
    .join("");
  $("total").textContent = cart.reduce((s, p) => s + p.price, 0) + " €";
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.cat) { category = t.dataset.cat; renderFilters(); renderGrid(); }
  if (t.dataset.add) { cart.push(products.find((p) => p.id == t.dataset.add)); renderCart(); }
  if (t.dataset.rm) { cart.splice(t.dataset.rm, 1); renderCart(); }
});
$("search").addEventListener("input", (e) => { query = e.target.value.toLowerCase(); renderGrid(); });
$("cartBtn").onclick = () => ($("cart").hidden = false);
$("closeCart").onclick = () => ($("cart").hidden = true);
$("checkout").onclick = () => alert("Commande simulée ! Branche Stripe pour de vrais paiements.");

renderFilters(); renderGrid(); renderCart();
