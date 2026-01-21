(() => {
  const DB_PATH = "assets/ai/ai-brain.json";
  let DB = null;
  let fuseDocs = null;
  let fuseQnA = null;

  const convo = {
    history: [],
    name: null
  };

  async function loadDB() {
    const res = await fetch(DB_PATH);
    DB = await res.json();
    buildIndexes();
    console.log("Tejas AI DB loaded:", DB.meta);
  }

  function buildIndexes() {
    const fuseOptionsDocs = {
      keys: ["title", "summary", "content", "tags", "keywords"],
      threshold: 0.35,
      includeScore: true
    };
    fuseDocs = new Fuse(DB.documents, fuseOptionsDocs);

    const fuseOptionsQnA = {
      keys: ["question", "keywords"],
      threshold: 0.25,
      includeScore: true
    };
    fuseQnA = new Fuse(DB.qna || [], fuseOptionsQnA);
  }

  function normalizeQuery(q) {
    let out = q.toLowerCase();
    const syn = DB?.synonyms || {};
    for (const root in syn) {
      for (const w of syn[root]) {
        const re = new RegExp(`\\b${w}\\b`, "gi");
        out = out.replace(re, root);
      }
    }
    return out;
  }

  function retrieve(query) {
    const qnaRes = fuseQnA.search(query);
    if (qnaRes.length && qnaRes[0].score < 0.3) {
      return { type: "qna", item: qnaRes[0].item };
    }

    const docRes = fuseDocs.search(query);
    if (docRes.length) {
      return { type: "doc", item: docRes[0].item };
    }

    return { type: "none" };
  }

  function isMath(q) {
    return /^[0-9+\-*/(). ^%]+$/.test(q);
  }

  function safeEval(expr) {
    try {
      if (!/^[0-9+\-*/(). ^%]+$/.test(expr)) return null;
      const js = expr.replace(/\^/g, "**");
      return Function(`return (${js})`)();
    } catch {
      return null;
    }
  }

  async function respond(query) {
    convo.history.push({ role: "user", text: query });

    const nameMatch = query.match(/my name is\s+(.+)/i);
    if (nameMatch) {
      convo.name = nameMatch[1].trim();
      return `Nice to meet you, ${convo.name}. I will remember you in this session.`;
    }

    if (isMath(query.trim())) {
      const r = safeEval(query.trim());
      if (r !== null) return `Result: ${r}`;
    }

    const nq = normalizeQuery(query);
    const r = retrieve(nq);

    if (r.type === "qna") {
      return r.item.answer;
    }

    if (r.type === "doc") {
      const s = r.item.summary || r.item.content.slice(0, 160);
      return `${s}\n\n(From: ${r.item.title})`;
    }

    return "I am still learning. Ask me about Tejas, AI, robotics, or try a math expression.";
  }

  window.TejasAI = {
    load: loadDB,
    respond
  };

  loadDB();
})();
