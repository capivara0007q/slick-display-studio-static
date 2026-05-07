// Painel admin standalone — PromoJá Benefícios
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = "https://jtysxvatbjpzepejoqkn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eXN4dmF0YmpwemVwZWpvcWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTk3ODEsImV4cCI6MjA5MzA3NTc4MX0.aGLF9u1FxKweSxOitXc1snO-GK8Y0iMDBord0R2ZDq0";
const STORAGE_PUBLIC = `${SUPABASE_URL}/storage/v1/object/public`;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storageKey: "painel-promoja-auth", persistSession: true, autoRefreshToken: true },
});

// ---------- DOM helpers ----------
const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, children = []) => {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "style") Object.assign(e.style, v);
    else e.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null || c === false) return;
    e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return e;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("pt-BR") : "—";

function toast(msg, type = "") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => (t.className = "toast"), 3000);
}

function openModal(title, contentEl) {
  $("#modal-title").textContent = title;
  $("#modal-body").innerHTML = "";
  $("#modal-body").appendChild(contentEl);
  $("#modal").classList.remove("hidden");
}
function closeModal() { $("#modal").classList.add("hidden"); }
$("#modal-close").addEventListener("click", closeModal);
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

// ---------- AUTH ----------
async function checkAdmin(userId) {
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return !!data?.some((r) => r.role === "admin");
}

async function bootstrap() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    const ok = await checkAdmin(session.user.id);
    if (ok) return showApp(session.user);
    await sb.auth.signOut();
  }
  showLogin();
}

function showLogin() {
  $("#login-screen").classList.remove("hidden");
  $("#app-screen").classList.add("hidden");
}
function showApp(user) {
  $("#login-screen").classList.add("hidden");
  $("#app-screen").classList.remove("hidden");
  $("#user-email").textContent = user.email;
  loadTab("dashboard");
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  const password = $("#password").value;
  const btn = $("#login-btn");
  const errEl = $("#login-error");
  errEl.textContent = "";
  btn.disabled = true; btn.textContent = "Entrando...";
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const ok = await checkAdmin(data.user.id);
    if (!ok) {
      await sb.auth.signOut();
      throw new Error("Esta conta não é administradora.");
    }
    showApp(data.user);
  } catch (err) {
    errEl.textContent = err.message || "Erro ao entrar";
  } finally {
    btn.disabled = false; btn.textContent = "Entrar";
  }
});

$("#logout-btn").addEventListener("click", async () => {
  await sb.auth.signOut();
  location.reload();
});

// ---------- NAV ----------
document.querySelectorAll(".nav-item").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    loadTab(b.dataset.tab);
  });
});

const TABS = {
  dashboard: { title: "Dashboard", render: renderDashboard },
  usuarios: { title: "Usuários", render: renderUsuarios },
  categorias: { title: "Categorias", render: renderCategorias },
  lojas: { title: "Lojas", render: renderLojas },
  cupons: { title: "Cupons", render: renderCupons },
  solicitacoes: { title: "Análise de Cupom", render: renderSolicitacoes },
  lojistas: { title: "Lojistas (Validador)", render: renderLojistas },
  notificacoes: { title: "Enviar Notificação", render: renderNotificacoes },
};
async function loadTab(name) {
  const tab = TABS[name];
  $("#page-title").textContent = tab.title;
  $("#page-content").innerHTML = '<p class="muted" style="padding:20px">Carregando...</p>';
  try { await tab.render(); }
  catch (e) { $("#page-content").innerHTML = `<p class="empty">Erro: ${e.message}</p>`; }
}

// ---------- UPLOAD HELPER ----------
async function uploadFile(bucket, file) {
  if (!file) return null;
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  return `${STORAGE_PUBLIC}/${bucket}/${path}`;
}

