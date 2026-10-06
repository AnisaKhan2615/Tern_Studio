/* ============ 1. PRODUCT DATA ============ */
/* Photos are loaded from images/<product>-<finish>.jpg, e.g. images/flask-glacier.jpg */
const PRODUCTS = {
  flask: {
    name: "Insulated Flask",
    description: "Double-wall vacuum steel keeps drinks cold for 24 hours or hot for 12. The powder-coated finish resists scratches and the leak-proof cap survives a full day in your bag.",
    defaultSize: 1,
    sizes: [{ label: "350 ml", price: 34 }, { label: "500 ml", price: 42 }, { label: "750 ml", price: 52 }],
    variants: [{ name: "Glacier", color: "#8db4c2" }, { name: "Moss", color: "#5b7a52" }, { name: "Graphite", color: "#3c454b" }]
  },
  mug: {
    name: "Ceramic Mug",
    description: "Hand-glazed stoneware with a comfortable wide handle. Holds the heat, feels solid in the hand, and is safe for the dishwasher and microwave.",
    defaultSize: 0,
    sizes: [{ label: "300 ml", price: 18 }, { label: "450 ml", price: 24 }],
    variants: [{ name: "Ivory", color: "#e9e4d3" }, { name: "Cobalt", color: "#2f4fb3" }, { name: "Onyx", color: "#22262f" }]
  },
  notebook: {
    name: "Linen Notebook",
    description: "Hardcover with 192 pages of 100 gsm dotted paper, a woven linen cover, an elastic closure, and a ribbon marker that stays where you left it.",
    defaultSize: 1,
    sizes: [{ label: "A6 pocket", price: 16 }, { label: "A5 standard", price: 22 }, { label: "B5 large", price: 28 }],
    variants: [{ name: "Navy", color: "#26356b" }, { name: "Tan", color: "#b58757" }, { name: "Forest", color: "#2f5d4a" }]
  }
};

/* ============ 2. DOM REFERENCES ============ */
const $ = (id) => document.getElementById(id);
const siteHeader = $("siteHeader"), scrollProgress = $("scrollProgress");
const productCard = $("productCard"), previewStage = $("previewStage"), stateChip = $("stateChip");
const cartZone = $("cartZone"), cartList = $("cartList"), cartEmpty = $("cartEmpty");
const cartBadge = $("cartBadge"), cartCount = $("cartCount"), cartTotal = $("cartTotal");
const configForm = $("configForm"), sizeSelect = $("sizeSelect"), variantGroup = $("variantGroup");
const engravingInput = $("engravingInput"), engravingCounter = $("engravingCounter");
const priceDisplay = $("priceDisplay"), productDescription = $("productDescription");
const resultPanel = $("resultPanel"), resultDetails = $("resultDetails");
const ENGRAVING_LIMIT = 18;

/* ============ 3. STATE + HELPERS ============ */
let currentProductKey = "flask";
let cartItems = [];

const currentProduct = () => PRODUCTS[currentProductKey];
const currentSize = () => currentProduct().sizes[Number(sizeSelect.value)];
const currentVariant = () => {
  const checked = configForm.querySelector('input[name="variant"]:checked');
  return currentProduct().variants[Number(checked.dataset.index)];
};
const stageMedia = () => $("stageMedia");
const formatPrice = (value) => "$" + value.toFixed(2);

