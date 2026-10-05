"use strict";

(() => {
  const config = window.MESD_SITE || {};
  const publicUrl = value => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" ||
        (url.origin === window.location.origin && ["http:", "file:"].includes(url.protocol))
        ? url.href : null;
    } catch {
      return null;
    }
  };

  for (const resource of ["paper", "code", "model"]) {
    const url = publicUrl(config[`${resource}Url`]);
    if (!url) continue;
    document.querySelectorAll(`[data-resource="${resource}"]`).forEach(link => {
      link.href = url;
      link.hidden = false;
    });
    document.querySelectorAll(`[data-pending="${resource}"]`).forEach(label => {
      label.hidden = true;
    });
  }

  // Values transcribed from the paper. Ordering: Qwen2.5-VL, Open-o3-Video, VISD, MeSD.
  const experiments = {
    main: [
      { benchmark: "V-STaR", metric: "Answer Acc.", scores: [33.5, 61.0, 61.9, 63.7] },
      { benchmark: "V-STaR", metric: "mLGM", scores: [22.4, 46.6, 48.9, 50.2] },
      { benchmark: "WorldSense", metric: "Overall", scores: [35.5, 38.9, 39.9, 41.6] },
      { benchmark: "VideoMMMU", metric: "Overall", scores: [51.2, 52.6, 53.8, 56.1] },
      { benchmark: "LRR", metric: "Accuracy", scores: [59.3, 69.1, 73.5, 73.6] },
      { benchmark: "TVGBench", metric: "mIoU", scores: [16.3, 19.2, 24.8, 29.8] },
      { benchmark: "Four-benchmark average", metric: "", scores: [40.6, 45.0, 48.0, 50.3], average: true }
    ],
    additional: [
      { benchmark: "Charades-STA", metric: "R@0.5 · zero-shot", scores: [null, 45.6, 46.1, 54.7] },
      { benchmark: "Charades-STA", metric: "mIoU · zero-shot", scores: [null, 42.5, 44.6, 49.2] },
      { benchmark: "Video-MME-v2", metric: "Avg. Acc. · 64 frames, no subtitles", scores: [21.3, 21.2, 23.8, 28.4] }
    ]
  };
  const notes = {
    main: "All models are 7B. Δ denotes score-point gains; mLGM is a logarithmic grounding score, not a percentage accuracy. The average covers WorldSense Overall, VideoMMMU Overall, LRR Accuracy, and TVGBench mIoU.",
    additional: "All models are 7B. Charades-STA uses zero-shot evaluation; Video-MME-v2 uses 64 frames without subtitles. — means the paper does not report that score. Evaluation entry points for these appendix benchmarks are not included in this repository."
  };
  const comparisons = {
    best: { heading: "Δ vs. best", status: "Gains are relative to the best comparator on each displayed metric." },
    base: { heading: "Δ vs. Qwen", status: "Gains are relative to Qwen2.5-VL-7B on each displayed metric." },
    open: { heading: "Δ vs. Open-o3", status: "Gains are relative to Open-o3-Video-7B on each displayed metric." }
  };
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const baseline = document.getElementById("baseline");
  const tbody = document.getElementById("results-body");
  const thead = document.getElementById("results-head");
  let currentGroup = "main";

  function cell(tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    if (tag === "th") element.scope = "col";
    return element;
  }
  const scoreText = value => value == null ? "—" : value.toFixed(1);
  const gainText = value => value == null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;

  function renderResults() {
    const comparison = comparisons[baseline.value];
    const headings = ["Benchmark / metric", "Qwen2.5-VL", "Open-o3-Video", "VISD", "MeSD", comparison.heading];
    const headerRow = document.createElement("tr");
    headings.forEach((heading, i) => headerRow.append(cell("th", heading, i === 4 ? "ours" : "")));
    thead.replaceChildren(headerRow);
    const rows = experiments[currentGroup].map(result => {
      const row = document.createElement("tr");
      if (result.average) row.className = "average-row";
      const label = cell("th", result.benchmark);
      label.scope = "row";
      if (result.metric) {
        const metric = document.createElement("span");
        metric.className = "metric";
        metric.textContent = result.metric;
        label.append(metric);
      }
      row.append(label);
      result.scores.forEach((score, i) => row.append(cell("td", scoreText(score), i === 3 ? "ours" : "")));
      const comparator = baseline.value === "best"
        ? Math.max(...result.scores.slice(0, 3).filter(value => value != null))
        : result.scores[baseline.value === "base" ? 0 : 1];
      const delta = comparator == null ? null : (Math.round(result.scores[3] * 10) - Math.round(comparator * 10)) / 10;
      row.append(cell("td", gainText(delta), "gain"));
      return row;
    });
    tbody.replaceChildren(...rows);
    document.getElementById("results-note").textContent = notes[currentGroup];
    document.getElementById("comparison-status").textContent = comparison.status;
  }

  function selectTab(tab) {
    currentGroup = tab.dataset.tab;
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      item.classList.toggle("is-active", active);
    });
    document.getElementById("result-panel").setAttribute("aria-labelledby", tab.id);
    renderResults();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", event => {
      let target;
      if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") target = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") target = 0;
      if (event.key === "End") target = tabs.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      tabs[target].focus();
      selectTab(tabs[target]);
    });
  });
  baseline.addEventListener("change", renderResults);
  renderResults();

  const bibtex = document.getElementById("bibtex");
  if (/^\d{4}\.\d{4,5}(v\d+)?$/.test(config.arxivId || "")) {
    bibtex.textContent = bibtex.textContent.replace("note = {Manuscript}", `archivePrefix = {arXiv},\n  eprint = {${config.arxivId}}`);
  }
  document.getElementById("copy-citation").addEventListener("click", async () => {
    const text = bibtex.textContent.trim();
    const status = document.getElementById("copy-status");
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      status.textContent = "BibTeX copied.";
    } catch {
      const input = document.createElement("textarea");
      input.value = text;
      input.className = "sr-only";
      document.body.append(input);
      input.select();
      let copied = false;
      try { copied = document.execCommand("copy"); } catch { /* Show a manual-copy hint. */ }
      input.remove();
      document.getElementById("copy-citation").focus();
      status.textContent = copied ? "BibTeX copied." : "Please select and copy the BibTeX above.";
    }
  });

  const dialog = document.getElementById("figure-dialog");
  const dialogImage = document.getElementById("dialog-image");
  document.querySelectorAll("[data-figure]").forEach(button => {
    button.addEventListener("click", () => {
      dialogImage.src = button.dataset.figure;
      dialogImage.alt = button.dataset.caption;
      document.getElementById("figure-caption").textContent = button.dataset.caption;
      dialog.showModal();
    });
  });
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
})();
