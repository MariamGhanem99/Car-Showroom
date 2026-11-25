/* =========================
   إعدادات المعرض — عدّل هذه البيانات قبل النشر
   ========================= */
const SITE_CONFIG = {
  // اكتب الرقم بصيغة دولية بدون + أو مسافات، مثال مصر: 2010XXXXXXX
  whatsappNumber: "201000000000",
  // رقم الهاتف المحلي للاتصال، مثال: 010XXXXXXXX
  phoneNumber: "",
  showroomAddress: "أضف عنوان المعرض الفعلي هنا",
  showroomHours: "أضف مواعيد العمل هنا",
  facebookUrl: "",
  instagramUrl: "",
  // ضع رابط Google Maps Embed الحقيقي (iframe src) بعد تحديد موقع المعرض
  googleMapsEmbedUrl: ""
};

const carsGrid = document.getElementById("carsGrid");
const brandFilter = document.getElementById("brandFilter");
const typeFilter = document.getElementById("typeFilter");
const priceFilter = document.getElementById("priceFilter");
const sortFilter = document.getElementById("sortFilter");
const emptyState = document.getElementById("emptyState");
const requestedCar = document.getElementById("requestedCar");
const resultsCount = document.getElementById("resultsCount");
const compareBar = document.getElementById("compareBar");
const selectedForCompare = new Set();
let cars = [];
let activeCar = null;

const $ = id => document.getElementById(id);
const formatPrice = value => `${new Intl.NumberFormat("ar-EG").format(value)} جنيه`;
const safeText = value => value === undefined || value === null || value === "" ? "غير محدد" : String(value);
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[char]));

function carImageMarkup(car, className = "") {
  if (car.image) {
    return `<img class="${className}" src="${escapeHTML(car.image)}" alt="${escapeHTML(car.brand)} ${escapeHTML(car.name)}" loading="lazy">`;
  }
  return `<div class="photo-placeholder ${className}"><b>▱</b><span>أضف صورة ${escapeHTML(car.name)}</span></div>`;
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
  const brand = brandFilter.value;
  const type = typeFilter.value;
  const price = priceFilter.value;
  const filtered = cars.filter(car =>
    (brand === "all" || car.brand === brand) &&
    (type === "all" || car.type === type) &&
    priceMatches(Number(car.price), price)
  );
  const sort = sortFilter.value;
  if (sort === "priceAsc") filtered.sort((a,b) => a.price - b.price);
  if (sort === "priceDesc") filtered.sort((a,b) => b.price - a.price);
  if (sort === "newest") filtered.sort((a,b) => b.year - a.year);
  return filtered;
}