function showToast(message, type = "info", action = null) {
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  if (action) {
    const actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "toast-action";
    actionButton.textContent = action.label;
    actionButton.addEventListener("click", () => { action.onClick(); toast.remove(); });
    toast.appendChild(actionButton);
  }
  $("toastRegion").appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function setFieldError(fieldId, errorId, message) {
  $(fieldId).classList.toggle("has-error", Boolean(message));
  $(errorId).textContent = message;
}

/* ============ 4. PREVIEW RENDERING ============ */
function renderProduct(key) {
  currentProductKey = key;
  const product = currentProduct();

  previewStage.innerHTML = `<div class="stage-media" id="stageMedia">
      <img class="product-photo" id="productPhoto" alt="${product.name}" draggable="false">
      <div class="photo-fallback" id="photoFallback" hidden></div>
    </div>
    <div class="nameplate is-empty" id="nameplate"></div>`;

  // If the photo file is missing, show which file to add instead of a broken image
  $("productPhoto").addEventListener("error", () => {
    $("productPhoto").hidden = true;
    $("photoFallback").hidden = false;
  });

  variantGroup.innerHTML = product.variants.map((variant, index) =>
    `<label class="swatch"><input type="radio" name="variant" value="${variant.name}" data-index="${index}" ${index === 0 ? "checked" : ""}>
     <span><i style="--c:${variant.color}"></i>${variant.name}</span></label>`).join("");

  sizeSelect.innerHTML = product.sizes.map((size, index) =>
    `<option value="${index}" ${index === product.defaultSize ? "selected" : ""}>${size.label} – $${size.price}</option>`).join("");

  $("productTitle").textContent = product.name;
  productDescription.textContent = product.description;
  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.product === key;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", isActive);
  });

  applyVariant();
  updatePrice();
  updateEngravingPreview();
}

function updatePhoto() {
  const photo = $("productPhoto"), fallback = $("photoFallback");
  const source = `images/${currentProductKey}-${currentVariant().name.toLowerCase()}.jpg`;
  fallback.textContent = `Add photo: ${source}`;
  fallback.hidden = true;
  photo.hidden = false;
  photo.src = source;
}

function applyVariant() {
  productCard.style.setProperty("--c", currentVariant().color);
  updatePhoto();
}

function updatePrice() {
  priceDisplay.textContent = formatPrice(currentSize().price);
}

function updateEngravingPreview() {
  const rawText = engravingInput.value;
  const text = rawText.trim();
  const nameplate = $("nameplate");

  nameplate.textContent = text ? "Engraving: " + text : "Your engraving appears here";
  nameplate.classList.toggle("is-empty", !text);

  engravingCounter.textContent = `${rawText.length} / ${ENGRAVING_LIMIT}`;
  engravingCounter.classList.toggle("is-near", rawText.length >= 14 && rawText.length < ENGRAVING_LIMIT);
  engravingCounter.classList.toggle("is-full", rawText.length === ENGRAVING_LIMIT);

  if (rawText.length === ENGRAVING_LIMIT) {
    setFieldError("engravingField", "engravingError", "Character limit reached.");
  } else if (rawText.length > 0) {
    setFieldError("engravingField", "engravingError", "");
  }
}

/* ============ 5. CART ============ */
function renderCart() {
  cartList.innerHTML = "";
  cartItems.forEach((item) => {
    const row = document.createElement("li");
    row.className = "cart-item";
    const info = document.createElement("span");
    info.textContent = `${item.product} · ${item.variant}, ${item.size}`;
    const detail = document.createElement("small");
    detail.textContent = `Engraving: “${item.engraving}”` + (item.extras ? ` · ${item.extras}` : "");
    info.appendChild(detail);
    const price = document.createElement("strong");
    price.textContent = formatPrice(item.price);
    row.append(info, price);
    cartList.appendChild(row);
  });
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  cartCount.textContent = cartItems.length === 1 ? "1 item" : `${cartItems.length} items`;
  cartBadge.textContent = "Cart: " + cartItems.length;
  cartTotal.textContent = formatPrice(total);
  cartEmpty.style.display = cartItems.length ? "none" : "block";
}

function addCurrentConfigurationToCart() {
  const engraving = engravingInput.value.trim();
  if (!engraving) {
    setFieldError("engravingField", "engravingError", "Add engraving text before adding to cart.");
    showToast("Add your engraving text first.", "warning");
    engravingInput.focus();
    return false;
  }
  cartItems.push({
    product: currentProduct().name,
    variant: currentVariant().name,
    size: currentSize().label,
    engraving,
    extras: premiumSummary(),
    price: currentSize().price
  });
  renderCart();
  [cartBadge, productCard].forEach((element, index) => {
    const animationClass = index === 0 ? "bump" : "is-added";
    element.classList.remove(animationClass);
    void element.offsetWidth;
    element.classList.add(animationClass);
  });
  showToast(`Added to cart: ${currentProduct().name}.`, "success");
  return true;
}

