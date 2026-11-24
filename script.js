
// ==============================
// CAR DATA
// ==============================

const cars = [
  {
    id: 1,
    brand: "مرسيدس",
    name: "Mercedes C-Class",
    type: "Sedan",
    year: 2024,
    engine: "2.0L",
    transmission: "أوتوماتيك",
    price: 2850000,
    tag: "الأكثر طلبًا",
    image: ""
  },
  {
    id: 2,
    brand: "BMW",
    name: "BMW X5",
    type: "SUV",
    year: 2023,
    engine: "3.0L",
    transmission: "أوتوماتيك",
    price: 4650000,
    tag: "اختيار مميز",
    image: ""
  },
  {
    id: 3,
    brand: "أودي",
    name: "Audi A6",
    type: "Sedan",
    year: 2024,
    engine: "2.0L",
    transmission: "أوتوماتيك",
    price: 3200000,
    tag: "وصل حديثًا",
    image: ""
  },
  {
    id: 4,
    brand: "تويوتا",
    name: "Toyota RAV4",
    type: "SUV",
    year: 2024,
    engine: "2.5L",
    transmission: "أوتوماتيك",
    price: 1950000,
    tag: "عملية وأنيقة",
    image: ""
  },
  {
    id: 5,
    brand: "BMW",
    name: "BMW 4 Series",
    type: "Coupe",
    year: 2023,
    engine: "2.0L",
    transmission: "أوتوماتيك",
    price: 3750000,
    tag: "طابع رياضي",
    image: ""
  },
  {
    id: 6,
    brand: "مرسيدس",
    name: "Mercedes GLC",
    type: "SUV",
    year: 2024,
    engine: "2.0L",
    transmission: "أوتوماتيك",
    price: 4100000,
    tag: "فخامة وراحة",
    image: ""
  }
];

// Change this to your actual WhatsApp number
const WHATSAPP_NUMBER = "201000000000";

// ==============================
// ELEMENTS
// ==============================

const carsGrid = document.getElementById("carsGrid");
const brandFilter = document.getElementById("brandFilter");
const typeFilter = document.getElementById("typeFilter");
const priceFilter = document.getElementById("priceFilter");
const emptyState = document.getElementById("emptyState");
const requestedCar = document.getElementById("requestedCar");

const carModal = document.getElementById("carModal");
const closeModal = document.getElementById("closeModal");
const modalQuote = document.getElementById("modalQuote");

// ==============================
// HELPER FUNCTIONS
// ==============================

const formatPrice = value =>
  new Intl.NumberFormat("ar-EG").format(value) + " جنيه";

function carImage(car) {
  if (car.image) {
    return `<img src="${car.image}" alt="${car.name}" loading="lazy">`;
  }

  return `
    <div class="photo-placeholder">
      <b>▱</b>
      <span>أضف صورة ${car.name} هنا</span>
    </div>
  `;
}

// ==============================
// DISPLAY CARS
// ==============================

function renderCars() {

  const brand = brandFilter.value;
  const type = typeFilter.value;
  const price = priceFilter.value;

  const filtered = cars.filter(car => {

    const brandMatch =
      brand === "all" || car.brand === brand;

    const typeMatch =
      type === "all" || car.type === type;

    const priceMatch =
      price === "all" ||
      (price === "low" && car.price < 2000000) ||
      (price === "mid" &&
        car.price >= 2000000 &&
        car.price <= 4000000) ||
      (price === "high" && car.price > 4000000);

    return brandMatch && typeMatch && priceMatch;

  });

  carsGrid.innerHTML = filtered.map(car => `
    <article class="car-card" data-car-id="${car.id}">

      <div class="car-image">
        ${carImage(car)}
        <span class="car-tag">${car.tag}</span>
      </div>

      <div class="car-info">

        <span class="car-brand">
          ${car.brand} · ${car.year}
        </span>

        <h3>${car.name}</h3>

        <div class="car-specs">
          <span>⚙ ${car.engine}</span>
          <span>↔ ${car.transmission}</span>
          <span>◈ ${car.type}</span>
        </div>

        <div class="car-bottom">

          <div class="car-price">
            ${formatPrice(car.price)}
            <small>/ السعر</small>
          </div>

          <button class="details-link" type="button">
            عرض التفاصيل ←
          </button>

        </div>
      </div>

    </article>
  `).join("");

  emptyState.hidden = filtered.length !== 0;
}

// ==============================
// CAR DETAILS POPUP
// ==============================

