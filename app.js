/* إعدادات التواصل الخاصة بموتورز */
const SITE_CONFIG = {
  whatsappNumber: "201550329383",
  phoneNumber: "01550329383",
  facebookUrl: "https://www.facebook.com/share/19d9WSTcMh/",
  showroomHours: "السبت إلى الخميس: 10 صباحًا – 10 مساءً | الجمعة: 2 ظهرًا – 10 مساءً"
};

const $ = id => document.getElementById(id);
const carsGrid = $("carsGrid");
const brandFilter = $("brandFilter");
const typeFilter = $("typeFilter");
const priceFilter = $("priceFilter");
const sortFilter = $("sortFilter");
const emptyState = $("emptyState");
const requestedCar = $("requestedCar");
const resultsCount = $("resultsCount");
const compareBar = $("compareBar");
const selectedForCompare = new Set();
let cars = [];
let activeCar = null;

const TYPE_LABELS = { SUV: "SUV", Sedan: "سيدان", Coupe: "كوبيه", Hatchback: "هاتشباك" };
const typeLabel = type => TYPE_LABELS[type] || type;
const formatNumber = value => new Intl.NumberFormat("ar-EG").format(value);
const formatPrice = value => `${formatNumber(value)} جنيه`;
const safeText = value => value === undefined || value === null || value === "" ? "غير محدد" : String(value);
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function placeholderMarkup(name) {
  return `<div class="photo-placeholder"><b>▱</b><span>أضف صورة ${escapeHTML(name)}</span></div>`;
}
function carImageMarkup(car) {
  return car.image
    ? `<img src="${escapeHTML(car.image)}" alt="${escapeHTML(car.name)}" data-fallback-name="${escapeHTML(car.name)}" loading="lazy">`
    : placeholderMarkup(car.name);
}
document.addEventListener("error", event => {
  const img = event.target;
  if (img && img.tagName === "IMG" && img.dataset.fallbackName) img.outerHTML = placeholderMarkup(img.dataset.fallbackName);
}, true);

