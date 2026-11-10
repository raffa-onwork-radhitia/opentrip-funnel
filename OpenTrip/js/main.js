// Inisialisasi Klien Supabase
const SUPABASE_URL = "https://lumycrooihklzjvslujn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Gm0oISztBOPhL7dHrJ6CNg_NTiuTh-5";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

let appData = null;
let monthlyChart = null;

let currentPage = "overview";
let currentChannel = "all";
let currentDateRange = "7";

/* ================= ELEMENTS ================= */
const registerPage = document.getElementById("registerPage");
const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const app = document.getElementById("app");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

const goToLogin = document.getElementById("goToLogin");
const goToRegister = document.getElementById("goToRegister");
const logoutButton = document.getElementById("logoutButton");

const channelFilter = document.getElementById("channelFilter");
const dateFilter = document.getElementById("dateFilter");

/* ================= PAGE SWITCHING ================= */
function showRegisterPage() {
  if (registerPage) registerPage.classList.remove("hidden");
  if (loginPage) loginPage.classList.add("hidden");
  if (dashboardPage) dashboardPage.classList.add("hidden");
}

function showLoginPage() {
  if (registerPage) registerPage.classList.add("hidden");
  if (loginPage) loginPage.classList.remove("hidden");
  if (dashboardPage) dashboardPage.classList.add("hidden");
}

function showDashboardPage() {
  if (registerPage) registerPage.classList.add("hidden");
  if (loginPage) loginPage.classList.add("hidden");
  if (dashboardPage) dashboardPage.classList.remove("hidden");

  fetchOpenTripData();
}

/* ================= AUTH SUPABASE REAL ================= */
if (goToLogin) goToLogin.addEventListener("click", showLoginPage);
if (goToRegister) goToRegister.addEventListener("click", showRegisterPage);

// Register Akun Baru ke Supabase
if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert("Gagal Daftar: " + error.message);
      return;
    }

    alert("Registrasi berhasil! Silakan login dengan akun yang baru dibuat.");
    showLoginPage();
  });
}

// Login Akun ke Supabase
if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Login Gagal: " + error.message);
      return;
    }

    showDashboardPage();
  });
}

// Logout dari Supabase
if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    await supabaseClient.auth.signOut();
    showLoginPage();
  });
}

/* ================= FETCH DATA (DARI SUPABASE) ================= */
function getLocalOpenTripData() {
  if (!window.openTripFunnelData) {
    return {
      metadata: { project_name: "OpenTrip Funnel Analytics", period: "2026" },
      sources: [
        {
          name: "TikTok Reels",
          pengunjung: 500,
          isi_form: 200,
          chat_admin: 100,
          bayar_dp: 45,
          lunas: 20,
          conversion_rate: 4.0,
          status: "Top",
        },
        {
          name: "Instagram Ads",
          pengunjung: 400,
          isi_form: 150,
          chat_admin: 70,
          bayar_dp: 30,
          lunas: 14,
          conversion_rate: 3.5,
          status: "Stable",
        },
        {
          name: "WhatsApp Organic",
          pengunjung: 300,
          isi_form: 100,
          chat_admin: 40,
          bayar_dp: 20,
          lunas: 8,
          conversion_rate: 2.6,
          status: "Alert",
        },
      ],
    };
  }
  return JSON.parse(JSON.stringify(window.openTripFunnelData));
}

async function fetchOpenTripData() {
  try {
    const { data, error } = await supabaseClient
      .from("opentrip_sources")
      .select("*");

    if (error) throw error;

    appData = {
      metadata: { project_name: "OpenTrip Funnel Analytics", period: "2026" },
      sources: data && data.length > 0 ? data : getLocalOpenTripData().sources,
    };

    setupNavigation();
    setupFilters();
    renderPage(currentPage);
  } catch (error) {
    console.error("Gagal terhubung ke Supabase:", error);
    appData = getLocalOpenTripData();
    setupNavigation();
    setupFilters();
    renderPage(currentPage);
  }
}

/* ================= NAVIGATION & FILTERS ================= */
function setupNavigation() {
  document.querySelectorAll(".menu-item").forEach(function (item) {
    item.onclick = function () {
      setActiveMenu(item.dataset.page);
      renderPage(item.dataset.page);
    };
  });
}

