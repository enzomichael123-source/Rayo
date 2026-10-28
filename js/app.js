// Rayo — protótipo de loja (sem servidor). Rotas por hash: #/ #/catalogo #/produto/1 #/carrinho #/checkout
const $ = (s, r = document) => r.querySelector(s);
const app = $("#app");
const brl = n => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const CATS = { inverno: "Inverno", verao: "Verão", novidades: "Novidades", sale: "Sale" };
const FRETE = 19.9, FRETE_GRATIS = 399; // valores demonstrativos
let cart = [], coupon = "";
try { cart = JSON.parse(localStorage.getItem("rayo-cart")) || []; coupon = localStorage.getItem("rayo-coupon") || ""; } catch (e) {}

function save() {
  try { localStorage.setItem("rayo-cart", JSON.stringify(cart)); localStorage.setItem("rayo-coupon", coupon); } catch (e) {}
  $("#count").textContent = cart.reduce((a, i) => a + i.qty, 0);
}
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2600);
}
function totals() {
  const sub = cart.reduce((a, i) => a + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0);
  const disc = coupon === "RAYO10" ? sub * 0.1 : 0; // cupom apenas demonstrativo
  const ship = cart.length === 0 || sub - disc >= FRETE_GRATIS ? 0 : FRETE;
  return { sub, disc, ship, total: sub - disc + ship };
}
const photo = (src, alt, pos, cls) => `<div class="ph ${cls || ""}" style="--pos:${pos || "center"}"><span>Foto de demonstração</span><img src="${src}" alt="${alt}" onerror="this.remove()"></div>`;
const art = (p, big) => photo(p.img, p.alt, p.pos, big ? "big" : "");
const card = p => `<a class="card" href="#/produto/${p.id}">${art(p)}
  <h3>${p.name}</h3>
  <p class="price">${p.old ? `<s>${brl(p.old)}</s> ` : ""}${brl(p.price)}${p.old ? ' <span class="tag">Promoção</span>' : ""}${p.stock ? "" : ' <span class="tag off">Esgotado</span>'}</p></a>`;

// ---------- Início ----------
function home() {
  const novos = PRODUCTS.filter(p => p.isNew).slice(0, 4), top = [...PRODUCTS].sort((a, b) => b.pop - a.pop).slice(0, 4);
  const col = k => `<a class="col" href="#/catalogo?cat=${k}">${photo(IMAGENS[k].src, IMAGENS[k].alt, IMAGENS[k].pos)}<span>${CATS[k]}</span></a>`;
  return `<section class="hero"><div><h1>Vestidos que chamam atenção.</h1>
    <p>Cortes marcantes, tecidos fluidos e detalhes que fazem a diferença.</p><a class="btn" href="#/catalogo">Ver a coleção</a></div>
    ${photo(IMAGENS.hero.src, IMAGENS.hero.alt, IMAGENS.hero.pos, "hero-img")}</section>
  <section class="wrap"><h2>Coleções</h2><div class="cols">${col("inverno")}${col("verao")}</div>
    <p class="quick"><a href="#/catalogo?cat=novidades">Ver novidades</a><a href="#/catalogo?cat=sale">Ver sale</a></p></section>
  <section class="wrap"><h2>Novidades</h2><div class="grid">${novos.map(card).join("")}</div></section>
  <section class="wrap"><h2>Mais vendidos</h2><div class="grid">${top.map(card).join("")}</div></section>
  <section class="benefits"><p><b>Entrega</b> opções calculadas no checkout (demonstrativo)</p><p><b>Pagamento</b> formas definidas ao integrar um provedor</p><p><b>Trocas</b> política editável em “Sobre a Rayo”</p></section>`;
}