// ============= DASHBOARD =============
async function renderDashboard() {
  const [users, lojas, cupons, solicit, pendentes] = await Promise.all([
    sb.from("profiles").select("id", { count: "exact", head: true }),
    sb.from("lojas").select("id", { count: "exact", head: true }),
    sb.from("cupons").select("id", { count: "exact", head: true }),
    sb.from("solicitacoes").select("id", { count: "exact", head: true }),
    sb.from("solicitacoes").select("id", { count: "exact", head: true }).eq("status", "pendente"),
  ]);
  const pendentesUsr = await sb.from("profiles").select("id", { count: "exact", head: true }).eq("approval_status", "pendente");

  const c = el("div");
  c.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="stat-label">Usuários</div><div class="stat-value">${users.count ?? 0}</div></div>
      <div class="stat"><div class="stat-label">Aprovações pendentes</div><div class="stat-value warn">${pendentesUsr.count ?? 0}</div></div>
      <div class="stat"><div class="stat-label">Lojas</div><div class="stat-value">${lojas.count ?? 0}</div></div>
      <div class="stat"><div class="stat-label">Cupons</div><div class="stat-value">${cupons.count ?? 0}</div></div>
      <div class="stat"><div class="stat-label">Solicitações totais</div><div class="stat-value">${solicit.count ?? 0}</div></div>
      <div class="stat"><div class="stat-label">Solicitações pendentes</div><div class="stat-value warn">${pendentes.count ?? 0}</div></div>
    </div>
    <p class="muted" style="margin-top:20px">Use o menu à esquerda para gerenciar cada área.</p>
  `;
  $("#page-content").replaceChildren(c);
}

// ============= USUÁRIOS =============
async function renderUsuarios() {
  const { data, error } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;

  const wrap = el("div");
  wrap.appendChild(el("div", { class: "section-head" }, [
    el("h3", {}, `${data.length} usuário(s)`),
  ]));

  if (!data.length) { wrap.appendChild(el("p", { class: "empty" }, "Nenhum usuário cadastrado.")); $("#page-content").replaceChildren(wrap); return; }

  const table = el("table");
  table.innerHTML = `<thead><tr>
    <th>Nome</th><th>E-mail</th><th>CPF</th><th>Telefone</th><th>Cidade</th><th>Status</th><th>Cadastro</th><th></th>
  </tr></thead>`;
  const tbody = el("tbody");
  data.forEach((u) => {
    const tr = el("tr");
    tr.innerHTML = `
      <td><strong>${u.nome ?? "—"}</strong></td>
      <td>${u.email}</td>
      <td>${u.cpf ?? "—"}</td>
      <td>${u.telefone ?? "—"}</td>
      <td>${u.cidade ?? "—"}</td>
      <td><span class="badge ${u.approval_status}">${u.approval_status}</span>${u.rejection_reason ? `<div class="muted" style="margin-top:4px">${u.rejection_reason}</div>` : ""}</td>
      <td class="muted">${fmtDate(u.created_at)}</td>
      <td></td>
    `;
    const actions = el("div", { class: "row-actions" });
    if (u.approval_status !== "aprovado") {
      actions.appendChild(el("button", { class: "btn-success", onClick: () => approveUser(u) }, "Aprovar"));
    }
    if (u.approval_status !== "negado") {
      actions.appendChild(el("button", { class: "btn-danger", onClick: () => rejectUser(u) }, "Negar"));
    }
    actions.appendChild(el("button", { class: "btn-secondary", onClick: () => resetUserPassword(u) }, "Trocar senha"));
    tr.lastElementChild.appendChild(actions);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  $("#page-content").replaceChildren(wrap);
}

async function approveUser(u) {
  const { error } = await sb.from("profiles").update({ approval_status: "aprovado", rejection_reason: null }).eq("id", u.id);
  if (error) return toast(error.message, "error");
  await sb.from("notificacoes").insert({ user_id: u.id, titulo: "Cadastro aprovado!", mensagem: "Sua conta foi aprovada. Aproveite os benefícios!", tipo: "success" });
  toast("Usuário aprovado", "success");
  renderUsuarios();
}
async function rejectUser(u) {
  const motivo = prompt("Motivo da recusa (será enviado ao usuário):", "Cadastro não aprovado.");
  if (motivo === null) return;
  const { error } = await sb.from("profiles").update({ approval_status: "negado", rejection_reason: motivo }).eq("id", u.id);
  if (error) return toast(error.message, "error");
  await sb.from("notificacoes").insert({ user_id: u.id, titulo: "Cadastro não aprovado", mensagem: motivo, tipo: "error" });
  toast("Usuário negado", "success");
  renderUsuarios();
}

async function resetUserPassword(u) {
  const nova = prompt(`Nova senha para ${u.nome ?? u.email}\n(mínimo 6 caracteres):`, "");
  if (nova === null) return;
  if (nova.length < 6) {
    toast("Senha precisa ter ao menos 6 caracteres", "error");
    return;
  }
  const ok = confirm(`Confirmar troca de senha para ${u.email}?\nO usuário será notificado.`);
  if (!ok) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    const token = sess?.session?.access_token;
    if (!token) { toast("Sessão expirada, faça login novamente", "error"); return; }
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/admin-reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: u.id, new_password: nova }),
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) { toast(json.error || "Erro ao trocar senha", "error"); return; }
    toast("Senha alterada com sucesso", "success");
  } catch (e) {
    toast(e.message || "Erro de rede", "error");
  }
}

// ============= CATEGORIAS =============
async function renderCategorias() {
  const { data, error } = await sb.from("categorias").select("*").order("ordem");
  if (error) throw error;

  const wrap = el("div");
  wrap.appendChild(el("div", { class: "section-head" }, [
    el("h3", {}, `${data.length} categoria(s)`),
    el("button", { class: "btn-primary", onClick: () => formCategoria() }, "+ Nova categoria"),
  ]));

  if (!data.length) { wrap.appendChild(el("p", { class: "empty" }, "Nenhuma categoria.")); $("#page-content").replaceChildren(wrap); return; }

  const table = el("table");
  table.innerHTML = `<thead><tr><th>Ícone</th><th>Nome</th><th>Ordem</th><th>Ativa</th><th></th></tr></thead>`;
  const tbody = el("tbody");
  data.forEach((c) => {
    const tr = el("tr");
    tr.innerHTML = `
      <td style="font-size:22px">${c.icon ?? "🏷️"}</td>
      <td><strong>${c.nome}</strong></td>
      <td>${c.ordem}</td>
      <td>${c.ativa ? "✅" : "—"}</td>
      <td></td>
    `;
    const actions = el("div", { class: "row-actions" }, [
      el("button", { class: "btn-secondary", onClick: () => formCategoria(c) }, "Editar"),
      el("button", { class: "btn-danger", onClick: () => delCategoria(c) }, "Excluir"),
    ]);
    tr.lastElementChild.appendChild(actions);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  $("#page-content").replaceChildren(wrap);
}
function formCategoria(c = null) {
  const f = el("form", { class: "stack" });
  f.innerHTML = `
    <label>Nome <input name="nome" required value="${c?.nome ?? ""}" /></label>
    <div class="row">
      <label>Ícone (emoji) <input name="icon" value="${c?.icon ?? "🏷️"}" /></label>
      <label>Ordem <input name="ordem" type="number" value="${c?.ordem ?? 0}" /></label>
    </div>
    <label style="flex-direction:row;align-items:center;gap:8px"><input name="ativa" type="checkbox" ${c?.ativa !== false ? "checked" : ""} /> Ativa</label>
    <div class="actions">
      <button type="button" class="btn-secondary" id="cancel">Cancelar</button>
      <button type="submit" class="btn-primary">Salvar</button>
    </div>
  `;
  f.querySelector("#cancel").onclick = closeModal;
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const fd = new FormData(f);
    const payload = {
      nome: fd.get("nome"),
      icon: fd.get("icon"),
      ordem: Number(fd.get("ordem") || 0),
      ativa: fd.get("ativa") === "on",
    };
    const q = c ? sb.from("categorias").update(payload).eq("id", c.id) : sb.from("categorias").insert(payload);
    const { error } = await q;
    if (error) return toast(error.message, "error");
    toast("Categoria salva", "success"); closeModal(); renderCategorias();
  };
  openModal(c ? "Editar categoria" : "Nova categoria", f);
}
async function delCategoria(c) {
  if (!confirm(`Excluir "${c.nome}"?`)) return;
  const { error } = await sb.from("categorias").delete().eq("id", c.id);
  if (error) return toast(error.message, "error");
  toast("Excluída", "success"); renderCategorias();
}

// ============= LOJAS =============
async function renderLojas() {
  const [{ data, error }, { data: cats }] = await Promise.all([
    sb.from("lojas").select("*").order("created_at", { ascending: false }),
    sb.from("categorias").select("id,nome"),
  ]);
  if (error) throw error;
  const catMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c.nome]));

  const wrap = el("div");
  wrap.appendChild(el("div", { class: "section-head" }, [
    el("h3", {}, `${data.length} loja(s)`),
    el("button", { class: "btn-primary", onClick: () => formLoja(null, cats) }, "+ Nova loja"),
  ]));

  if (!data.length) { wrap.appendChild(el("p", { class: "empty" }, "Nenhuma loja.")); $("#page-content").replaceChildren(wrap); return; }

  const table = el("table");
  table.innerHTML = `<thead><tr><th>Foto</th><th>Nome</th><th>Categoria</th><th>Estrelas</th><th>Cidade/End.</th><th>Ativa</th><th></th></tr></thead>`;
  const tbody = el("tbody");
  data.forEach((l) => {
    const tr = el("tr");
    tr.innerHTML = `
      <td>${l.foto_url ? `<img class="thumb" src="${l.foto_url}" />` : '<div class="thumb"></div>'}</td>
      <td><strong>${l.nome}</strong><div class="muted">${l.descricao ?? ""}</div></td>
      <td>${catMap[l.categoria_id] ?? "—"}</td>
      <td>⭐ ${Number(l.estrelas).toFixed(1)}</td>
      <td class="muted">${l.endereco ?? "—"}</td>
      <td>${l.ativa ? "✅" : "—"}</td>
      <td></td>
    `;
    const actions = el("div", { class: "row-actions" }, [
      el("button", { class: "btn-secondary", onClick: () => formLoja(l, cats) }, "Editar"),
      el("button", { class: "btn-danger", onClick: () => delLoja(l) }, "Excluir"),
    ]);
    tr.lastElementChild.appendChild(actions);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  $("#page-content").replaceChildren(wrap);
}
function formLoja(l = null, cats = []) {
  const f = el("form", { class: "stack" });
  const opts = (cats ?? []).map((c) => `<option value="${c.id}" ${l?.categoria_id === c.id ? "selected" : ""}>${c.nome}</option>`).join("");
  const servicosIniciais = (l?.servicos ?? []).join(", ");
  f.innerHTML = `
    <label>Nome <input name="nome" required maxlength="120" value="${l?.nome ?? ""}" />
      <small class="muted">Como aparecerá no app (ex: Padaria do João).</small>
    </label>
    <label>Descrição <textarea name="descricao" maxlength="500">${l?.descricao ?? ""}</textarea>
      <small class="muted">Texto curto que aparece abaixo do nome.</small>
    </label>
    <div class="row">
      <label>Categoria <select name="categoria_id"><option value="">—</option>${opts}</select></label>
      <label>Estrelas (0–5) <input name="estrelas" type="number" min="0" max="5" step="0.1" value="${l?.estrelas ?? 0}" />
        <small class="muted">Avaliação inicial.</small>
      </label>
    </div>
    <label>Endereço completo <input name="endereco" value="${l?.endereco ?? ""}" placeholder="Rua, número — Bairro, Cidade/UF" />
      <small class="muted">Dica: copie do Google Maps (rua + número + cidade) para o app encontrar certinho.</small>
    </label>
    <label>Link do Google Maps <input name="maps_url" type="url" value="${l?.maps_url ?? ""}" placeholder="https://maps.app.goo.gl/..." />
      <small class="muted">Opcional, mas recomendado. Abra a loja no Maps → Compartilhar → Copiar link.</small>
    </label>
    <label>Telefone <input name="telefone" value="${l?.telefone ?? ""}" placeholder="(11) 90000-0000" />
      <small class="muted">Permite que o cliente ligue direto pelo app.</small>
    </label>
    <label>Serviços oferecidos <input name="servicos" value="${servicosIniciais}" placeholder="Ex: Corte de cabelo, Manicure, Entrega" />
      <small class="muted">Separe por vírgula. Cada item vira um chip no app.</small>
    </label>
    <label>Foto da loja <input name="foto" type="file" accept="image/*" />
      <small class="muted">Use imagem horizontal de boa qualidade (até ~5MB).</small>
    </label>
    ${l?.foto_url ? `<img src="${l.foto_url}" style="max-width:140px;border-radius:10px" />` : ""}
    <label style="flex-direction:row;align-items:center;gap:8px"><input name="ativa" type="checkbox" ${l?.ativa !== false ? "checked" : ""} /> Loja ativa (visível no app)</label>
    <div class="actions">
      <button type="button" class="btn-secondary" id="cancel">Cancelar</button>
      <button type="submit" class="btn-primary" id="save">Salvar</button>
    </div>
  `;
  f.querySelector("#cancel").onclick = closeModal;
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const btn = f.querySelector("#save"); btn.disabled = true; btn.textContent = "Salvando...";
    try {
      const fd = new FormData(f);
      const file = fd.get("foto");
      let foto_url = l?.foto_url ?? null;
      if (file && file.size > 0) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Foto muito grande (máx. 5MB).");
        foto_url = await uploadFile("lojas", file);
      }
      // Validar maps_url se preenchido
      let maps_url = (fd.get("maps_url") || "").toString().trim();
      if (maps_url) {
        if (!/^https?:\/\//i.test(maps_url)) maps_url = "https://" + maps_url;
        try { new URL(maps_url); } catch { throw new Error("Link do Maps inválido. Cole o endereço completo (https://...)."); }
      }
      // Servicos: split por vírgula, trim, remove vazios e duplicados
      const servicos = (fd.get("servicos") || "").toString()
        .split(",").map((s) => s.trim()).filter(Boolean);
      const servicosUnicos = [...new Set(servicos)];

      const estrelas = Math.max(0, Math.min(5, Number(fd.get("estrelas") || 0)));

      const payload = {
        nome: (fd.get("nome") || "").toString().trim(),
        descricao: (fd.get("descricao") || "").toString().trim() || null,
        categoria_id: fd.get("categoria_id") || null,
        estrelas,
        endereco: (fd.get("endereco") || "").toString().trim() || null,
        telefone: (fd.get("telefone") || "").toString().trim() || null,
        foto_url,
        maps_url: maps_url || null,
        servicos: servicosUnicos,
        ativa: fd.get("ativa") === "on",
      };
      if (!payload.nome) throw new Error("Informe o nome da loja.");

      const q = l ? sb.from("lojas").update(payload).eq("id", l.id) : sb.from("lojas").insert(payload);
      const { error } = await q;
      if (error) throw error;
      toast("Loja salva", "success"); closeModal(); renderLojas();
    } catch (e) { toast(e.message, "error"); }
    finally { btn.disabled = false; btn.textContent = "Salvar"; }
  };
  openModal(l ? "Editar loja" : "Nova loja", f);
}
async function delLoja(l) {
  if (!confirm(`Excluir "${l.nome}"? Os cupons desta loja também serão removidos.`)) return;
  await sb.from("cupons").delete().eq("loja_id", l.id);
  const { error } = await sb.from("lojas").delete().eq("id", l.id);
  if (error) return toast(error.message, "error");
  toast("Excluída", "success"); renderLojas();
}

// ============= CUPONS =============
async function renderCupons() {
  const [{ data, error }, { data: lojas }] = await Promise.all([
    sb.from("cupons").select("*").order("created_at", { ascending: false }),
    sb.from("lojas").select("id,nome"),
  ]);
  if (error) throw error;
  const lojaMap = Object.fromEntries((lojas ?? []).map((l) => [l.id, l.nome]));

  const wrap = el("div");
  wrap.appendChild(el("div", { class: "section-head" }, [
    el("h3", {}, `${data.length} cupom(ns)`),
    el("button", { class: "btn-primary", onClick: () => formCupom(null, lojas) }, "+ Novo cupom"),
  ]));

  if (!data.length) { wrap.appendChild(el("p", { class: "empty" }, "Nenhum cupom.")); $("#page-content").replaceChildren(wrap); return; }

  const table = el("table");
  table.innerHTML = `<thead><tr><th>Foto</th><th>Título</th><th>Loja</th><th>Desconto</th><th>Validade</th><th>Ativo</th><th></th></tr></thead>`;
  const tbody = el("tbody");
  data.forEach((c) => {
    const tr = el("tr");
    tr.innerHTML = `
      <td>${c.foto_url ? `<img class="thumb" src="${c.foto_url}" />` : '<div class="thumb"></div>'}</td>
      <td><strong>${c.titulo}</strong><div class="muted">${c.descricao ?? ""}</div></td>
      <td>${lojaMap[c.loja_id] ?? "—"}</td>
      <td><strong style="color:#ff9248">${c.desconto}</strong></td>
      <td class="muted">${fmtDate(c.validade)}</td>
      <td>${c.ativo ? "✅" : "—"}</td>
      <td></td>
    `;
    const actions = el("div", { class: "row-actions" }, [
      el("button", { class: "btn-secondary", onClick: () => formCupom(c, lojas) }, "Editar"),
      el("button", { class: "btn-danger", onClick: () => delCupom(c) }, "Excluir"),
    ]);
    tr.lastElementChild.appendChild(actions);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  $("#page-content").replaceChildren(wrap);
}
function formCupom(c = null, lojas = []) {
  const f = el("form", { class: "stack" });
  const opts = (lojas ?? []).map((l) => `<option value="${l.id}" ${c?.loja_id === l.id ? "selected" : ""}>${l.nome}</option>`).join("");
  f.innerHTML = `
    <label>Loja <select name="loja_id" required><option value="">Selecione...</option>${opts}</select></label>
    <label>Título <input name="titulo" required maxlength="120" value="${c?.titulo ?? ""}" placeholder="Ex: Pizza grande com 30% off" />
      <small class="muted">Aparece em destaque no card do cupom.</small>
    </label>
    <label>Descrição <textarea name="descricao" maxlength="500">${c?.descricao ?? ""}</textarea>
      <small class="muted">Detalhes, regras e condições.</small>
    </label>
    <div class="row">
      <label>Desconto (texto exibido) <input name="desconto" required maxlength="30" value="${c?.desconto ?? ""}" placeholder="Ex: 30% OFF" />
        <small class="muted">Texto curto que aparece na etiqueta do cupom.</small>
      </label>
      <label>Validade <input name="validade" type="date" value="${c?.validade ?? ""}" />
        <small class="muted">Deixe vazio se não tem prazo.</small>
      </label>
    </div>
    <div class="row">
      <label>Preço original (R$) <input name="preco_original" type="number" min="0" step="0.01" value="${c?.preco_original ?? ""}" placeholder="Ex: 50.00" />
        <small class="muted">Quanto custaria sem o desconto. Usado para calcular a economia.</small>
      </label>
      <label>% de desconto <input name="desconto_percentual" type="number" min="0" max="100" step="1" value="${c?.desconto_percentual ?? ""}" placeholder="Ex: 30" />
        <small class="muted">Só o número (sem o "%"). Usado para calcular economia.</small>
      </label>
    </div>
    <div id="economia-preview" class="muted" style="padding:10px;background:#0f1f0f;border-radius:8px;color:#4ade80;font-weight:700;display:none"></div>
    <label>Foto do cupom <input name="foto" type="file" accept="image/*" />
      <small class="muted">Imagem horizontal (até ~5MB).</small>
    </label>
    ${c?.foto_url ? `<img src="${c.foto_url}" style="max-width:140px;border-radius:10px" />` : ""}
    <label style="flex-direction:row;align-items:center;gap:8px"><input name="ativo" type="checkbox" ${c?.ativo !== false ? "checked" : ""} /> Cupom ativo (visível no app)</label>
    <div class="actions">
      <button type="button" class="btn-secondary" id="cancel">Cancelar</button>
      <button type="submit" class="btn-primary" id="save">Salvar</button>
    </div>
  `;

  // Preview da economia em tempo real
  const updatePreview = () => {
    const fd = new FormData(f);
    const preco = Number(fd.get("preco_original") || 0);
    const pct = Number(fd.get("desconto_percentual") || 0);
    const preview = f.querySelector("#economia-preview");
    if (preco > 0 && pct > 0) {
      const economia = (preco * pct / 100).toFixed(2).replace(".", ",");
      const final = (preco * (1 - pct / 100)).toFixed(2).replace(".", ",");
      preview.style.display = "block";
      preview.innerHTML = `💰 O cliente economiza <strong>R$ ${economia}</strong> — paga apenas R$ ${final}`;
    } else {
      preview.style.display = "none";
    }
  };
  f.querySelector('[name="preco_original"]').addEventListener("input", updatePreview);
  f.querySelector('[name="desconto_percentual"]').addEventListener("input", updatePreview);
  updatePreview();

  // Auto-preencher % a partir do texto "30% OFF" se vazio
  f.querySelector('[name="desconto"]').addEventListener("blur", (ev) => {
    const pctField = f.querySelector('[name="desconto_percentual"]');
    if (!pctField.value) {
      const match = String(ev.target.value).match(/(\d{1,3})\s*%/);
      if (match) { pctField.value = match[1]; updatePreview(); }
    }
  });

  f.querySelector("#cancel").onclick = closeModal;
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const btn = f.querySelector("#save"); btn.disabled = true; btn.textContent = "Salvando...";
    try {
      const fd = new FormData(f);
      const file = fd.get("foto");
      let foto_url = c?.foto_url ?? null;
      if (file && file.size > 0) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Foto muito grande (máx. 5MB).");
        foto_url = await uploadFile("cupons", file);
      }

      // Validações
      if (!fd.get("loja_id")) throw new Error("Selecione uma loja.");
      const titulo = (fd.get("titulo") || "").toString().trim();
      if (!titulo) throw new Error("Informe o título do cupom.");
      const desconto = (fd.get("desconto") || "").toString().trim();
      if (!desconto) throw new Error("Informe o texto do desconto (ex: 30% OFF).");

      const precoStr = (fd.get("preco_original") || "").toString().trim();
      const pctStr = (fd.get("desconto_percentual") || "").toString().trim();
      let preco_original = precoStr ? Number(precoStr) : null;
      let desconto_percentual = pctStr ? Math.round(Number(pctStr)) : null;
      if (preco_original !== null && (isNaN(preco_original) || preco_original < 0)) {
        throw new Error("Preço original inválido.");
      }
      if (desconto_percentual !== null && (isNaN(desconto_percentual) || desconto_percentual < 0 || desconto_percentual > 100)) {
        throw new Error("% de desconto deve estar entre 0 e 100.");
      }

      // Validar validade futura (apenas alerta)
      const validade = fd.get("validade") || null;
      if (validade && new Date(validade) < new Date(new Date().toDateString())) {
        if (!confirm("⚠️ A validade está no passado. Deseja salvar mesmo assim?")) {
          btn.disabled = false; btn.textContent = "Salvar";
          return;
        }
      }

      const payload = {
        loja_id: fd.get("loja_id"),
        titulo,
        descricao: (fd.get("descricao") || "").toString().trim() || null,
        desconto,
        validade,
        preco_original,
        desconto_percentual,
        foto_url,
        ativo: fd.get("ativo") === "on",
      };
      const q = c ? sb.from("cupons").update(payload).eq("id", c.id) : sb.from("cupons").insert(payload);
      const { error } = await q;
      if (error) throw error;
      toast("Cupom salvo", "success"); closeModal(); renderCupons();
    } catch (e) { toast(e.message, "error"); }
    finally { btn.disabled = false; btn.textContent = "Salvar"; }
  };
  openModal(c ? "Editar cupom" : "Novo cupom", f);
}
async function delCupom(c) {
  if (!confirm(`Excluir "${c.titulo}"?`)) return;
  const { error } = await sb.from("cupons").delete().eq("id", c.id);
  if (error) return toast(error.message, "error");
  toast("Excluído", "success"); renderCupons();
}

// ============= ANÁLISE DE CUPOM (Solicitações) =============
async function renderSolicitacoes() {
  const { data, error } = await sb.from("solicitacoes").select("*").order("created_at", { ascending: false });
  if (error) throw error;

  const cupomIds = [...new Set(data.map((s) => s.cupom_id))];
  const userIds = [...new Set(data.map((s) => s.user_id))];
  const [{ data: cupons }, { data: profiles }, { data: lojas }] = await Promise.all([
    cupomIds.length ? sb.from("cupons").select("id,titulo,desconto,loja_id").in("id", cupomIds) : { data: [] },
    userIds.length ? sb.from("profiles").select("id,nome,email,avatar_url").in("id", userIds) : { data: [] },
    sb.from("lojas").select("id,nome"),
  ]);
  const cupomMap = Object.fromEntries((cupons ?? []).map((c) => [c.id, c]));
  const userMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const lojaMap = Object.fromEntries((lojas ?? []).map((l) => [l.id, l.nome]));

  const pendentes = data.filter((s) => s.status === "pendente");
  const outras = data.filter((s) => s.status !== "pendente");

  const wrap = el("div");

  // Banner pendentes
  wrap.appendChild(el("div", { class: "stats" }, [
    el("div", { class: "stat" }, [
      el("div", { class: "stat-label" }, "Pendentes"),
      el("div", { class: "stat-value warn" }, String(pendentes.length)),
    ]),
    el("div", { class: "stat" }, [
      el("div", { class: "stat-label" }, "Total"),
      el("div", { class: "stat-value" }, String(data.length)),
    ]),
  ]));

  // Pendentes — cards destaque
  wrap.appendChild(el("h3", { style: { marginTop: "20px" } }, `Aguardando análise (${pendentes.length})`));
  if (pendentes.length === 0) {
    wrap.appendChild(el("p", { class: "empty" }, "Nenhuma solicitação pendente. Tudo em dia! ✅"));
  } else {
    const grid = el("div", { class: "stack", style: { marginTop: "12px" } });
    pendentes.forEach((s) => {
      const u = userMap[s.user_id]; const c = cupomMap[s.cupom_id];
      const loja = c ? lojaMap[c.loja_id] : "—";
      const card = el("div", { class: "stat", style: { padding: "16px" } });
      card.innerHTML = `
        <div style="display:flex;gap:12px;align-items:flex-start">
          ${u?.avatar_url ? `<img src="${u.avatar_url}" style="width:48px;height:48px;border-radius:50%;object-fit:cover" />` : `<div style="width:48px;height:48px;border-radius:50%;background:#2a2a2a;display:flex;align-items:center;justify-content:center;font-weight:700">${(u?.nome ?? "?")[0]}</div>`}
          <div style="flex:1;min-width:0">
            <div style="font-weight:700">${u?.nome ?? "—"}</div>
            <div class="muted" style="font-size:12px">${u?.email ?? ""}</div>
            <div style="margin-top:8px">
              🎟️ <strong>${c?.titulo ?? "—"}</strong> <span style="color:#ff9248;font-weight:700">${c?.desconto ?? ""}</span>
            </div>
            <div class="muted" style="font-size:12px">🏪 ${loja} • ${fmtDateTime(s.created_at)}</div>
            <div style="margin-top:4px"><code>${s.codigo}</code></div>
          </div>
        </div>
        <div class="row-actions" style="margin-top:14px;justify-content:flex-end"></div>
      `;
      const actions = card.querySelector(".row-actions");
      actions.appendChild(el("button", { class: "btn-success", onClick: () => respondSolicit(s, "aprovada", u, c) }, "✓ Aprovar"));
      actions.appendChild(el("button", { class: "btn-danger", onClick: () => respondSolicit(s, "negada", u, c) }, "✕ Negar"));
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  }

  // Histórico
  wrap.appendChild(el("h3", { style: { marginTop: "28px" } }, `Histórico (${outras.length})`));
  if (outras.length === 0) {
    wrap.appendChild(el("p", { class: "empty" }, "Sem histórico ainda."));
  } else {
    const table = el("table");
    table.innerHTML = `<thead><tr><th>Data</th><th>Usuário</th><th>Cupom</th><th>Código</th><th>Status</th><th>Resposta</th></tr></thead>`;
    const tbody = el("tbody");
    outras.forEach((s) => {
      const u = userMap[s.user_id]; const c = cupomMap[s.cupom_id];
      const tr = el("tr");
      tr.innerHTML = `
        <td class="muted">${fmtDateTime(s.created_at)}</td>
        <td><strong>${u?.nome ?? "—"}</strong><div class="muted">${u?.email ?? ""}</div></td>
        <td>${c?.titulo ?? "—"}<div class="muted">${c?.desconto ?? ""}</div></td>
        <td><code>${s.codigo}</code></td>
        <td><span class="badge ${s.status}">${s.status}</span></td>
        <td class="muted">${s.admin_resposta ?? "—"}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
  }

  $("#page-content").replaceChildren(wrap);
}