function renderCars() {
  const filtered = getFilteredCars();
  resultsCount.textContent = `عدد النتائج: ${new Intl.NumberFormat("ar-EG").format(filtered.length)} سيارة`;

  carsGrid.innerHTML = filtered.map(car => {
    const checked = selectedForCompare.has(car.id);
    return `
      <article class="car-card">
        <div class="car-image">
          ${carImageMarkup(car)}
          <span class="car-tag">${escapeHTML(car.tag || "متاحة الآن")}</span>
          <label class="compare-check"><input type="checkbox" data-compare="${car.id}" ${checked ? "checked" : ""} ${selectedForCompare.size >= 2 && !checked ? "disabled" : ""}><span>قارن</span></label>
        </div>
        <div class="car-info">
          <span class="car-brand">${escapeHTML(car.brand)} · موديل ${escapeHTML(car.year)}</span>
          <h3>${escapeHTML(car.name)}</h3>
          <div class="car-specs">
            <span>⚙ ${escapeHTML(safeText(car.engine))}</span>
            <span>↔ ${escapeHTML(safeText(car.transmission))}</span>
            <span>◈ ${escapeHTML(safeText(car.year))}</span>
          </div>
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
  setupReveal(); // Attach scroll-reveal behavior to newly rendered cards too.
  updateCompareBar();
}

function populateCarOptions() {
  requestedCar.innerHTML = '<option value="">اختر السيارة</option>' +
    cars.map(car => `<option value="${escapeHTML(car.name)}">${escapeHTML(car.name)}</option>`).join("");
}

function openCarModal(car) {
  activeCar = car;
  $("modalBrand").textContent = `${car.brand} · ${car.type}`;
  $("modalCarName").textContent = car.name;
  $("modalPrice").textContent = formatPrice(Number(car.price));
  $("modalImage").innerHTML = carImageMarkup(car);
  const specs = [
    ["الموديل", car.year], ["سعة المحرك", car.engine], ["قوة المحرك", car.power],
    ["ناقل الحركة", car.transmission], ["استهلاك البنزين", car.fuel],
    ["عدد المقاعد", car.seats], ["اللون", car.color], ["الضمان", car.warranty],
    ["الفئة", car.type]
  ];
  $("modalSpecs").innerHTML = specs.map(([label,value]) =>
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
  $("contact").scrollIntoView({behavior:"smooth"});
  setTimeout(() => $("customerName").focus(), 450);
}

function updateCompareBar() {
  compareBar.hidden = selectedForCompare.size === 0;
  $("compareSelection").textContent = `تم اختيار ${selectedForCompare.size} من 2`;
  $("compareNow").disabled = selectedForCompare.size !== 2;
}

function clearCompare() {
  selectedForCompare.clear();
  renderCars();
}

function openCompare() {
  if (selectedForCompare.size !== 2) return;
  const chosen = cars.filter(car => selectedForCompare.has(car.id));
  const rows = [
    ["السعر", ...chosen.map(c => formatPrice(c.price))],
    ["الموديل", ...chosen.map(c => safeText(c.year))],
    ["الماركة", ...chosen.map(c => safeText(c.brand))],
    ["الفئة", ...chosen.map(c => safeText(c.type))],
    ["سعة المحرك", ...chosen.map(c => safeText(c.engine))],
    ["قوة المحرك", ...chosen.map(c => safeText(c.power))],
    ["ناقل الحركة", ...chosen.map(c => safeText(c.transmission))],
    ["استهلاك البنزين", ...chosen.map(c => safeText(c.fuel))],
    ["عدد المقاعد", ...chosen.map(c => safeText(c.seats))],
    ["اللون", ...chosen.map(c => safeText(c.color))],
    ["الضمان", ...chosen.map(c => safeText(c.warranty))]
  ];
  $("compareTableWrap").innerHTML = `
    <div class="compare-table-scroll"><table class="compare-table">
      <thead><tr><th>المواصفة</th>${chosen.map(c => `<th>${escapeHTML(c.name)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(row => `<tr><th>${row[0]}</th>${row.slice(1).map(v => `<td>${escapeHTML(v)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
  $("compareModal").classList.add("show");
  $("compareModal").setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
}

function closeCompare() {
  $("compareModal").classList.remove("show");
  $("compareModal").setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}

function resetFilters() {
  brandFilter.value = "all";
  typeFilter.value = "all";
  priceFilter.value = "all";
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
    if (selectedForCompare.size >= 2) {
      checkbox.checked = false;
      return;
    }
    selectedForCompare.add(id);
  } else {
    selectedForCompare.delete(id);
  }
  renderCars();
});
$("clearCompare").addEventListener("click", clearCompare);
$("compareNow").addEventListener("click", openCompare);
$("closeModal").addEventListener("click", closeModal);
$("carModal").addEventListener("click", event => { if (event.target === $("carModal")) closeModal(); });
$("modalQuote").addEventListener("click", () => {
  if (activeCar) setRequestedCar(activeCar);
  closeModal();
});
$("closeCompare").addEventListener("click", closeCompare);
$("compareModal").addEventListener("click", event => { if (event.target === $("compareModal")) closeCompare(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeModal(); closeCompare(); }
});

function normalizeEgyptianPhone(value) {
  return value.replace(/[^\d]/g, "");
}
function isValidEgyptianPhone(value) {
  const digits = normalizeEgyptianPhone(value);
  return /^(010|011|012|015)\d{8}$/.test(digits);
}

$("customerPhone").addEventListener("input", event => {
  event.target.value = event.target.value.replace(/[^\d]/g, "").slice(0,11);
});

$("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
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
    messageEl.textContent = "رقم الموبايل غير صحيح. اكتب رقمًا مصريًا يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقمًا.";
    messageEl.classList.add("error");
    $("customerPhone").focus();
    return;
  }

  const companyNumber = normalizeEgyptianPhone(SITE_CONFIG.whatsappNumber);
  if (!/^20(10|11|12|15)\d{8}$/.test(companyNumber) || companyNumber === "201000000000") {
    messageEl.textContent = "النموذج جاهز، لكن يجب إضافة رقم واتساب الشركة الحقيقي داخل SITE_CONFIG في ملف script.js قبل استقبال الطلبات.";
    messageEl.classList.add("error");
    return;
  }

  const whatsappMessage = `السلام عليكم، أنا ${name}، مهتم بـ ${car}، رقمي ${phone}.${notes ? ` ملاحظات إضافية: ${notes}` : ""}`;
  messageEl.textContent = "تم التحقق من بياناتك بنجاح. سيتم فتح واتساب برسالة جاهزة؛ اضغط إرسال لتأكيد الطلب.";
  messageEl.classList.add("success");
  const waUrl = `https://wa.me/${companyNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
});

function applyContactSettings() {
  $("showroomAddress").textContent = SITE_CONFIG.showroomAddress;
  $("showroomHours").textContent = SITE_CONFIG.showroomHours;
  const phone = SITE_CONFIG.phoneNumber;
  $("showroomPhone").textContent = phone || "أضف رقم هاتف المعرض في ملف script.js";
  if (phone) {
    $("callLink").href = `tel:${phone.replace(/[^\d+]/g,"")}`;
    $("showroomPhone").innerHTML = `<a href="tel:${phone.replace(/[^\d+]/g,"")}">${escapeHTML(phone)}</a>`;
  }
  if (SITE_CONFIG.facebookUrl) $("facebookLink").href = SITE_CONFIG.facebookUrl;
  else $("facebookLink").classList.add("disabled-link");
  if (SITE_CONFIG.instagramUrl) $("instagramLink").href = SITE_CONFIG.instagramUrl;
  else $("instagramLink").classList.add("disabled-link");
  if (SITE_CONFIG.googleMapsEmbedUrl) {
    const frame = document.createElement("iframe");
    frame.src = SITE_CONFIG.googleMapsEmbedUrl;
    frame.title = "موقع معرض موتورز على خرائط Google";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.allowFullscreen = true;
    $("mapFrame").replaceChildren(frame);
  }
  const number = normalizeEgyptianPhone(SITE_CONFIG.whatsappNumber);
  if (/^20(10|11|12|15)\d{8}$/.test(number) && number !== "201000000000") {
    $("whatsappLink").href = `https://wa.me/${number}`;
  } else {
    $("whatsappLink").addEventListener("click", event => {
      event.preventDefault();
      alert("أضف رقم واتساب الشركة الحقيقي في SITE_CONFIG داخل ملف script.js.");
    });
  }
}

function setupNavigation() {
  const header = $("siteHeader");
  const navLinks = $("navLinks");
  const menuToggle = $("menuToggle");
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 20), {passive:true});
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
        if (entry.isIntersecting) {
          navLinks.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
        }
      });
    }, {rootMargin:"-35% 0px -55% 0px"});
    sections.forEach(section => observer.observe(section));
  }
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal, .cars-section .car-card");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach(el => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:0.12});
  elements.forEach(el => observer.observe(el));
}

async function init() {
  $("year").textContent = new Date().getFullYear();
  setupNavigation();
  setupReveal();
  applyContactSettings();
  try {
    const response = await fetch("cars.json");
    if (!response.ok) throw new Error("تعذر تحميل ملف cars.json");
    cars = await response.json();
    populateCarOptions();
    renderCars();
    setupReveal();
  } catch (error) {
    resultsCount.textContent = "تعذر تحميل السيارات. تأكد من وجود ملف cars.json بجوار index.html.";
    carsGrid.innerHTML = '<p class="empty-state">تعذر تحميل بيانات السيارات. افتح الموقع من GitHub Pages أو Live Server، وتأكد من رفع ملف cars.json.</p>';
    console.error(error);
  }
}
init();