function populateFilters() {
  const brands = [...new Set(cars.map(c => c.brand).filter(Boolean))].sort();
  const types = [...new Set(cars.map(c => c.type).filter(Boolean))].sort();
  brandFilter.innerHTML = '<option value="all">كل الماركات</option>' + brands.map(b => `<option value="${escapeHTML(b)}">${escapeHTML(b)}</option>`).join("");
  typeFilter.innerHTML = '<option value="all">كل الفئات</option>' + types.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(typeLabel(t))}</option>`).join("");
}
function priceMatches(price, range) {
  if (range === "under2") return price < 2000000;
  if (range === "2to3") return price >= 2000000 && price < 3000000;
  if (range === "3to4") return price >= 3000000 && price < 4000000;
  if (range === "4to5") return price >= 4000000 && price <= 5000000;
  if (range === "over5") return price > 5000000;
  return true;
}
function getFilteredCars() {
  const brand = brandFilter.value, type = typeFilter.value, price = priceFilter.value;
  const filtered = cars.filter(car =>
    (brand === "all" || car.brand === brand) &&
    (type === "all" || car.type === type) &&
    priceMatches(Number(car.price), price)
  );
  const sort = sortFilter.value;
  if (sort === "priceAsc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "newest") filtered.sort((a, b) => b.year - a.year);
  return filtered;
}

function renderCars() {
  const filtered = getFilteredCars();
  resultsCount.textContent = `عدد النتائج: ${formatNumber(filtered.length)} سيارة`;
  carsGrid.innerHTML = filtered.map(car => {
    const checked = selectedForCompare.has(car.id);
    const disabled = selectedForCompare.size >= 2 && !checked;
    return `
      <article class="car-card">
        <div class="car-image">${carImageMarkup(car)}
          <span class="car-tag">${escapeHTML(car.tag || "متاحة الآن")}</span>
          <label class="compare-check"><input type="checkbox" data-compare="${car.id}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}><span>قارن</span></label>
        </div>
        <div class="car-info">
          <span class="car-brand">${escapeHTML(car.brand)} · موديل ${escapeHTML(car.year)}</span>
          <h3>${escapeHTML(car.name)}</h3>
          <div class="car-specs"><span>⚙ ${escapeHTML(safeText(car.engine))}</span><span>↔ ${escapeHTML(safeText(car.transmission))}</span><span>◈ ${escapeHTML(safeText(car.year))}</span></div>
          <div class="car-bottom"><div class="car-price">${formatPrice(Number(car.price))}</div></div>
          <div class="car-actions">
            <button class="btn btn-light details-button" type="button" data-details="${car.id}">التفاصيل</button>
            <button class="btn btn-primary quote-button" type="button" data-quote="${car.id}">اطلب عرض سعر</button>
          </div>
        </div>
      </article>`;
  }).join("");
  emptyState.hidden = filtered.length > 0;
  carsGrid.hidden = filtered.length === 0;
  setupReveal();
  updateCompareBar();
}
function populateCarOptions() {
  requestedCar.innerHTML = '<option value="">اختر السيارة</option>' +
    cars.map(car => `<option value="${escapeHTML(car.name)}">${escapeHTML(car.name)}</option>`).join("");
}

function openCarModal(car) {
  activeCar = car;
  $("modalBrand").textContent = `${car.brand} · ${typeLabel(car.type)}`;
  $("modalCarName").textContent = car.name;
  $("modalPrice").textContent = formatPrice(Number(car.price));
  $("modalImage").innerHTML = carImageMarkup(car);
  const specs = [
    ["الموديل", car.year], ["سعة المحرك", car.engine], ["قوة المحرك", car.power],
    ["ناقل الحركة", car.transmission], ["استهلاك البنزين", car.fuel],
    ["عدد المقاعد", car.seats], ["اللون", car.color], ["الضمان", car.warranty],
    ["الفئة", typeLabel(car.type)]
  ];
  $("modalSpecs").innerHTML = specs.map(([label, value]) =>
    `<div class="spec-item"><small>${label}</small><strong>${escapeHTML(safeText(value))}</strong></div>`
  ).join("");
  $("carModal").classList.add("show");
  $("carModal").setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  $("closeModal").focus();
}
function closeModal() {
  $("carModal").classList.remove("show");
  $("carModal").setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
function setRequestedCar(car) {
  requestedCar.value = car.name;
  $("contact").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => $("customerName").focus(), 450);
}

function updateCompareBar() {
  compareBar.hidden = selectedForCompare.size === 0;
  $("compareSelection").textContent = `تم اختيار ${selectedForCompare.size} من 2`;
  $("compareNow").disabled = selectedForCompare.size !== 2;
}
function clearCompare() { selectedForCompare.clear(); renderCars(); }
function openCompare() {
  if (selectedForCompare.size !== 2) return;
  const chosen = cars.filter(car => selectedForCompare.has(car.id));
  const rows = [
    ["السعر", ...chosen.map(c => formatPrice(c.price))], ["الموديل", ...chosen.map(c => safeText(c.year))],
    ["الماركة", ...chosen.map(c => safeText(c.brand))], ["الفئة", ...chosen.map(c => typeLabel(safeText(c.type)))],
    ["سعة المحرك", ...chosen.map(c => safeText(c.engine))], ["قوة المحرك", ...chosen.map(c => safeText(c.power))],
    ["ناقل الحركة", ...chosen.map(c => safeText(c.transmission))], ["استهلاك البنزين", ...chosen.map(c => safeText(c.fuel))],
    ["عدد المقاعد", ...chosen.map(c => safeText(c.seats))], ["اللون", ...chosen.map(c => safeText(c.color))],
    ["الضمان", ...chosen.map(c => safeText(c.warranty))]
  ];
  $("compareTableWrap").innerHTML = `<div class="compare-table-scroll"><table class="compare-table">
    <thead><tr><th>المواصفة</th>${chosen.map(c => `<th>${escapeHTML(c.name)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(row => `<tr><th>${row[0]}</th>${row.slice(1).map(v => `<td>${escapeHTML(v)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
  $("compareModal").classList.add("show");
  $("compareModal").setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}
function closeCompare() {
  $("compareModal").classList.remove("show");
  $("compareModal").setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
function resetFilters() {
  brandFilter.value = typeFilter.value = priceFilter.value = "all";
  sortFilter.value = "featured";
  renderCars();
}

[brandFilter, typeFilter, priceFilter, sortFilter].forEach(control => control.addEventListener("change", renderCars));
$("resetFilters").addEventListener("click", resetFilters);
$("emptyReset").addEventListener("click", resetFilters);
carsGrid.addEventListener("click", event => {
  const details = event.target.closest("[data-details]");
  const quote = event.target.closest("[data-quote]");
  if (details) {
    const car = cars.find(item => item.id === Number(details.dataset.details));
    if (car) openCarModal(car);
  }
  if (quote) {
    const car = cars.find(item => item.id === Number(quote.dataset.quote));
    if (car) setRequestedCar(car);
  }
});
carsGrid.addEventListener("change", event => {
  const checkbox = event.target.closest("[data-compare]");
  if (!checkbox) return;
  const id = Number(checkbox.dataset.compare);
  if (checkbox.checked) {
    if (selectedForCompare.size >= 2) { checkbox.checked = false; return; }
    selectedForCompare.add(id);
  } else selectedForCompare.delete(id);
  renderCars();
});
$("clearCompare").addEventListener("click", clearCompare);
$("compareNow").addEventListener("click", openCompare);
$("closeModal").addEventListener("click", closeModal);
$("carModal").addEventListener("click", event => { if (event.target === $("carModal")) closeModal(); });
$("modalQuote").addEventListener("click", () => { if (activeCar) setRequestedCar(activeCar); closeModal(); });
$("closeCompare").addEventListener("click", closeCompare);
$("compareModal").addEventListener("click", event => { if (event.target === $("compareModal")) closeCompare(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") { closeModal(); closeCompare(); } });

const normalizeEgyptianPhone = value => value.replace(/[^\d]/g, "");
const isValidEgyptianPhone = value => /^(010|011|012|015)\d{8}$/.test(normalizeEgyptianPhone(value));
$("customerPhone").addEventListener("input", event => {
  event.target.value = event.target.value.replace(/[^\d]/g, "").slice(0, 11);
});
$("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("customerName").value.trim();
  const phone = normalizeEgyptianPhone($("customerPhone").value);
  const car = requestedCar.value;
  const notes = $("customerMessage").value.trim();
  const messageEl = $("formMessage");
  messageEl.className = "form-message";

  if (!name || name.length < 2 || !car) {
    messageEl.textContent = "من فضلك املأ الاسم واختر السيارة المطلوبة.";
    messageEl.classList.add("error");
    return;
  }
  if (!isValidEgyptianPhone(phone)) {
    messageEl.textContent = "رقم الموبايل غير صحيح. اكتب رقمًا مصريًا صحيحًا مكوّنًا من 11 رقمًا.";
    messageEl.classList.add("error");
    $("customerPhone").focus();
    return;
  }

  const whatsappMessage = `السلام عليكم، أنا ${name}، مهتم بـ ${car}، رقمي ${phone}.${notes ? ` ملاحظات إضافية: ${notes}` : ""}`;
  messageEl.textContent = "هيتم فتح واتساب برسالة جاهزة؛ اضغط إرسال لتأكيد الطلب.";
  messageEl.classList.add("success");
  const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
});

const setText = (id, value) => { const el = $(id); if (el) el.textContent = value; };
function applyContactSettings() {
  setText("showroomHours", SITE_CONFIG.showroomHours);
  const phone = SITE_CONFIG.phoneNumber;
  const phoneEl = $("showroomPhone");
  if (phoneEl) {
    phoneEl.textContent = phone;
    phoneEl.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
  }
  const tel = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}`;
  if ($("callLink")) $("callLink").href = tel;
  if ($("whatsappLink")) $("whatsappLink").href = waUrl;
  if ($("contactWhatsapp")) $("contactWhatsapp").href = waUrl;
  if ($("facebookLink")) $("facebookLink").href = SITE_CONFIG.facebookUrl;
}

function setupNavigation() {
  const header = $("siteHeader"), navLinks = $("navLinks"), menuToggle = $("menuToggle");
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 20), { passive: true });
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
  });
  navLinks.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }));
  const sections = [...document.querySelectorAll("main section[id]")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) navLinks.querySelectorAll("a").forEach(a =>
          a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => observer.observe(section));
  }
}

let revealObserver = null;
function setupReveal() {
  const elements = document.querySelectorAll(".reveal:not(.visible), .cars-section .car-card:not(.visible)");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach(el => el.classList.add("visible"));
    return;
  }
  if (!revealObserver) revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  elements.forEach(el => revealObserver.observe(el));
}

async function init() {
  setText("year", new Date().getFullYear());
  setupNavigation();
  setupReveal();
  applyContactSettings();
  try {
    const response = await fetch("cars.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`تعذر تحميل ملف cars.json (HTTP ${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("ملف cars.json لازم يكون قائمة (array) من السيارات.");
    cars = data;
    populateFilters();
    populateCarOptions();
    renderCars();
  } catch (error) {
    console.error(error);
    resultsCount.textContent = error instanceof SyntaxError
      ? "ملف cars.json فيه خطأ في الصياغة. افتح Console (F12) لمعرفة السطر."
      : "تعذر تحميل السيارات. تأكد من وجود ملف cars.json بجوار index.html وتشغيل الموقع عبر Live Server.";
    carsGrid.innerHTML = "";
    emptyState.hidden = false;
  }
}
init();