function openCarDetails(carId) {

  const car = cars.find(item => item.id === Number(carId));

  if (!car) return;

  document.getElementById("modalBrand").textContent =
    car.brand;

  document.getElementById("modalCarName").textContent =
    car.name;

  document.getElementById("modalPrice").textContent =
    formatPrice(car.price);

  document.getElementById("modalYear").textContent =
    car.year;

  document.getElementById("modalEngine").textContent =
    car.engine;

  document.getElementById("modalTransmission").textContent =
    car.transmission;

  document.getElementById("modalType").textContent =
    car.type;

  document.getElementById("modalImage").innerHTML =
    carImage(car);

  // Remember selected car for the quotation form
  requestedCar.value = car.name;

  carModal.hidden = false;
  document.body.style.overflow = "hidden";

  closeModal.focus();
}

function hideCarDetails() {

  carModal.hidden = true;
  document.body.style.overflow = "";

}

// Click anywhere on a car card to open details
carsGrid.addEventListener("click", event => {

  const card = event.target.closest(".car-card");

  if (!card) return;

  const carId = card.dataset.carId;

  if (event.target.closest(".details-link")) {
    openCarDetails(carId);
    return;
  }

  openCarDetails(carId);

});

// Close button
closeModal.addEventListener("click", hideCarDetails);

// Close when clicking outside the popup
carModal.addEventListener("click", event => {

  if (event.target === carModal) {
    hideCarDetails();
  }

});

// Close using Escape
document.addEventListener("keydown", event => {

  if (event.key === "Escape" && !carModal.hidden) {
    hideCarDetails();
  }

});

// Request quotation from popup
modalQuote.addEventListener("click", () => {

  hideCarDetails();

  document.getElementById("contact").scrollIntoView({
    behavior: "smooth"
  });

});

// ==============================
// FILTERS
// ==============================

[brandFilter, typeFilter, priceFilter].forEach(filter => {
  filter.addEventListener("change", renderCars);
});

document.getElementById("resetFilters").addEventListener("click", () => {

  brandFilter.value = "all";
  typeFilter.value = "all";
  priceFilter.value = "all";

  renderCars();

});

// ==============================
// CONTACT FORM
// ==============================

function populateCarOptions() {

  requestedCar.innerHTML =
    '<option value="">اختر السيارة</option>' +
    cars.map(car =>
      `<option value="${car.name}">${car.name}</option>`
    ).join("");

}

document.getElementById("contactForm").addEventListener("submit", event => {

  event.preventDefault();

  const name =
    document.getElementById("customerName").value.trim();

  const phone =
    document.getElementById("customerPhone").value.trim();

  const car = requestedCar.value;

  if (!name || !phone || !car) return;

  const message =
    `مرحبًا، أريد الاستفسار عن سيارة.\n` +
    `الاسم: ${name}\n` +
    `رقم الموبايل: ${phone}\n` +
    `السيارة المطلوبة: ${car}`;

  const phoneDigits =
    WHATSAPP_NUMBER.replace(/\D/g, "");

  if (phoneDigits.length < 10 ||
      phoneDigits === "201000000000") {

    document.getElementById("formMessage").textContent =
      "يرجى تعديل رقم واتساب الشركة داخل ملف script.js.";

    return;
  }

  window.open(
    `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener"
  );

  document.getElementById("formMessage").textContent =
    "تم تجهيز رسالتك في واتساب. اضغط إرسال لتأكيد الطلب.";

});

// ==============================
// MOBILE MENU
// ==============================

const menuToggle =
  document.getElementById("menuToggle");

const navLinks =
  document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {

  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  menuToggle.textContent = isOpen ? "×" : "☰";

});

navLinks.querySelectorAll("a").forEach(link => {

  link.addEventListener("click", () => {

    navLinks.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.textContent = "☰";

  });

});

// ==============================
// WHATSAPP FLOAT BUTTON
// ==============================

document.getElementById("whatsappLink").addEventListener("click", event => {

  const number =
    WHATSAPP_NUMBER.replace(/\D/g, "");

  if (number.length < 10 ||
      number === "201000000000") {

    event.preventDefault();

    alert("أضف رقم واتساب الشركة داخل ملف script.js أولًا.");

    return;
  }

  event.currentTarget.href =
    `https://wa.me/${number}`;

});

// ==============================
// INITIALIZE WEBSITE
// ==============================

document.getElementById("year").textContent =
  new Date().getFullYear();

populateCarOptions();
renderCars();