async function respondSolicit(s, status, u, c) {
  const isAprovar = status === "aprovada";
  const f = el("form", { class: "stack" });
  f.innerHTML = `
    <div style="padding:12px;background:#1a1a1a;border-radius:10px;margin-bottom:8px">
      <div><strong>${u?.nome ?? "—"}</strong> <span class="muted">${u?.email ?? ""}</span></div>
      <div style="margin-top:6px">🎟️ ${c?.titulo ?? "—"} <span style="color:#ff9248">${c?.desconto ?? ""}</span></div>
    </div>
    <label>${isAprovar ? "Mensagem (opcional)" : "Motivo da negação (obrigatório)"} 
      <textarea name="resposta" rows="4" ${isAprovar ? "" : "required minlength='5'"} placeholder="${isAprovar ? "Ex: Cupom liberado! Apresente o QR Code." : "Explique ao usuário por que a solicitação foi negada."}">${isAprovar ? "Cupom liberado! Apresente o QR Code no estabelecimento." : ""}</textarea>
    </label>
    <div class="actions">
      <button type="button" class="btn-secondary" id="cancel">Cancelar</button>
      <button type="submit" class="${isAprovar ? "btn-success" : "btn-danger"}" id="confirm">${isAprovar ? "✓ Aprovar" : "✕ Negar"}</button>
    </div>
  `;
  f.querySelector("#cancel").onclick = closeModal;
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const fd = new FormData(f);
    const resposta = String(fd.get("resposta") ?? "").trim();
    if (!isAprovar && resposta.length < 5) {
      toast("Informe um motivo com pelo menos 5 caracteres.", "error");
      return;
    }
    const btn = f.querySelector("#confirm");
    btn.disabled = true; btn.textContent = "Salvando...";
    try {
      const { data: { session } } = await sb.auth.getSession();
      const { error } = await sb.from("solicitacoes").update({
        status,
        admin_resposta: resposta || null,
        approved_at: isAprovar ? new Date().toISOString() : null,
        approved_by: session?.user.id ?? null,
      }).eq("id", s.id);
      if (error) throw error;

      await sb.from("notificacoes").insert({
        user_id: s.user_id,
        titulo: isAprovar ? `Cupom aprovado: ${c?.titulo ?? ""}` : `Cupom negado: ${c?.titulo ?? ""}`,
        mensagem: resposta || (isAprovar ? "Sua solicitação foi aprovada." : "Sua solicitação foi negada."),
        tipo: isAprovar ? "success" : "error",
        link: isAprovar ? `/qr/${s.id}` : "/solicitacoes",
      });
      toast(isAprovar ? "Aprovado e notificado" : "Negado e notificado", "success");
      closeModal();
      renderSolicitacoes();
    } catch (e) {
      toast(e.message, "error");
      btn.disabled = false; btn.textContent = isAprovar ? "✓ Aprovar" : "✕ Negar";
    }
  };
  openModal(isAprovar ? "Aprovar solicitação" : "Negar solicitação", f);
}