function setActiveMenu(page) {
  document.querySelectorAll(".menu-item").forEach(function (item) {
    item.classList.remove("active");
    if (item.dataset.page === page) item.classList.add("active");
  });
}

function setupFilters() {
  if (channelFilter) {
    channelFilter.onchange = function () {
      currentChannel = channelFilter.value;
      renderPage(currentPage);
    };
  }
  if (dateFilter) {
    dateFilter.onchange = function () {
      currentDateRange = dateFilter.value;
      renderPage(currentPage);
    };
  }
}

/* ================= DATA PROCESSING ================= */
function getMetricsByRangeAndChannel(
  range = currentDateRange,
  channel = currentChannel,
) {
  const sources = (
    Array.isArray(appData.sources) ? appData.sources : []
  ).filter(function (source) {
    return channel === "all" || source.name === channel;
  });

  const summary = sources.reduce(
    function (totals, source) {
      totals.total_pengunjung += Number(source.pengunjung || 0);
      totals.total_isi_form += Number(source.isi_form || 0);
      totals.total_chat_admin += Number(source.chat_admin || 0);
      totals.total_bayar_dp += Number(source.bayar_dp || 0);
      totals.total_lunas += Number(source.lunas || 0);
      return totals;
    },
    {
      total_pengunjung: 0,
      total_isi_form: 0,
      total_chat_admin: 0,
      total_bayar_dp: 0,
      total_lunas: 0,
    },
  );

  const conversion_rate = calculateConversionRate(
    summary.total_pengunjung,
    summary.total_lunas,
  );

  return {
    sources: sources,
    summary: summary,
    conversion_rate: conversion_rate,
  };
}

function getFilteredSources() {
  return getMetricsByRangeAndChannel(currentDateRange, currentChannel).sources;
}

function getFilteredSummary() {
  return getMetricsByRangeAndChannel(currentDateRange, currentChannel).summary;
}

function formatAnimatedNumber(value, format, decimals) {
  if (format === "percent") return `${Number(value).toFixed(decimals)}%`;
  return Math.round(Number(value)).toLocaleString("id-ID");
}

function formatConversionRate(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00";
}

function calculateConversionRate(visitors, enrolled) {
  const visitorCount = Number(visitors || 0);
  const enrolledCount = Number(enrolled || 0);
  return visitorCount === 0 ? 0 : (enrolledCount / visitorCount) * 100;
}

function animateNumber(element, targetValue, options = {}) {
  const duration = options.duration || 900;
  const format = options.format || "int";
  const decimals = Number(options.decimals || 0);
  const target = Number(targetValue);
  const startTime = performance.now();

  if (!Number.isFinite(target)) return;

  function updateFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 4);
    const currentValue = target * easedProgress;

    element.textContent = formatAnimatedNumber(currentValue, format, decimals);

    if (progress < 1) {
      requestAnimationFrame(updateFrame);
    } else {
      element.textContent = formatAnimatedNumber(target, format, decimals);
    }
  }

  element.textContent = formatAnimatedNumber(0, format, decimals);
  requestAnimationFrame(updateFrame);
}

function runDashboardAnimations() {
  document.querySelectorAll("[data-count-up]").forEach(function (element) {
    animateNumber(element, element.dataset.value, {
      format: element.dataset.format || "int",
      decimals: element.dataset.decimals || 0,
    });
  });

  document.querySelectorAll(".bar-fill[data-width]").forEach(function (bar) {
    bar.style.width = "0%";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.style.width = `${bar.dataset.width}%`;
      });
    });
  });
}

function getSummaryStages(summary = getFilteredSummary()) {
  return [
    { label: "Pengunjung", count: Number(summary.total_pengunjung) },
    { label: "Isi Form", count: Number(summary.total_isi_form) },
    { label: "Chat Admin", count: Number(summary.total_chat_admin) },
    { label: "Bayar DP", count: Number(summary.total_bayar_dp) },
    { label: "Lunas", count: Number(summary.total_lunas) },
  ];
}

function getHighestDrop(stages) {
  let highestDrop = { label: "-", value: 0, percent: 0 };

  for (let i = 1; i < stages.length; i++) {
    const previous = stages[i - 1];
    const current = stages[i];
    if (previous.count === 0) continue;

    const dropValue = previous.count - current.count;
    const dropPercent = (dropValue / previous.count) * 100;

    if (dropValue > highestDrop.value) {
      highestDrop = {
        label: `${previous.label} ke ${current.label}`,
        value: dropValue,
        percent: dropPercent,
      };
    }
  }
  return highestDrop;
}