/* ============ 6. EVENT: click (product tabs, add button) ============ */
$("productTabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (!tab || tab.dataset.product === currentProductKey) return;
  renderProduct(tab.dataset.product);
  showToast(`${currentProduct().name} selected.`);
});
$("addToCartButton").addEventListener("click", addCurrentConfigurationToCart);

/* ============ 7. EVENT: change (variant, size) ============ */
variantGroup.addEventListener("change", () => {
  applyVariant();
  showToast(`${currentVariant().name} finish selected.`);
});
sizeSelect.addEventListener("change", () => {
  updatePrice();
  showToast(`Size set to ${currentSize().label}.`);
});

/* ============ 8. EVENT: input (live engraving) ============ */
engravingInput.addEventListener("input", updateEngravingPreview);

/* ============ 9. EVENTS: focus / blur ============ */
configForm.addEventListener("focusin", (event) => {
  const field = event.target.closest(".field");
  if (field) field.classList.add("is-focused");
});
configForm.addEventListener("focusout", (event) => {
  const field = event.target.closest(".field");
  if (!field) return;
  field.classList.remove("is-focused");
  if (event.target.id === "customerName") validateName();
  if (event.target.id === "customerEmail") validateEmail();
});

/* ============ 10. EVENT: mousemove (position relative to preview) ============ */
previewStage.addEventListener("mousemove", (event) => {
  const box = previewStage.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  previewStage.style.setProperty("--mx", x + "px");
  previewStage.style.setProperty("--my", y + "px");
  stageMedia().style.setProperty("--tilt-y", (((x / box.width) - 0.5) * 14).toFixed(1) + "deg");
  stageMedia().style.setProperty("--tilt-x", (((0.5 - y / box.height)) * 10).toFixed(1) + "deg");
  stateChip.textContent = `Inspecting  x:${Math.round(x)}  y:${Math.round(y)}`;
});

/* ============ 11. EVENTS: mouseenter / mouseleave ============ */
productCard.addEventListener("mouseenter", () => {
  productCard.classList.add("is-hovered");
  stateChip.textContent = "Inspecting";
});
productCard.addEventListener("mouseleave", () => {
  productCard.classList.remove("is-hovered");
  stageMedia().style.setProperty("--tilt-x", "0deg");
  stageMedia().style.setProperty("--tilt-y", "0deg");
  stateChip.textContent = "Move over the product";
});

/* ============ 12. EVENTS: drag and drop ============ */
productCard.addEventListener("dragstart", (event) => {
  event.dataTransfer.setData("text/plain", "configured-product");
  event.dataTransfer.effectAllowed = "copy";
  productCard.classList.add("is-dragging");
  stateChip.textContent = "Dragging…";
});
productCard.addEventListener("dragend", () => {
  productCard.classList.remove("is-dragging");
  cartZone.classList.remove("is-over");
  stateChip.textContent = "Move over the product";
});
cartZone.addEventListener("dragenter", (event) => {
  event.preventDefault();
  cartZone.classList.add("is-over");
});
cartZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});
cartZone.addEventListener("dragleave", (event) => {
  if (!cartZone.contains(event.relatedTarget)) cartZone.classList.remove("is-over");
});
cartZone.addEventListener("drop", (event) => {
  event.preventDefault();
  cartZone.classList.remove("is-over");
  if (event.dataTransfer.getData("text/plain") === "configured-product") addCurrentConfigurationToCart();
});

/* ============ 13. EVENTS: copy / cut (protected description) ============ */
["copy", "cut"].forEach((action) => {
  productDescription.addEventListener(action, (event) => {
    event.preventDefault();
    showToast(`The product description is protected. ${action === "copy" ? "Copying" : "Cutting"} is disabled.`, "warning");
  });
});

/* ============ 14. VALIDATION + EVENT: submit ============ */
function validateEngraving() {
  const valid = engravingInput.value.trim().length > 0;
  setFieldError("engravingField", "engravingError", valid ? "" : "Engraving text is required.");
  return valid;
}
function validateName() {
  const valid = $("customerName").value.trim().length >= 2;
  setFieldError("nameField", "nameError", valid ? "" : "Enter your full name (at least 2 characters).");
  return valid;
}
function validateEmail() {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("customerEmail").value.trim());
  setFieldError("emailField", "emailError", valid ? "" : "Enter a valid email, like you@example.com.");
  return valid;
}

configForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const results = [validateEngraving(), validateName(), validateEmail()];
  if (results.includes(false)) {
    showToast("Please fix the highlighted fields.", "error");
    configForm.querySelector(".has-error .input").focus();
    return;
  }
  if (cartItems.length === 0) addCurrentConfigurationToCart();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const reference = "TS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const rows = [
    ["Reference", reference],
    ["Customer", $("customerName").value.trim()],
    ["Email", $("customerEmail").value.trim()],
    ["Items", cartItems.map((item) => `${item.product} (${item.variant}, ${item.size}) “${item.engraving}”`).join("; ")],
    ["Total", formatPrice(total)]
  ];
  resultDetails.innerHTML = "";
  rows.forEach(([label, value]) => {
    const term = document.createElement("dt"), detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value;
    resultDetails.append(term, detail);
  });
  resultPanel.classList.add("is-visible");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("Order placed. Reference " + reference, "success");
});

/* ============ 15. EVENT: reset ============ */
configForm.addEventListener("reset", () => {
  setTimeout(() => {
    cartItems = [];
    renderCart();
    renderProduct("flask");
    resetPremiumOptions();
    ["engravingField", "nameField", "emailField"].forEach((id) => $(id).classList.remove("has-error"));
    ["engravingError", "nameError", "emailError"].forEach((id) => { $(id).textContent = ""; });
    resultPanel.classList.remove("is-visible");
    showToast("Configurator reset to its defaults.");
  }, 0);
});

/* ============ 16. EVENT: scroll ============ */
window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0) + "%";
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
}, { passive: true });


/* ============ 17. PREMIUM STATE + OPTIONS ============ */
const premiumOptions = $("premiumOptions"), statusBadge = $("statusBadge");
let isPremiumUser = false;

function applyPremiumOptions() {
  const foil = configValue("foil"), font = configValue("fontStyle"), theme = configValue("theme");
  productCard.dataset.foil = foil;
  productCard.dataset.font = font;
  productCard.dataset.theme = theme;
  productCard.dataset.shine = $("shineToggle").checked ? "on" : "off";
}
const configValue = (name) => premiumOptions.querySelector(`input[name="${name}"]:checked`).value;

function premiumSummary() {
  const parts = [];
  if (configValue("foil") !== "standard") parts.push(configValue("foil") + " foil");
  if (configValue("fontStyle") !== "clean") parts.push(configValue("fontStyle") + " style");
  if (configValue("theme") !== "studio") parts.push(configValue("theme") + " theme");
  if ($("shineToggle").checked) parts.push("shine");
  return parts.join(", ");
}

function resetPremiumOptions() {
  ["foil", "fontStyle", "theme"].forEach((name) => { premiumOptions.querySelector(`input[name="${name}"]`).checked = true; });
  $("shineToggle").checked = false;
  applyPremiumOptions();
}

/* Premium feature lock: block the click, explain, and offer the upgrade */
premiumOptions.addEventListener("click", (event) => {
  const lockedOption = event.target.closest("[data-premium]");
  if (!lockedOption || isPremiumUser) return;
  event.preventDefault();
  lockedOption.classList.remove("shake");
  void lockedOption.offsetWidth;
  lockedOption.classList.add("shake");
  showToast("🔒 This is a Premium feature.", "warning", { label: "Upgrade", onClick: openPaymentDialog });
});
premiumOptions.addEventListener("change", applyPremiumOptions);

function setPremiumStatus(active) {
  isPremiumUser = active;
  document.body.classList.toggle("is-premium-user", active);
  statusBadge.textContent = active ? "⭐ Premium User" : "Free User";
  statusBadge.classList.toggle("is-premium", active);
  $("premiumBadgeSvg").hidden = !active;
  $("premiumChip").textContent = active ? "✔ Unlocked" : "🔒 Locked";
  $("planChip").textContent = active ? "Premium active" : "Free plan";
  $("upgradeButton").disabled = active;
  $("upgradeButton").textContent = active ? "Premium active ✔" : "Upgrade to Premium";
  if (!active) resetPremiumOptions();
}

/* ============ 18. PREMIUM PAYMENT (simulated) ============ */
const payDialog = $("payDialog"), payForm = $("payForm");
let successAnimation = null;