// ============= NOTIFICAÇÕES =============
async function renderNotificacoes() {
  const f = el("form", { class: "stack", style: { maxWidth: "560px" } });
  f.innerHTML = `
    <label>Título <input name="titulo" required /></label>
    <label>Mensagem <textarea name="mensagem" required></textarea></label>
    <div class="row">
      <label>Tipo <select name="tipo">
        <option value="info">Info</option>
        <option value="success">Sucesso</option>
        <option value="warning">Aviso</option>
        <option value="error">Erro</option>
      </select></label>
      <label>Destinatários <select name="alvo">
        <option value="aprovado">Apenas usuários aprovados</option>
        <option value="todos">Todos os usuários</option>
        <option value="pendente">Apenas pendentes</option>
      </select></label>
    </div>
    <label>Link (opcional, ex: /home) <input name="link" /></label>
    <div class="actions">
      <button type="submit" class="btn-primary" id="send">Enviar</button>
    </div>
    <p class="muted">A notificação será criada para cada usuário do grupo selecionado.</p>
  `;
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const btn = f.querySelector("#send"); btn.disabled = true; btn.textContent = "Enviando...";
    try {
      const fd = new FormData(f);
      const alvo = fd.get("alvo");
      let q = sb.from("profiles").select("id");
      if (alvo !== "todos") q = q.eq("approval_status", alvo);
      const { data: users, error } = await q;
      if (error) throw error;
      if (!users.length) throw new Error("Nenhum usuário no grupo");
      const rows = users.map((u) => ({
        user_id: u.id,
        titulo: fd.get("titulo"),
        mensagem: fd.get("mensagem"),
        tipo: fd.get("tipo"),
        link: fd.get("link") || null,
      }));
      const { error: insErr } = await sb.from("notificacoes").insert(rows);
      if (insErr) throw insErr;
      toast(`Enviado para ${users.length} usuário(s)`, "success");
      f.reset();
    } catch (e) { toast(e.message, "error"); }
    finally { btn.disabled = false; btn.textContent = "Enviar"; }
  };
  $("#page-content").replaceChildren(f);
}