/* ================= PAGE RENDER ================= */
function renderPage(page) {
  currentPage = page;

  if (monthlyChart) {
    monthlyChart.destroy();
    monthlyChart = null;
  }

  if (page === "overview") renderOverview();
  if (page === "channel") renderChannelAnalysis();
  if (page === "funnel") renderFunnelDepth();
  if (page === "table") renderDataTable();

  runDashboardAnimations();
}

/* ================= OVERVIEW ================= */
function renderOverview() {
  const metrics = getMetricsByRangeAndChannel(currentDateRange, currentChannel);
  const summary = metrics.summary;
  const stages = getSummaryStages(summary);
  const highestDrop = getHighestDrop(stages);

  const bestSource = [...metrics.sources].sort(function (a, b) {
    return Number(b.conversion_rate) - Number(a.conversion_rate);
  })[0];

  app.innerHTML = `
    <section class="page-title">
      <p>OPENTRIP ACQUISITION OVERVIEW</p>
      <h1>Trip Booking Overview</h1>
      <span>Monitor konversi perjalanan dan identifikasi penurunan calon peserta tour.</span>
    </section>

    <section class="summary">
      <div class="summary-card">
        <h3>Total Visitors</h3>
        <p data-count-up data-value="${summary.total_pengunjung}">${summary.total_pengunjung.toLocaleString("id-ID")}</p>
      </div>

      <div class="summary-card">
        <h3>Isi Form</h3>
        <p data-count-up data-value="${summary.total_isi_form}">${summary.total_isi_form.toLocaleString("id-ID")}</p>
      </div>

      <div class="summary-card">
        <h3>Conversion Rate</h3>
        <p data-count-up data-value="${formatConversionRate(metrics.conversion_rate)}" data-format="percent" data-decimals="2">${formatConversionRate(metrics.conversion_rate)}%</p>
      </div>
    </section>

    <section class="dashboard-grid">
      <div class="card">
        <div class="section-header">
          <div>
            <h2>Booking Funnel</h2>
            <span>Visitor to Confirmed Trip Flow</span>
          </div>
        </div>
        <div id="overviewFunnel"></div>
      </div>

      <aside class="card insight-card">
        <h2>Key Insight</h2>
        <div class="insight-value" data-count-up data-value="${highestDrop.percent.toFixed(1)}" data-format="percent" data-decimals="1">${highestDrop.percent.toFixed(1)}%</div>
        <p>
          Drop-off tertinggi terdeteksi antara
          <strong>${highestDrop.label}</strong>.
          Kehilangan user: <span data-count-up data-value="${highestDrop.value}">${highestDrop.value.toLocaleString("id-ID")}</span>.
        </p>
        <hr />
        <p>
          Channel terbaik:
          <strong>${bestSource ? bestSource.name : "-"}</strong>
          dengan CVR ${bestSource ? formatConversionRate(bestSource.conversion_rate) : 0}%.
        </p>
      </aside>
    </section>
  `;

  renderFunnelBars("overviewFunnel", stages);
}

