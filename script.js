  // بيانات تجريبية: استبدل image بمسار صورة السيارة التي سترفعها داخل مجلد images.
const cars = [
  {id:1,brand:"مرسيدس",name:"Mercedes C-Class",type:"Sedan",year:2024,engine:"2.0L",transmission:"أوتوماتيك",price:2850000,tag:"الأكثر طلبًا",image:""},
  {id:2,brand:"BMW",name:"BMW X5",type:"SUV",year:2023,engine:"3.0L",transmission:"أوتوماتيك",price:4650000,tag:"اختيار مميز",image:""},
  {id:3,brand:"أودي",name:"Audi A6",type:"Sedan",year:2024,engine:"2.0L",transmission:"أوتوماتيك",price:3200000,tag:"وصل حديثًا",image:""},
  {id:4,brand:"تويوتا",name:"Toyota RAV4",type:"SUV",year:2024,engine:"2.5L",transmission:"أوتوماتيك",price:1950000,tag:"عملية وأنيقة",image:""},
  {id:5,brand:"BMW",name:"BMW 4 Series",type:"Coupe",year:2023,engine:"2.0L",transmission:"أوتوماتيك",price:3750000,tag:"طابع رياضي",image:""},
  {id:6,brand:"مرسيدس",name:"Mercedes GLC",type:"SUV",year:2024,engine:"2.0L",transmission:"أوتوماتيك",price:4100000,tag:"فخامة وراحة",image:""}
];

// ضع رقم واتساب الشركة بصيغة دولية بدون + أو مسافات، مثال مصر: 2010XXXXXXXX
const WHATSAPP_NUMBER = "201000000000";

const carsGrid = document.getElementById("carsGrid");
const brandFilter = document.getElementById("brandFilter");
const typeFilter = document.getElementById("typeFilter");
const priceFilter = document.getElementById("priceFilter");
const emptyState = document.getElementById("emptyState");
const requestedCar = document.getElementById("requestedCar");

const formatPrice = value => new Intl.NumberFormat("ar-EG").format(value) + " جنيه";

function carImage(car) {
  if (car.image) {
    return `<img src="${car.image}" alt="${car.brand} ${car.name}" loading="lazy">`;
  }
  return `<div class="photo-placeholder"><b>▱</b><span>أضف صورة ${car.name} هنا</span></div>`;
}

function renderCars() {
  const brand = brandFilter.value;
  const type = typeFilter.value;
  const price = priceFilter.value;

  const filtered = cars.filter(car => {
    const brandMatch = brand === "all" || car.brand === brand;
    const typeMatch = type === "all" || car.type === type;
    const priceMatch =
      price === "all" ||
      (price === "low" && car.price < 2000000) ||
      (price === "mid" && car.price >= 2000000 && car.price <= 4000000) ||
      (price === "high" && car.price > 4000000);
    return brandMatch && typeMatch && priceMatch;
  });

  carsGrid.innerHTML = filtered.map(car => `
    <article class="car-card">
      <div class="car-image">
        ${carImage(car)}
        <span class="car-tag">${car.tag}</span>
      </div>
      <div class="car-info">
        <span class="car-brand">${car.brand} · ${car.year}</span>
        <h3>${car.name}</h3>
        <div class="car-specs">
          <span>⚙ ${car.engine}</span><span>↔ ${car.transmission}</span><span>◈ ${car.type}</span>
        </div>
        <div class="car-bottom">
          <div class="car-price">${formatPrice(car.price)}<small> / السعر</small></div>
          <a class="details-link" href="#contact" data-car="${car.name}">اطلب عرض سعر ←</a>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.hidden = filtered.length !== 0;
  carsGrid.querySelectorAll("[data-car]").forEach(link => {
    link.addEventListener("click", () => {
      requestedCar.value = link.dataset.car;
    });
  });
}

function populateCarOptions() {
  requestedCar.innerHTML = '<option value="">اختر السيارة</option>' +
    cars.map(car => `<option value="${car.name}">${car.name}</option>`).join("");
}

[brandFilter, typeFilter, priceFilter].forEach(filter => {
  filter.addEventListener("change", renderCars);
});

document.getElementById("resetFilters").addEventListener("click", () => {
  brandFilter.value = "all";
  typeFilter.value = "all";
  priceFilter.value = "all";
  renderCars();
});

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const car = requestedCar.value;

  if (!name || !phone || !car) return;

  const message = `مرحبًا، أريد الاستفسار عن سيارة.\nالاسم: ${name}\nرقم الموبايل: ${phone}\nالسيارة المطلوبة: ${car}`;
  const phoneDigits = WHATSAPP_NUMBER.replace(/\D/g, "");

  if (phoneDigits.length < 10 || phoneDigits === "201000000000") {
    document.getElementById("formMessage").textContent =
      "يرجى تعديل رقم واتساب الشركة داخل ملف script.js قبل استقبال الطلبات.";
    return;
  }

  window.open(`https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  document.getElementById("formMessage").textContent = "تم تجهيز رسالتك في واتساب. اضغط إرسال داخل واتساب لتأكيد الطلب.";
});

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

document.getElementById("whatsappLink").addEventListener("click", event => {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (number.length < 10 || number === "201000000000") {
    event.preventDefault();
    alert("أضف رقم واتساب الشركة داخل ملف script.js أولًا.");
    return;
  }
  event.currentTarget.href = `https://wa.me/${number}`;
});

document.getElementById("year").textContent = new Date().getFullYear();
populateCarOptions();
renderCars();
