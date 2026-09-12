/* ============================================================
   旅行攻略网站 · 渲染与交互逻辑
   同时服务：index.html（列表+筛选）与 attraction.html（详情模板）
   ============================================================ */
(function () {
  "use strict";

  var FAV_KEY = "trip_fav";
  function getFav() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function setFav(arr) { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }
  function isFav(id) { return getFav().indexOf(id) !== -1; }
  function toggleFav(id) {
    var arr = getFav();
    var i = arr.indexOf(id);
    if (i === -1) arr.push(id); else arr.splice(i, 1);
    setFav(arr);
    return i === -1;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------------- 列表页 ---------------- */
  function renderIndex() {
    var grid = document.getElementById("grid");
    if (!grid) return;

    var regionChips = document.getElementById("regionChips");
    var seasonChips = document.getElementById("seasonChips");
    var searchInput = document.getElementById("searchInput");
    var countTip = document.getElementById("countTip");

    var state = { region: "全部", season: "全部", q: "" };

    // 地区筛选
    var regions = ["全部"].concat(window.REGIONS || []);
    regionChips.innerHTML = regions.map(function (r) {
      return '<button class="chip' + (r === "全部" ? " active" : "") + '" data-region="' + r + '">' + r + "</button>";
    }).join("");
    // 季节筛选
    var seasons = ["全部", "春", "夏", "秋", "冬"];
    seasonChips.innerHTML = seasons.map(function (s) {
      return '<button class="chip' + (s === "全部" ? " active" : "") + '" data-season="' + s + '">' + (s === "全部" ? "全部季节" : s + "季") + "</button>";
    }).join("");

    regionChips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-region]"); if (!b) return;
      state.region = b.getAttribute("data-region");
      [].forEach.call(regionChips.children, function (c) { c.classList.toggle("active", c === b); });
      draw();
    });
    seasonChips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-season]"); if (!b) return;
      state.season = b.getAttribute("data-season");
      [].forEach.call(seasonChips.children, function (c) { c.classList.toggle("active", c === b); });
      draw();
    });
    searchInput.addEventListener("input", function () { state.q = this.value.trim().toLowerCase(); draw(); });

    function match(a) {
      if (state.region !== "全部" && a.region !== state.region) return false;
      if (state.season !== "全部") {
        var ids = (window.SEASONS && window.SEASONS[state.season]) || [];
        if (ids.indexOf(a.id) === -1) return false;
      }
      if (state.q) {
        var hay = (a.name + " " + a.tagline + " " + a.region + " " + a.city + " " + (a.level || []).join(" ")).toLowerCase();
        if (hay.indexOf(state.q) === -1) return false;
      }
      return true;
    }

    function card(a) {
      var fav = isFav(a.id);
      return (
        '<article class="card" data-id="' + a.id + '">' +
          '<div class="cover" style="background:' + a.hero + '">' +
            '<span class="region">' + esc(a.region) + " · " + esc(a.city) + "</span>" +
            '<button class="fav' + (fav ? " on" : "") + '" data-fav="' + a.id + '" aria-label="收藏">' + (fav ? "★" : "☆") + "</button>" +
            '<span class="emoji">' + a.emoji + "</span>" +
          "</div>" +
          '<div class="body">' +
            "<h3>" + esc(a.name) + "</h3>" +
            '<div class="tag">' + esc(a.tagline) + "</div>" +
            '<div class="meta">' + (a.level || []).map(function (l) { return '<span class="tag-pill">' + esc(l) + "</span>"; }).join("") + "</div>" +
          "</div>" +
        "</article>"
      );
    }

    function draw() {
      var list = window.ATTRACTIONS.filter(match);
      countTip.textContent = "共 " + list.length + " 个";
      if (!list.length) {
        grid.innerHTML = '<div class="empty">没有匹配的景点，换个关键词或筛选试试～</div>';
        return;
      }
      grid.innerHTML = list.map(card).join("");
    }

    grid.addEventListener("click", function (e) {
      var favBtn = e.target.closest("[data-fav]");
      if (favBtn) {
        e.stopPropagation();
        var id = favBtn.getAttribute("data-fav");
        var on = toggleFav(id);
        favBtn.classList.toggle("on", on);
        favBtn.textContent = on ? "★" : "☆";
        return;
      }
      var c = e.target.closest(".card");
      if (c) location.href = "attraction.html?id=" + c.getAttribute("data-id");
    });

    draw();
  }

  /* ---------------- 详情页 ---------------- */
  function renderDetail() {
    var root = document.getElementById("detail-root");
    if (!root) return;

    var id = new URLSearchParams(location.search).get("id");
    var a = (window.ATTRACTIONS || []).filter(function (x) { return x.id === id; })[0];
    if (!a) {
      root.innerHTML = '<div class="container" style="padding:80px 0;text-align:center"><h2>未找到该景点</h2><p><a href="index.html">返回列表</a></p></div>';
      return;
    }

    document.title = a.name + " 旅行攻略 · Trip 旅行指南";
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", a.name + "：" + a.tagline + "。" + a.overview.slice(0, 40) + "…");

    function infoCard(k, v) { return '<div class="info-card"><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + "</div></div>"; }
    function tagList(arr) { return '<div class="tag-list">' + arr.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>"; }
    function bullets(arr) { return '<ul class="bullets">' + arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
    function relatedCards(ids) {
      return ids.map(function (rid) {
        var r = (window.ATTRACTIONS || []).filter(function (x) { return x.id === rid; })[0];
        if (!r) return "";
        return '<article class="card" data-id="' + r.id + '">' +
          '<div class="cover" style="background:' + r.hero + '"><span class="emoji">' + r.emoji + "</span></div>" +
          '<div class="body"><h3>' + esc(r.name) + "</h3><div class=\"tag\">" + esc(r.tagline) + "</div></div></article>";
      }).join("");
    }

    var toc = [
      ["overview", "概览"], ["season", "最佳旅行时间"], ["transport", "交通指南"],
      ["ticket", "门票与开放"], ["routes", "推荐路线"], ["highlights", "必看亮点"],
      ["food", "当地美食"], ["stay", "住宿建议"], ["pitfalls", "避坑提示"],
      ["tips", "实用贴士"], ["related", "相关景点"]
    ];

    var html =
      '<section class="detail-hero" style="background:' + a.hero + '">' +
        '<div class="container">' +
          '<a class="back" href="index.html#list">← 返回列表</a>' +
          '<div class="emoji">' + a.emoji + "</div>" +
          "<h1>" + esc(a.name) + "</h1>" +
          '<div class="tagline">' + esc(a.tagline) + " · " + esc(a.region) + " · " + esc(a.city) + "</div>" +
          '<div class="levels">' + (a.level || []).map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("") + "</div>" +
        "</div>" +
      "</section>" +
      '<div class="container detail-layout">' +
        '<aside class="toc"><h4>攻略目录</h4>' +
          toc.map(function (t) { return '<a href="#m-' + t[0] + '" data-toc="' + t[0] + '">' + t[1] + "</a>"; }).join("") +
        "</aside>" +
        "<div>" +
          '<section class="module" id="m-overview"><h2>概览</h2><p>' + esc(a.overview) + "</p></section>" +
          '<section class="module" id="m-season"><h2>最佳旅行时间</h2><p>' + esc(a.bestSeason) + "</p></section>" +
          '<section class="module" id="m-transport"><h2>交通指南</h2>' +
            infoCard("大交通", a.transport.arrival) + infoCard("景区间接驳", a.transport.local) +
          "</section>" +
          '<section class="module" id="m-ticket"><h2>门票与开放时间</h2><div class="info-grid">' +
            infoCard("票价", a.ticket.price) + infoCard("优惠政策", a.ticket.discount) +
            infoCard("开放时间", a.ticket.openTime) + infoCard("预约方式", a.ticket.booking) +
          "</div></section>" +
          '<section class="module" id="m-routes"><h2>推荐游玩路线</h2><div class="timeline">' +
            a.routes.map(function (r) {
              return '<div class="route"><h3>' + esc(r.name) + "</h3>" +
                r.steps.map(function (s) { return '<div class="step">' + esc(s) + "</div>"; }).join("") + "</div>";
            }).join("") +
          "</div></section>" +
          '<section class="module" id="m-highlights"><h2>必看 / 必玩亮点</h2>' + tagList(a.highlights) + "</section>" +
          '<section class="module" id="m-food"><h2>当地美食</h2>' + tagList(a.food) + "</section>" +
          '<section class="module" id="m-stay"><h2>住宿建议</h2>' +
            infoCard("推荐区域", a.stay.area) + infoCard("价位参考", a.stay.price) +
          "</section>" +
          '<section class="module" id="m-pitfalls"><h2>避坑提示</h2>' + bullets(a.pitfalls) + "</section>" +
          '<section class="module" id="m-tips"><h2>实用贴士</h2>' + bullets(a.tips) + "</section>" +
          '<section class="module" id="m-related"><h2>相关景点推荐</h2><div class="related-grid">' + relatedCards(a.related) + "</div></section>" +
        "</div>" +
      "</div>";

    root.innerHTML = html;

    // 相关景点点击跳转
    root.querySelectorAll(".related-grid .card").forEach(function (c) {
      c.addEventListener("click", function () { location.href = "attraction.html?id=" + c.getAttribute("data-id"); });
    });

    // TOC 滚动高亮
    var tocLinks = root.querySelectorAll("[data-toc]");
    var sections = toc.map(function (t) { return document.getElementById("m-" + t[0]); });
    function onScroll() {
      var pos = window.scrollY + 120;
      var cur = 0;
      sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) cur = i; });
      tocLinks.forEach(function (l, i) { l.classList.toggle("active", i === cur); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- 返回顶部（两页通用） ---------------- */
  function bindTotop() {
    var btn = document.getElementById("totop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderIndex();
    renderDetail();
    bindTotop();
  });
})();