/* ================= CHANNEL ANALYSIS ================= */
function renderChannelAnalysis() {
  const metrics = getMetricsByRangeAndChannel(currentDateRange, currentChannel);
  const filteredSources = metrics.sources;

  const channelCards = filteredSources
    .map(function (source) {
      const badgeClass = source.status === "Alert" ? "risk" : "stable";

      return `
      <div class="channel-card">
        <div class="channel-top">
          <h2>${source.name}</h2>
          <span class="badge ${badgeClass}">${source.status}</span>
        </div>
        <p class="label">Visitors</p>
        <h3 data-count-up data-value="${Number(source.pengunjung)}">${Number(source.pengunjung).toLocaleString("id-ID")}</h3>
        <div class="channel-stats">
          <div>
            <span>Lunas</span>
            <strong data-count-up data-value="${Number(source.lunas)}">${source.lunas}</strong>
          </div>
          <div>
            <span>Conv. Rate</span>
            <strong data-count-up data-value="${Number(source.conversion_rate)}" data-format="percent" data-decimals="2">${formatConversionRate(source.conversion_rate)}%</strong>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  app.innerHTML = `
    <section class="page-title">
      <p>TRAFFIC SOURCES</p>
      <h1>Channel Performance</h1>
      <span>Performa konversi dari berbagai platform sosial media & iklan.</span>
    </section>
    <section class="channel-grid">
      ${channelCards}
    </section>
    <section class="card">
      <h2>Channel Traffic Volume</h2>
      <canvas id="monthlyChart"></canvas>
    </section>
  `;

  renderMonthlyChart();
}

/* ================= FUNNEL DEPTH ================= */
function renderFunnelDepth() {
  const metrics = getMetricsByRangeAndChannel(currentDateRange, currentChannel);
  const stages = getSummaryStages(metrics.summary);
  const highestDrop = getHighestDrop(stages);

  app.innerHTML = `
    <section class="page-title">
      <p>TRIP INTELLIGENCE</p>
      <h1>Funnel Depth Analysis</h1>
      <span>Analisis detail perjalanan booking dari klik awal hingga pelunasan tiket tour.</span>
    </section>
    <section class="dashboard-grid">
      <div class="card">
        <h2>Conversion Stages</h2>
        <div id="depthFunnel"></div>
      </div>
      <aside>
        <div class="card friction-card">
          <h2>Booking Friction</h2>
          <p>Penurunan <strong>${highestDrop.percent.toFixed(1)}%</strong> pada tahap ${highestDrop.label} memerlukan perhatian khusus.</p>
        </div>
        <div class="card">
          <h3>Total Yield Lunas</h3>
          <div class="final-yield" data-count-up data-value="${formatConversionRate(metrics.conversion_rate)}" data-format="percent" data-decimals="2">${formatConversionRate(metrics.conversion_rate)}%</div>
          <p>Konversi keseluruhan pengunjung jadi peserta fix trip.</p>
        </div>
      </aside>
    </section>
  `;

  renderFunnelBars("depthFunnel", stages);
}

/* ================= DATA TABLE (FORM & SUPABASE SYNC) ================= */
function renderDataTable() {
  const metrics = getMetricsByRangeAndChannel(currentDateRange, currentChannel);
  const filteredSources = metrics.sources;
  const summary = metrics.summary;

  const rows = filteredSources
    .map(function (source) {
      const dpVal =
        source.bayar_dp !== undefined && !isNaN(source.bayar_dp)
          ? Number(source.bayar_dp)
          : 0;
      return `
      <tr>   
        <td>${source.name}</td>
        <td>${Number(source.pengunjung).toLocaleString("id-ID")}</td>
        <td>${Number(source.isi_form).toLocaleString("id-ID")}</td>
        <td>${Number(source.chat_admin).toLocaleString("id-ID")}</td>
        <td>${dpVal.toLocaleString("id-ID")}</td>
        <td>${Number(source.lunas).toLocaleString("id-ID")}</td>
        <td>${formatConversionRate(source.conversion_rate)}%</td>
        <td>${source.status}</td>
      </tr>
    `;
    })
    .join("");

  app.innerHTML = `
    <section class="page-title">
      <p>ANALYTICS DATA</p>
      <h1>Acquisition Grid</h1>
      <span>Tabel rekapitulasi data pendaftaran opentrip.</span>
    </section>
    
    <section class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Channel Source</th>
            <th>Pengunjung</th>
            <th>Isi Form</th>
            <th>Chat Admin</th>
            <th>Bayar DP</th>
            <th>Lunas</th>
            <th>CVR</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td>TOTAL</td>
            <td>${summary.total_pengunjung.toLocaleString("id-ID")}</td>
            <td>${summary.total_isi_form.toLocaleString("id-ID")}</td>
            <td>${summary.total_chat_admin.toLocaleString("id-ID")}</td>
            <td>${(summary.total_bayar_dp || 0).toLocaleString("id-ID")}</td>
            <td>${summary.total_lunas.toLocaleString("id-ID")}</td>
            <td>${formatConversionRate(metrics.conversion_rate)}%</td>
            <td>Overall</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- FORM INPUT DATA PESERTA DI BAWAH TABEL -->
    <section class="card" style="margin-top: 26px;">
      <h2>+ Tambah Data Pendaftar</h2>
      <p style="margin-bottom: 20px;">Masukkan peserta baru untuk langsung mengupdate overview & grafik ke cloud database.</p>
      
      <form id="inlineParticipantForm">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="form-group">
            <label for="inlineName">Nama Peserta</label>
            <input type="text" id="inlineName" placeholder="Contoh: Budi Santoso" required />
          </div>

          <div class="form-group">
            <label for="inlineChannel">Channel Traffic</label>
            <select id="inlineChannel" required>
              <option value="TikTok Reels">TikTok Reels</option>
              <option value="Instagram Ads">Instagram Ads</option>
              <option value="WhatsApp Organic">WhatsApp Organic</option>
            </select>
          </div>

          <div class="form-group">
            <label for="inlineStage">Progress Funnel</label>
            <select id="inlineStage" required>
              <option value="isi_form">1. Isi Form</option>
              <option value="chat_admin">2. Chat Admin</option>
              <option value="bayar_dp">3. Bayar DP</option>
              <option value="lunas">4. Lunas (Fix Berangkat)</option>
            </select>
          </div>
        </div>

        <button type="submit" class="auth-button" style="width: auto; padding: 0 24px; margin-top: 16px;">Simpan ke Supabase</button>
      </form>
    </section>
  `;

  const inlineForm = document.getElementById("inlineParticipantForm");
  if (inlineForm) {
    inlineForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = document.getElementById("inlineName").value;
      const channelName = document.getElementById("inlineChannel").value;
      const stage = document.getElementById("inlineStage").value;

      let targetSource = appData.sources.find((s) => s.name === channelName);

      if (targetSource) {
        targetSource.pengunjung = Number(targetSource.pengunjung || 0) + 1;
        targetSource.bayar_dp = Number(targetSource.bayar_dp || 0);

        if (stage === "isi_form") {
          targetSource.isi_form = Number(targetSource.isi_form || 0) + 1;
        } else if (stage === "chat_admin") {
          targetSource.isi_form = Number(targetSource.isi_form || 0) + 1;
          targetSource.chat_admin = Number(targetSource.chat_admin || 0) + 1;
        } else if (stage === "bayar_dp") {
          targetSource.isi_form = Number(targetSource.isi_form || 0) + 1;
          targetSource.chat_admin = Number(targetSource.chat_admin || 0) + 1;
          targetSource.bayar_dp = Number(targetSource.bayar_dp || 0) + 1;
        } else if (stage === "lunas") {
          targetSource.isi_form = Number(targetSource.isi_form || 0) + 1;
          targetSource.chat_admin = Number(targetSource.chat_admin || 0) + 1;
          targetSource.bayar_dp = Number(targetSource.bayar_dp || 0) + 1;
          targetSource.lunas = Number(targetSource.lunas || 0) + 1;
        }

        targetSource.conversion_rate = calculateConversionRate(
          targetSource.pengunjung,
          targetSource.lunas,
        );

        // KIRIM UPDATE KE SUPABASE DATABASE
        const { error } = await supabaseClient
          .from("opentrip_sources")
          .update({
            pengunjung: targetSource.pengunjung,
            isi_form: targetSource.isi_form,
            chat_admin: targetSource.chat_admin,
            bayar_dp: targetSource.bayar_dp,
            lunas: targetSource.lunas,
            conversion_rate: targetSource.conversion_rate,
          })
          .eq("name", channelName);

        if (error) {
          console.error("Gagal memperbarui Supabase:", error);
          alert("Gagal menyimpan ke database Supabase!");
          return;
        }
      }

      renderDataTable();
      alert(
        `Berhasil! Data peserta "${name}" tersimpan secara permanen di Supabase.`,
      );
    });
  }
}

/* ================= FUNNEL BAR & CHART ================= */
function renderFunnelBars(containerId, stages) {
  const container = document.getElementById(containerId);
  const firstCount = stages[0].count;

  container.innerHTML = stages
    .map(function (stage, index) {
      const width = firstCount === 0 ? 0 : (stage.count / firstCount) * 100;
      let dropText = "";

      if (index > 0) {
        const previous = stages[index - 1];
        if (previous.count > 0) {
          const drop = previous.count - stage.count;
          const dropPercent = (drop / previous.count) * 100;
          dropText = `<div class="drop">${dropPercent.toFixed(1)}% drop-off</div>`;
        }
      }

      return `
      <div class="funnel-stage">
        <div class="stage-label">
          <strong>${stage.label}</strong>
          <span>${stage.count.toLocaleString("id-ID")}</span>
        </div>
        <div class="bar-bg">
          <div class="bar-fill" data-width="${width}" style="width: 0%"></div>
        </div>
        ${dropText}
      </div>
    `;
    })
    .join("");
}

function renderMonthlyChart() {
  if (typeof Chart === "undefined") return;

  const ctx = document.getElementById("monthlyChart").getContext("2d");
  const sources = getFilteredSources();

  const labels = sources.map((s) => s.name);
  const visitors = sources.map((s) => s.pengunjung);

  monthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Pengunjung",
          data: visitors,
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          hoverBackgroundColor: "rgba(5, 150, 105, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#cbd5e1" } } },
      scales: {
        x: {
          ticks: { color: "#cbd5e1" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#cbd5e1" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
      },
    },
  });
}

/* ================= HERMES CHATBOT WIDGET SETUP ================= */
function injectHermesChatWidget() {
  if (document.getElementById("hermesChatWidget")) return;

  const widgetContainer = document.createElement("div");
  widgetContainer.id = "hermesChatWidget";
  widgetContainer.style.cssText =
    "position: fixed; bottom: 20px; right: 20px; z-index: 9999;";
  widgetContainer.innerHTML = `
    <button id="toggleChatBtn" style="background: #10b981; color: #fff; border: none; border-radius: 50%; width: 56px; height: 56px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 24px;">💬</button>
    <div id="chatBox" class="hidden" style="position: absolute; bottom: 70px; right: 0; width: 340px; height: 450px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
      <div style="background: #0f172a; padding: 12px 16px; color: #fff; font-weight: bold; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155;">
        <span>Hermes AI Assistant</span>
        <button id="closeChatBtn" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 18px;">✕</button>
      </div>
      <div id="chatMessages" style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #e2e8f0;">
        <div style="background: #334155; padding: 8px 12px; border-radius: 8px; max-width: 80%; align-self: flex-start;">
          Halo! Ada yang bisa saya bantu terkait analitik OpenTrip kamu?
        </div>
      </div>
      <form id="chatForm" style="display: flex; padding: 8px; background: #0f172a; border-top: 1px solid #334155;">
        <input type="text" id="chatInput" placeholder="Ketik pesan..." required style="flex: 1; background: #1e293b; border: 1px solid #334155; color: #fff; padding: 8px 12px; border-radius: 6px; outline: none; font-size: 13px;">
        <button type="submit" style="background: #10b981; color: white; border: none; padding: 8px 14px; margin-left: 6px; border-radius: 6px; cursor: pointer; font-weight: bold;">Kirim</button>
      </form>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  const toggleChatBtn = document.getElementById("toggleChatBtn");
  const closeChatBtn = document.getElementById("closeChatBtn");
  const chatBox = document.getElementById("chatBox");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  toggleChatBtn.addEventListener("click", () =>
    chatBox.classList.toggle("hidden"),
  );
  closeChatBtn.addEventListener("click", () => chatBox.classList.add("hidden"));

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;

    appendMessage(userMsg, "user");
    chatInput.value = "";

    const loadingId = appendMessage("Hermes sedang mengetik...", "bot");

    try {
      // Sesuaikan port URL endpoint lokal Hermes Agent kamu jika berbeda (misal 8000 / 3000)
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await response.json();
      document.getElementById(loadingId).innerText =
        data.reply || data.response || "Maaf, Hermes tidak memberikan respon.";
    } catch (err) {
      document.getElementById(loadingId).innerText =
        "Gagal terhubung ke Hermes Agent server lokal.";
    }
  });

  function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    const msgId = "msg-" + Date.now();
    msgDiv.id = msgId;
    msgDiv.style.padding = "8px 12px";
    msgDiv.style.borderRadius = "8px";
    msgDiv.style.maxWidth = "80%";
    msgDiv.style.wordBreak = "break-word";

    if (sender === "user") {
      msgDiv.style.background = "#10b981";
      msgDiv.style.color = "#fff";
      msgDiv.style.alignSelf = "flex-end";
    } else {
      msgDiv.style.background = "#334155";
      msgDiv.style.color = "#e2e8f0";
      msgDiv.style.alignSelf = "flex-start";
    }

    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgId;
  }
}

/* ================= INIT (CEK SESI LOGIN) ================= */
window.addEventListener("load", async function () {
  showLoginPage();

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session) {
    showDashboardPage();
    injectHermesChatWidget();
  }
});