function showPayView(view) {
  $("payFormView").hidden = view !== "form";
  $("payBusy").hidden = view !== "busy";
  $("paySuccess").hidden = view !== "success";
}
function openPaymentDialog() {
  showPayView("form");
  if (!payDialog.open) payDialog.showModal();
}
$("upgradeButton").addEventListener("click", openPaymentDialog);
$("payCancel").addEventListener("click", () => payDialog.close());
$("payDone").addEventListener("click", () => payDialog.close());

$("cardNumber").addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
});
$("cardExpiry").addEventListener("input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
  event.target.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
});
$("cardCvv").addEventListener("input", (event) => { event.target.value = event.target.value.replace(/\D/g, ""); });

function validatePayment() {
  const name = $("cardName").value.trim(), number = $("cardNumber").value.replace(/\s/g, "");
  const expiry = /^(\d{2})\/(\d{2})$/.exec($("cardExpiry").value), cvv = $("cardCvv").value;
  let expiryMessage = "";
  if (!expiry || Number(expiry[1]) < 1 || Number(expiry[1]) > 12) expiryMessage = "Use the format MM/YY.";
  else {
    const now = new Date(), year = now.getFullYear() % 100, month = now.getMonth() + 1;
    if (Number(expiry[2]) < year || (Number(expiry[2]) === year && Number(expiry[1]) < month)) expiryMessage = "This card has expired.";
  }
  const messages = {
    name: /^[A-Za-z][A-Za-z .'-]{2,}$/.test(name) ? "" : "Enter the cardholder name (letters, min 3).",
    number: /^\d{16}$/.test(number) ? "" : "Card number must be 16 digits.",
    expiry: expiryMessage,
    cvv: /^\d{3,4}$/.test(cvv) ? "" : "CVV must be 3 or 4 digits."
  };
  setFieldError("cardNameField", "cardNameError", messages.name);
  setFieldError("cardNumberField", "cardNumberError", messages.number);
  setFieldError("cardExpiryField", "cardExpiryError", messages.expiry);
  setFieldError("cardCvvField", "cardCvvError", messages.cvv);
  return Object.values(messages).every((message) => message === "");
}

function playSuccessAnimation() {
  const box = $("lottieSuccess");
  if (!window.lottie) { box.textContent = "✅"; box.style.fontSize = "5rem"; return; }
  if (successAnimation) successAnimation.destroy();
  successAnimation = lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: true, animationData: window.SUCCESS_LOTTIE });
}

payForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validatePayment()) { showToast("Please fix the highlighted card fields.", "error"); return; }
  payForm.reset();                       // card data is never stored
  showPayView("busy");
  setTimeout(() => {
    setPremiumStatus(true);
    showPayView("success");
    playSuccessAnimation();
    showToast("Premium unlocked. Enjoy!", "success");
  }, 2000);
});
payDialog.addEventListener("close", () => {
  ["cardNameField", "cardNumberField", "cardExpiryField", "cardCvvField"].forEach((id) => $(id).classList.remove("has-error"));
  ["cardNameError", "cardNumberError", "cardExpiryError", "cardCvvError"].forEach((id) => { $(id).textContent = ""; });
});
$("resetPremiumButton").addEventListener("click", () => { setPremiumStatus(false); showToast("Premium reset. You are a Free User again."); });

/* ============ 19. SVG INTERACTION ============ */
const planSvg = $("planSvg");
const sparklePlan = () => { planSvg.classList.remove("sparkle"); void planSvg.getBoundingClientRect(); planSvg.classList.add("sparkle"); };
planSvg.addEventListener("click", sparklePlan);
planSvg.addEventListener("keydown", (event) => { if (event.key === "Enter") sparklePlan(); });
$("premiumBadgeSvg").addEventListener("click", () => showToast("⭐ Premium member – all options unlocked."));

/* ============ 20. SCROLL REVEAL ============ */
const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) entry.target.classList.add("is-revealed");
}), { threshold: 0.1 });
document.querySelectorAll(".band").forEach((section) => revealObserver.observe(section));

/* ============ INIT ============ */
renderProduct("flask");
renderCart();
applyPremiumOptions();
setPremiumStatus(false);