// ============= LOJISTAS (vínculo loja ↔ usuário) =============
async function renderLojistas() {
  const [{ data: vinculos, error: vErr }, { data: lojas }, { data: profiles }] = await Promise.all([
    sb.from("loja_usuarios").select("id, user_id, loja_id, created_at").order("created_at", { ascending: false }),
    sb.from("lojas").select("id, nome").order("nome"),
    sb.from("profiles").select("id, nome, email").order("nome"),
  ]);
  if (vErr) throw vErr;
  const lojaMap = new Map((lojas ?? []).map((l) => [l.id, l]));
  const userMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const wrap = el("div");
  const head = el("div", { class: "section-head" }, [
    el("h3", {}, `${vinculos?.length ?? 0} lojista(s) vinculado(s)`),
    el("button", { class: "btn-primary", onClick: () => openVincularLojista(lojas ?? [], profiles ?? []) }, "+ Vincular lojista"),
  ]);
  wrap.appendChild(head);

  wrap.appendChild(el("div", { class: "info-box", style: { marginBottom: "16px", padding: "12px", background: "#1a2535", borderRadius: "8px", fontSize: "13px" } }, [
    el("strong", {}, "Como funciona: "),
    "O lojista usa o e-mail/senha cadastrados no app pra entrar em ",
    el("code", { style: { background: "#0d1521", padding: "2px 6px", borderRadius: "4px" } }, `${location.origin}/lojista/login`),
    " e validar cupons da loja vinculada. ",
    el("br", {}),
    el("br", {}),
    el("strong", {}, "Importante: "),
    "Antes de vincular, peça pro lojista criar a conta normalmente no app (ele pode ficar pendente — não precisa aprovar). Depois vincule aqui.",
  ]));

  if (!vinculos?.length) {
    wrap.appendChild(el("p", { class: "empty" }, "Nenhum lojista vinculado ainda."));
    $("#page-content").replaceChildren(wrap);
    return;
  }

  const table = el("table");
  table.innerHTML = `<thead><tr><th>Lojista</th><th>E-mail</th><th>Loja</th><th>Vinculado em</th><th></th></tr></thead>`;
  const tbody = el("tbody");
  vinculos.forEach((v) => {
    const u = userMap.get(v.user_id);
    const l = lojaMap.get(v.loja_id);
    const tr = el("tr", {}, [
      el("td", {}, u?.nome ?? "(usuário não encontrado)"),
      el("td", {}, u?.email ?? "—"),
      el("td", {}, l?.nome ?? "(loja removida)"),
      el("td", {}, fmtDateTime(v.created_at)),
      el("td", {}, [
        el("button", {
          class: "btn-danger-sm",
          onClick: async () => {
            if (!confirm("Remover este vínculo? O lojista perderá acesso ao validador.")) return;
            const { error } = await sb.from("loja_usuarios").delete().eq("id", v.id);
            if (error) return toast(error.message, "error");
            // tenta também remover o role 'lojista' se ele não estiver mais vinculado a NENHUMA loja
            const { data: outros } = await sb.from("loja_usuarios").select("id").eq("user_id", v.user_id);
            if (!outros || outros.length === 0) {
              await sb.from("user_roles").delete().eq("user_id", v.user_id).eq("role", "lojista");
            }
            toast("Vínculo removido", "success");
            renderLojistas();
          },
        }, "Remover"),
      ]),
    ]);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  $("#page-content").replaceChildren(wrap);
}

function openVincularLojista(lojas, profiles) {
  const f = el("form");
  f.innerHTML = `
    <label>Loja
      <select name="loja_id" required>
        <option value="">Selecione...</option>
        ${lojas.map((l) => `<option value="${l.id}">${l.nome}</option>`).join("")}
      </select>
    </label>
    <label>Usuário (já cadastrado no app)
      <select name="user_id" required>
        <option value="">Selecione...</option>
        ${profiles.map((p) => `<option value="${p.id}">${p.nome} — ${p.email}</option>`).join("")}
      </select>
    </label>
    <p class="muted" style="font-size:12px">Esta conta poderá validar cupons APENAS da loja selecionada.</p>
    <div class="modal-actions">
      <button type="button" class="btn-ghost" id="cancel-btn">Cancelar</button>
      <button type="submit" class="btn-primary">Vincular</button>
    </div>
  `;
  f.querySelector("#cancel-btn").onclick = closeModal;
  f.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(f);
    const user_id = fd.get("user_id");
    const loja_id = fd.get("loja_id");
    try {
      const { error } = await sb.from("loja_usuarios").insert({ user_id, loja_id });
      if (error) throw error;
      // Garante que tem o role 'lojista'
      await sb.from("user_roles").insert({ user_id, role: "lojista" }).then(() => {}).catch(() => {});
      toast("Lojista vinculado!", "success");
      closeModal();
      renderLojistas();
    } catch (e) { toast(e.message, "error"); }
  };
  openModal("Vincular lojista a uma loja", f);
}

// ---------- BOOT ----------
bootstrap();