// ---------- Catálogo ----------
const F = { cat: "", q: "", size: "", price: "", stock: false, sort: "new" };
function catalog(params) {
  F.cat = params.get("cat") || ""; F.q = params.get("q") || ""; F.sort = params.get("sort") || "new";
  F.size = ""; F.price = ""; F.stock = false;
  app.innerHTML = `<div class="wrap"><h1>${F.cat ? CATS[F.cat] || "Catálogo" : "Catálogo"}</h1>
  <form class="filters" id="filters" aria-label="Filtros">
    <label>Categoria<select name="cat"><option value="">Todas</option>${Object.entries(CATS).map(([k, v]) => `<option value="${k}"${F.cat === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
    <label>Tamanho<select name="size"><option value="">Todos</option>${["P", "M", "G", "36", "38", "40", "42"].map(s => `<option>${s}</option>`).join("")}</select></label>
    <label>Preço<select name="price"><option value="">Qualquer</option><option value="0-150">Até R$ 150</option><option value="150-250">R$ 150 a R$ 250</option><option value="250-9999">Acima de R$ 250</option></select></label>
    <label>Ordenar<select name="sort"><option value="new">Novidades</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option><option value="pop">Mais vendidos</option></select></label>
    <label class="chk"><input type="checkbox" name="stock"> Só disponíveis</label>
    <label>Buscar<input type="search" name="q" value="${F.q}" placeholder="Nome ou descrição"></label>
  </form><p id="n" class="small" aria-live="polite"></p><div id="grid" class="grid"></div></div>`;
  $("#filters [name=sort]").value = F.sort;
  $("#filters").addEventListener("input", e => {
    const f = e.target.form; F.cat = f.cat.value; F.size = f.size.value; F.price = f.price.value;
    F.sort = f.sort.value; F.stock = f.stock.checked; F.q = f.q.value; grid();
  });
  $("#filters").addEventListener("submit", e => e.preventDefault());
  grid();
}
function grid() {
  const q = F.q.trim().toLowerCase(), [lo, hi] = F.price ? F.price.split("-").map(Number) : [0, 1e9];
  let list = PRODUCTS.filter(p => (!F.cat || (F.cat === "sale" ? p.old : F.cat === "novidades" ? p.isNew : p.cat === F.cat)) &&
    (!F.size || p.sizes.includes(F.size)) && p.price >= lo && p.price <= hi && (!F.stock || p.stock) &&
    (!q || (p.name + " " + p.desc).toLowerCase().includes(q)));
  const by = { asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price, pop: (a, b) => b.pop - a.pop, new: (a, b) => b.isNew - a.isNew || b.id - a.id };
  list.sort(by[F.sort]);
  $("#n").textContent = `${list.length} produto${list.length === 1 ? "" : "s"}`;
  $("#grid").innerHTML = list.length ? list.map(card).join("") :
    `<p class="empty">Nenhum produto encontrado. Tente outro termo ou limpe os filtros.</p>`;
}

// ---------- Produto ----------
function product(id) {
  const p = PRODUCTS.find(x => x.id === +id);
  if (!p) return notFound();
  app.innerHTML = `<div class="wrap detail"><div>${art(p, true)}</div><form id="buy" novalidate>
    <h1>${p.name}</h1><p class="price big">${p.old ? `<s>${brl(p.old)}</s> ` : ""}${brl(p.price)}</p><p>${p.desc}</p>
    ${p.sizes.length ? `<fieldset><legend>Tamanho</legend>${p.sizes.map(s => `<label class="size"><input type="radio" name="size" value="${s}"><span>${s}</span></label>`).join("")}</fieldset>` : ""}
    <p class="err" id="err" role="alert"></p>
    <label>Quantidade <input type="number" name="qty" min="1" max="10" value="1"></label>
    <button class="btn" ${p.stock ? "" : "disabled"}>${p.stock ? "Adicionar ao carrinho" : "Produto esgotado"}</button>
    ${Object.entries(DETAILS).map(([k, v]) => `<details><summary>${k}</summary><p>${v}</p></details>`).join("")}
  </form></div>`;
  $("#buy").addEventListener("submit", e => {
    e.preventDefault(); const f = e.target, size = p.sizes.length ? (f.size.value || "") : "-";
    const qty = Math.max(1, Math.min(10, +f.qty.value || 1));
    if (!size) { $("#err").textContent = "Escolha um tamanho antes de adicionar ao carrinho."; return; }
    $("#err").textContent = "";
    const it = cart.find(i => i.id === p.id && i.size === size);
    it ? it.qty = Math.min(10, it.qty + qty) : cart.push({ id: p.id, size, qty });
    save(); toast(`${p.name} foi adicionado ao carrinho.`);
  });
}

// ---------- Carrinho ----------
function cartView() {
  if (!cart.length) { app.innerHTML = `<div class="wrap"><h1>Carrinho</h1><p class="empty">Seu carrinho está vazio.</p><a class="btn" href="#/catalogo">Continuar comprando</a></div>`; return; }
  const t = totals();
  app.innerHTML = `<div class="wrap two"><div><h1>Carrinho</h1>${cart.map((i, n) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `<div class="row">${art(p)}<div><h3>${p.name}</h3><p class="small">Tamanho: ${i.size} · ${brl(p.price)} cada</p>
      <div class="qty"><button data-a="dec" data-n="${n}" aria-label="Diminuir quantidade de ${p.name}">−</button><span aria-live="polite">${i.qty}</span><button data-a="inc" data-n="${n}" aria-label="Aumentar quantidade de ${p.name}">+</button>
      <button class="link" data-a="del" data-n="${n}">Remover</button></div></div><b>${brl(p.price * i.qty)}</b></div>`;
  }).join("")}</div>
  <aside class="sum"><h2>Resumo</h2>
    <form id="cp"><label for="cup">Cupom (demonstrativo)</label><input id="cup" value="${coupon}" placeholder="Tente RAYO10"><button class="btn alt">Aplicar</button></form>
    <p class="small" id="cpm"></p>${summary(t)}<a class="btn" href="#/checkout">Ir para o checkout</a></aside></div>`;
}
const summary = t => `<dl><dt>Subtotal</dt><dd>${brl(t.sub)}</dd>${t.disc ? `<dt>Cupom</dt><dd>− ${brl(t.disc)}</dd>` : ""}
  <dt>Frete (demonstrativo)</dt><dd>${t.ship ? brl(t.ship) : "Grátis"}</dd><dt><b>Total</b></dt><dd><b>${brl(t.total)}</b></dd></dl>`;
document.addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return; const i = cart[+b.dataset.n];
  if (b.dataset.a === "inc") i.qty = Math.min(10, i.qty + 1);
  if (b.dataset.a === "dec") i.qty = Math.max(1, i.qty - 1);
  if (b.dataset.a === "del") cart.splice(+b.dataset.n, 1);
  save(); cartView();
});
document.addEventListener("submit", e => {
  if (e.target.id !== "cp") return; e.preventDefault();
  const v = $("#cup").value.trim().toUpperCase(); coupon = v === "RAYO10" ? v : ""; save(); cartView();
  $("#cpm").textContent = coupon ? "Cupom de demonstração aplicado: 10%." : "Cupom inválido. Não há integração real de cupons.";
});

// ---------- Checkout ----------
const FIELDS = [["nome", "Nome completo"], ["email", "E-mail", "email"], ["tel", "Telefone"], ["cep", "CEP"], ["rua", "Endereço"], ["num", "Número"], ["cidade", "Cidade"], ["uf", "Estado"]];
function checkout() {
  if (!cart.length) return location.hash = "#/carrinho";
  app.innerHTML = `<div class="wrap two"><form id="ck" novalidate><h1>Checkout demonstrativo</h1>
    <p class="small">Nenhum pagamento é cobrado e nenhum dado é enviado ou salvo. Não digite dados de cartão.</p>
    ${FIELDS.map(([k, l, t]) => `<label for="${k}">${l}</label><input id="${k}" name="${k}" type="${t || "text"}" aria-describedby="e-${k}" required><span class="err" id="e-${k}"></span>`).join("")}
    <button class="btn">Concluir pedido de demonstração</button></form>
    <aside class="sum"><h2>Seu pedido</h2>${cart.map(i => { const p = PRODUCTS.find(x => x.id === i.id); return `<p>${i.qty}× ${p.name} (${i.size})</p>`; }).join("")}${summary(totals())}</aside></div>`;
  $("#ck").addEventListener("submit", e => {
    e.preventDefault(); let bad = null;
    FIELDS.forEach(([k, l]) => {
      const el = $("#" + k), v = el.value.trim(); let m = "";
      if (!v) m = `Preencha o campo ${l.toLowerCase()}.`;
      else if (k === "email" && !/^\S+@\S+\.\S+$/.test(v)) m = "Digite um e-mail válido, como nome@email.com.";
      $("#e-" + k).textContent = m; el.setAttribute("aria-invalid", !!m); if (m && !bad) bad = el;
    });
    if (bad) return bad.focus();
    const nome = $("#nome").value.trim(); cart = []; coupon = ""; save();
    app.innerHTML = `<div class="wrap"><h1>Pedido de demonstração concluído</h1><p></p><p>Nenhum pedido foi enviado e nada foi cobrado.</p><a class="btn" href="#/">Voltar ao início</a></div>`;
    $("p", app).textContent = `Obrigada, ${nome}! Em uma loja real, aqui você receberia a confirmação por e-mail.`;
  });
}

const notFound = () => app.innerHTML = `<div class="wrap"><h1>Página não encontrada</h1><a class="btn" href="#/">Voltar ao início</a></div>`;
function route() {
  const [path, qs] = (location.hash.slice(1) || "/").split("?"), params = new URLSearchParams(qs || "");
  const [, page, arg] = path.split("/");
  if (!page) app.innerHTML = home();
  else if (page === "catalogo") catalog(params);
  else if (page === "produto") product(arg);
  else if (page === "carrinho") cartView();
  else if (page === "checkout") checkout();
  else if (page === "sobre") app.innerHTML = `<div class="wrap"><h1>Sobre a Rayo</h1><p>Texto institucional de demonstração: edite aqui sua história, política de trocas e privacidade.</p></div>`;
  else notFound();
  window.scrollTo(0, 0); if (page) app.focus({ preventScroll: true });
}
window.addEventListener("hashchange", route);
$("#search").addEventListener("submit", e => { e.preventDefault(); location.hash = "#/catalogo?q=" + encodeURIComponent($("#q").value); });
$("#account").addEventListener("click", () => toast("Conta demonstrativa: login real exige um backend."));
$("#news").addEventListener("submit", e => { e.preventDefault(); e.target.reset(); toast("Cadastro demonstrativo: nada foi enviado."); });
save(); route();
