/* Maths Quest — compte Activités mentales et synchronisation des résultats. */
(function () {
  'use strict';
  const URL = 'https://hxfdlujpedxuumqfewvn.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZmRsdWpwZWR4dXVtcWZld3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjcyMzAsImV4cCI6MjA5NzcwMzIzMH0.mM0xBhLGWG3vDgE06bEla8b4BhH7v6dvZ-BWn4ZOP0Q';
  const MODULES = [{"id": "tables", "module": "mult", "title": "Tables de multiplication"}, {"id": "relatifs", "module": "add_rel", "title": "Addition de relatifs"}, {"id": "fractions", "module": "frac_equiv", "title": "Fractions équivalentes"}, {"id": "niveau2-conv_long", "module": "conv_long", "title": "Conversions de longueurs"}, {"id": "niveau2-tableau_prop1", "module": "tableau_prop1", "title": "Tableaux — Niveau 1"}, {"id": "niveau2-etendue", "module": "etendue", "title": "Étendue d'une série"}, {"id": "niveau2-probas_simples", "module": "probas_simples", "title": "Probabilités — Niveau 1"}, {"id": "niveau2-expressions", "module": "expressions", "title": "Calcul d'expressions"}, {"id": "niveau2-eq_niv1", "module": "eq_niv1", "title": "Équations — Niveau 1"}, {"id": "niveau3-mult10", "module": "mult10", "title": "Multiplier par 10, 100, 1 000"}, {"id": "niveau3-mult_rel", "module": "mult_rel", "title": "Multiplication de relatifs"}, {"id": "niveau3-arrondir", "module": "arrondir", "title": "Arrondir au dixième"}, {"id": "niveau3-carre", "module": "carre", "title": "Calculer un carré"}, {"id": "niveau3-moyenne", "module": "moyenne", "title": "Calcul de moyenne"}, {"id": "niveau3-conversions2", "module": "conversions2", "title": "Conversions masses, volumes, aires"}, {"id": "niveau3-angles", "module": "angles", "title": "Angles dans un triangle"}, {"id": "niveau3-tableau_prop2", "module": "tableau_prop2", "title": "Tableaux — Niveau 2"}, {"id": "niveau3-pct_variation", "module": "pct_variation", "title": "Augmentation / diminution en %"}, {"id": "niveau3-probas_des", "module": "probas_des", "title": "Probabilités — Niveau 2"}, {"id": "niveau3-reductions", "module": "reductions", "title": "Réductions d'expressions"}, {"id": "niveau3-eq_niv2", "module": "eq_niv2", "title": "Équations — Niveau 2"}, {"id": "niveau3-eq_niv7", "module": "eq_niv7", "title": "Équations — Niveau 7"}];
  const SESSION = 'mq-am-session-v1', CACHE = 'mq-am-progress-v1-', QUEUE = 'mq-am-outbox-v1-';
  let identity = null, generation = 0, refreshing = null, syncing = null, syncAgain = false, status = 'Mode invité · progression sur cet appareil';
  let bridge = null;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } };
  const write = (key, value) => { localStorage.setItem(key, JSON.stringify(value)); };
  const savedIdentity = () => { try { return JSON.parse(sessionStorage.getItem(SESSION)); } catch (_) { return null; } };
  function persistIdentity() { if (identity) sessionStorage.setItem(SESSION, JSON.stringify(identity)); else sessionStorage.removeItem(SESSION); }
  function notify(message) { status = message; if (document.getElementById('mq-account-status')) document.getElementById('mq-account-status').textContent = message; }
  function controls() {
    const user = document.getElementById('mq-account-user');
    const label = document.getElementById('mq-account-label');if(label)label.textContent=identity?'Compte élève':'Connexion élève';
    if (user) user.textContent = identity ? identity.eleve.prenom + ' · ' + identity.eleve.classe : 'Mode invité';
    if (document.getElementById('mq-account-login')) document.getElementById('mq-account-login').textContent = identity ? 'Changer de compte' : 'Connexion élève';
    for (const id of ['mq-account-sync', 'mq-account-logout']) if (document.getElementById(id)) document.getElementById(id).hidden = !identity;
  }
  function cacheKey(id) { return CACHE + id; }
  function keysForRows(rows) {
    const done = new Set();
    for (const s of rows) {
      if (!Number.isInteger(Number(s.score)) || !Number.isInteger(Number(s.nb_questions)) || Number(s.nb_questions) < 10 || Number(s.score) < 0 || Number(s.score) > Number(s.nb_questions) || Number(s.score) / Number(s.nb_questions) < .8) continue;
      const mod = MODULES.find(m => s.module_key ? m.module === s.module_key && m.title === s.exercice : m.title === s.exercice);
      if (mod) done.add(mod.id);
    }
    return [...done];
  }
  function pending(id) { const items = read(QUEUE + id, []); return Array.isArray(items) ? items.filter(x => x.eleve_id === id) : []; }
  function applyRows(rows, id) {
    if (!identity || identity.eleve.id !== id) return;
    const ids = new Set(keysForRows(rows));
    for (const item of pending(id)) if (item.score >= 8) { const m = MODULES.find(m => m.module === item.module); if (m) ids.add(m.id); }
    write(cacheKey(id), [...ids]); bridge?.apply([...ids], false);
  }
  async function request(path, options = {}, who = identity, retry = true) {
    if (!who) throw new Error('Connecte-toi avec ton compte élève.');
    if (who !== identity) throw new Error('Le compte a changé.');
    if (who.session.expires_at * 1000 <= Date.now() + 30000) await refresh(who);
    const res = await fetch(URL + path, { ...options, headers: { apikey: KEY, Authorization: 'Bearer ' + who.session.access_token, 'Content-Type': 'application/json', ...options.headers } });
    if (who !== identity) throw new Error('Le compte a changé.');
    if (res.status === 401 && retry) { await refresh(who); return request(path, options, who, false); }
    if (!res.ok) { const e = new Error(res.status === 401 ? 'Session expirée. Reconnecte-toi.' : 'Synchronisation indisponible. Réessaie plus tard.'); e.status = res.status; throw e; }
    return res.status === 204 ? null : res.json();
  }
  async function refresh(who) {
    if (who !== identity) throw new Error('Le compte a changé.');
    if (refreshing?.who === who) return refreshing.promise;
    const promise = (async () => {
      const res = await fetch(URL + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: who.session.refresh_token }) });
      if (!res.ok) throw new Error('Session expirée. Reconnecte-toi.');
      const session = await res.json();
      if (who !== identity) throw new Error('Le compte a changé.');
      if(!session.access_token||!session.refresh_token)throw new Error('Session expirée. Reconnecte-toi.');
      who.session = {...session,expires_at:session.expires_at||Math.floor(Date.now()/1000)+Number(session.expires_in||3600)}; persistIdentity();
    })();
    refreshing = { who, promise };
    try { await promise; } finally { if (refreshing?.promise === promise) refreshing = null; }
  }
  async function validate(who) {
    const user = await request('/auth/v1/user', {}, who);
    const pupils = await request('/rest/v1/eleves?select=id&id=eq.' + encodeURIComponent(who.eleve.id) + '&auth_user_id=eq.' + encodeURIComponent(user.id), {}, who);
    if (pupils.length !== 1) throw new Error('Compte élève non reconnu. Reconnecte-toi.');
  }
  function setIdentity(who) {
    generation++; identity = who; persistIdentity(); controls();
    bridge?.apply(who ? read(cacheKey(who.eleve.id), []) : null, true);
    notify(who ? 'Connexion établie · synchronisation…' : 'Mode invité · progression sur cet appareil');
  }
  async function login(pseudo, classe, password) {
    const ticket = generation;
    const res = await fetch(URL + '/functions/v1/student-auth', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', pseudo, classe, password }) });
    const data = await res.json();
    if (ticket !== generation) return;
    if (!res.ok || data.error || !data.session || !data.eleve) throw new Error(data.error || 'Connexion impossible.');
    setIdentity({ session: data.session, eleve: data.eleve });
    try { await validate(identity); await sync(); } catch (e) { notify(e.message); }
  }
  function logout() { setIdentity(null); }
  async function sync() {
    const who = identity, ticket = generation;
    if (!who) return;
    if (syncing?.who === who) { syncAgain = true; return syncing.promise; }
    const promise = (async () => {
      try {
        notify('Synchronisation en cours…');
        await validate(who);
        do {
          syncAgain = false;
          for (const item of pending(who.eleve.id)) {
            if (who !== identity || ticket !== generation) return;
            await request('/rest/v1/rpc/save_maths_quest_session', { method: 'POST', body: JSON.stringify({ p_id: item.id, p_module: item.module, p_score: item.score, p_duration: item.duration, p_answers: item.answers, p_played_at: item.played_at }) }, who);
            if (who !== identity) return;
            write(QUEUE + who.eleve.id, pending(who.eleve.id).filter(x => x.id !== item.id));
          }
          let rows = [], offset = 0;
          while (true) {
            const page = await request('/rest/v1/sessions?eleve_id=eq.' + encodeURIComponent(who.eleve.id) + '&select=exercice,module_key,score,nb_questions,played_at&order=played_at.asc,id.asc&limit=1000&offset=' + offset, {}, who);
            rows.push(...page); if (page.length < 1000) break; offset += page.length;
          }
          if (who !== identity || ticket !== generation) return;
          applyRows(rows, who.eleve.id);
        } while (syncAgain);
        const count = read(cacheKey(who.eleve.id), []).length;
        notify('Progression synchronisée · ' + count + (count > 1 ? ' défis validés' : ' défi validé'));
      } catch (error) {
        if (who === identity && ticket === generation) notify(pending(who.eleve.id).length ? 'Résultats conservés sur cet appareil · envoi à réessayer' : error.message);
      }
    })();
    syncing = { who, promise };
    try { await promise; } finally { if (syncing?.promise === promise) syncing = null; }
  }
  function record(result) {
    if (!identity || result.account !== identity.eleve.id) return;
    const mod = MODULES.find(m => m.id === result.challenge);
    if (!mod || result.answers.length !== 10) return;
    const item = { id: crypto.randomUUID(), eleve_id: identity.eleve.id, module: mod.module, score: result.score, duration: Math.round(result.duration), played_at: new Date().toISOString(), answers: result.answers.map((a, i) => ({ numero_question: i + 1, enonce: a.html.replace(/<[^>]*>/g, ' ').slice(0,3000), reponse_eleve: a.given, correct: a.ok, temps_ms: a.elapsed })) };
    try { write(QUEUE + identity.eleve.id, [...pending(identity.eleve.id), item]); }
    catch (_) { notify('Enregistrement local impossible : garde cette page ouverte et réessaie.'); return; }
    notify('Résultat enregistré sur cet appareil · envoi en cours…'); void sync();
  }
  function openLogin() {
    if (document.getElementById('mq-login-dialog')) return;
    const dialog = document.createElement('dialog'); dialog.id = 'mq-login-dialog';
    dialog.innerHTML = '<form><h2>Ton compte Activités mentales</h2><p>Retrouve tes réussites dans les deux aventures.</p><label>Pseudo<input name="pseudo" required maxlength="30" autocomplete="username"></label><label>Classe<select name="classe">' + ['3PM','2TNE1','2TNE2','2TNE3','2REMI1','2REMI2','1CAP','UPE2A'].map(x => '<option>'+x+'</option>').join('') + '</select></label><label>Mot de passe<input name="password" type="password" required autocomplete="current-password"></label><p class="mq-login-error" role="alert"></p><button type="submit">Se connecter</button><button type="button" class="mq-login-cancel">Annuler</button><p><a href="https://offsidealex.github.io/Activites_mentales/" target="_blank" rel="noopener">Créer un compte dans Activités mentales</a></p></form>';
    document.body.append(dialog); dialog.showModal();
    dialog.querySelector('.mq-login-cancel').onclick = () => dialog.close(); dialog.addEventListener('close', () => dialog.remove());
    dialog.querySelector('form').onsubmit = async event => {
      event.preventDefault(); const form = event.currentTarget, button = form.querySelector('[type="submit"]'); button.disabled = true;
      const password = form.elements.password.value; form.elements.password.value = '';
      try { await login(form.elements.pseudo.value.trim(), form.elements.classe.value, password); dialog.close(); }
      catch (e) { form.querySelector('.mq-login-error').textContent = e.message; button.disabled = false; }
    };
  }
  function mount() {
    const bar = document.createElement('aside'); bar.id = 'mq-account-bar'; bar.setAttribute('aria-label', 'Compte et sauvegarde');
    bar.innerHTML = '<button id="mq-account-toggle" type="button" aria-expanded="false" aria-controls="mq-account-menu"><span id="mq-account-label">Connexion élève</span><strong id="mq-account-user">Mode invité</strong><span class="mq-account-chevron" aria-hidden="true">▾</span></button><div id="mq-account-menu" hidden><span id="mq-account-status" role="status"></span><button id="mq-account-login" type="button">Connexion élève</button><button id="mq-account-sync" type="button" hidden>Actualiser</button><button id="mq-account-logout" type="button" hidden>Déconnexion</button></div>';
    document.body.append(bar); controls(); notify(status);
    const menu=document.getElementById('mq-account-menu'),toggle=document.getElementById('mq-account-toggle');
    function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false')}
    toggle.onclick=()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden))};
    document.addEventListener('click',e=>{if(!bar.contains(e.target))closeMenu()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus()}});
    document.getElementById('mq-account-login').onclick = ()=>{closeMenu();openLogin()};
    // Keep the same account controls when the adventure changes scene.
    if(typeof MutationObserver!=='undefined'){
      let scheduled=false;
      const dock=()=>{
        scheduled=false;
        const visible=id=>{const el=document.getElementById(id);return el&&!el.hidden&&el.getClientRects().length>0};
        let host=document.body;
        if(visible('quizScreen'))host=document.body;
        else if(visible('courtTrial'))host=document.getElementById('courtTrialScene');
        else if(visible('observatoryEntrance')||visible('levelTwoScreen')||visible('trialTransition')||visible('courtComplete'))host=document.body;
        else if(visible('courtScreen'))host=document.getElementById('courtMap');
        else host=document.getElementById('scene')||document.body;
        if(bar.parentElement!==host){closeMenu();host.append(bar)}
        const floating=host===document.body;if(bar.classList.contains('mq-floating')!==floating)bar.classList.toggle('mq-floating',floating);
      };
      new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(dock)}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden','class']});
      dock();
    }

    document.getElementById('mq-account-sync').onclick = () => void sync();
    document.getElementById('mq-account-logout').onclick = logout;
  }
  window.MQAccount = { modules: MODULES, accountId: () => identity?.eleve.id || null, record, sync, login, logout,
    attach(api) { bridge = api; mount(); const saved = savedIdentity(); if (saved?.session?.refresh_token && saved?.eleve?.id) { setIdentity(saved); void sync(); } },
    progressKey: () => identity ? cacheKey(identity.eleve.id) : 'maths-quest-completed-challenges-v1'
  };
  window.addEventListener('online', () => void sync());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void sync(); });
})();
