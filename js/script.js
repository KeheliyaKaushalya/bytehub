// Supabase Configuration
const SUPABASE_URL = "https://kpkkxdprrztihzixjdnf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa2t4ZHBycnp0aWh6aXhqZG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjQzMzcsImV4cCI6MjA2NTU0MDMzN30.Vw9E1CfM2QgY5MhPpC6qJhjKQzPdHnJhZ2qJ7Y5qW5E";

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
let searchForm, shoppingCart, navbar, loginDropdown;
let currentUser = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  // Cache DOM elements
  searchForm = document.querySelector(".search-form");
  shoppingCart = document.getElementById("cart-dropdown");
  navbar = document.querySelector(".navbar");
  loginDropdown = document.getElementById("login-dropdown");

  // Initialize UI
  initUI();

  // Check authentication status
  await checkAuth();

  // Load cart
  await loadCart();

  // Load page-specific content
  loadPageContent();
});

// UI Initialization
function initUI() {
  // Search button
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.onclick = () => {
      searchForm?.classList.toggle("active");
      shoppingCart?.classList.remove("active");
      loginDropdown?.classList.remove("active");
      navbar?.classList.remove("active");
    };
  }

  // Cart button
  const cartBtn = document.getElementById("cart-btn");
  if (cartBtn) {
    cartBtn.onclick = () => {
      shoppingCart?.classList.toggle("active");
      searchForm?.classList.remove("active");
      loginDropdown?.classList.remove("active");
      navbar?.classList.remove("active");
    };
  }

  // Login button
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.onclick = () => {
      loginDropdown?.classList.toggle("active");
      searchForm?.classList.remove("active");
      shoppingCart?.classList.remove("active");
      navbar?.classList.remove("active");
    };
  }

  // Menu button
  const menuBtn = document.getElementById("menu-btn");
  if (menuBtn) {
    menuBtn.onclick = () => {
      navbar?.classList.toggle("active");
      searchForm?.classList.remove("active");
      shoppingCart?.classList.remove("active");
      loginDropdown?.classList.remove("active");
    };
  }

  // Close dropdowns on scroll
  window.onscroll = () => {
    searchForm?.classList.remove("active");
    shoppingCart?.classList.remove("active");
    loginDropdown?.classList.remove("active");
    navbar?.classList.remove("active");
  };

  // Login form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.onsubmit = handleLogin;
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.onclick = handleLogout;
  }

  // Search form
  const searchFormEl = document.getElementById("search-form");
  if (searchFormEl) {
    searchFormEl.onsubmit = handleSearch;
  }

  // Newsletter form
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.onsubmit = handleNewsletter;
  }
}

// Authentication Functions
async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    currentUser = session.user;
    await updateUserProfile();
    showAuthenticatedUI();
  } else {
    currentUser = null;
    showGuestUI();
  }
}

async function updateUserProfile() {
  if (!currentUser) return;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (profile) {
    currentUser.profile = profile;
  }
}

function showAuthenticatedUI() {
  const guestDiv = document.getElementById("auth-guest");
  const userDiv = document.getElementById("auth-user");
  const userNameSpan = document.getElementById("user-name");

  if (guestDiv) guestDiv.style.display = "none";
  if (userDiv) userDiv.style.display = "block";
  if (userNameSpan && currentUser?.profile) {
    userNameSpan.textContent =
      currentUser.profile.full_name || currentUser.email;
  }
}

function showGuestUI() {
  const guestDiv = document.getElementById("auth-guest");
  const userDiv = document.getElementById("auth-user");

  if (guestDiv) guestDiv.style.display = "block";
  if (userDiv) userDiv.style.display = "none";
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Validation
  if (!validateEmail(email)) {
    showAlert("Please enter a valid email address", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters", "error");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  currentUser = data.user;
  await updateUserProfile();
  showAuthenticatedUI();
  await loadCart();
  showAlert("Login successful!", "success");

  // Check if user is admin and redirect
  if (
    currentUser?.profile?.is_admin &&
    window.location.pathname.includes("admin")
  ) {
    // Already in admin
  }
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  currentUser = null;
  showGuestUI();
  localStorage.removeItem("cart");
  showAlert("Logged out successfully", "success");

  if (
    window.location.pathname.includes("dashboard") ||
    window.location.pathname.includes("admin")
  ) {
    window.location.href = "index.html";
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const fullName = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("reg-confirm-password").value;
  const phone = document.getElementById("reg-phone")?.value || "";
  const address = document.getElementById("reg-address")?.value || "";

  // Validation
  if (!fullName || fullName.length < 2) {
    showAlert("Please enter your full name", "error");
    return;
  }

  if (!validateEmail(email)) {
    showAlert("Please enter a valid email address", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters", "error");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("Passwords do not match", "error");
    return;
  }

  // Register user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    showAlert(error.message, "error");
    return;
  }

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert([
        {
          id: data.user.id,
          full_name: fullName,
          phone: phone,
          address: address,
        },
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }
  }

  showAlert("Registration successful! Please login now.", "success");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}

// Cart Functions
let cart = [];

async function loadCart() {
  if (currentUser) {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", currentUser.id);

    if (!error && data) {
      cart = data.map((item) => ({
        id: item.product_id,
        cartItemId: item.id,
        name: item.products?.name,
        price: parseFloat(item.products?.price),
        quantity: item.quantity,
        image: item.products?.image_url,
      }));
    }
  } else {
    // Load from localStorage for guests
    cart = JSON.parse(localStorage.getItem("cart") || "[]");
  }

  renderCart();
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart-message">Your cart is empty</p>';
    if (cartTotalEl) cartTotalEl.textContent = "Total: Rs.0/-";
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    html += `
            <div class="box">
                <i class="fa fa-trash" onclick="removeFromCart('${item.id}')"></i>
                <img src="${item.image || "https://via.placeholder.com/80"}" alt="${item.name}">
                <div class="content">
                    <h3>${item.name}</h3>
                    <span class="price">Rs.${item.price.toLocaleString()}/-</span>
                    <span class="quantity">Qty: ${item.quantity}</span>
                </div>
            </div>
        `;
  });

  cartItemsContainer.innerHTML = html;
  if (cartTotalEl)
    cartTotalEl.textContent = `Total: Rs.${total.toLocaleString()}/-`;
}

async function addToCart(productId, name, price, image) {
  // Check if already in cart
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: productId,
      name,
      price: parseFloat(price),
      quantity: 1,
      image,
    });
  }

  if (currentUser) {
    // Sync with database
    const { error } = await supabase.from("cart_items").upsert(
      [
        {
          user_id: currentUser.id,
          product_id: productId,
          quantity: existingItem ? existingItem.quantity : 1,
        },
      ],
      { onConflict: "user_id,product_id" },
    );

    if (error) {
      console.error("Cart sync error:", error);
    }
  } else {
    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  renderCart();
  showAlert("Added to cart!", "success");
}

async function removeFromCart(productId) {
  const index = cart.findIndex((item) => item.id === productId);

  if (index > -1) {
    const cartItem = cart[index];

    if (currentUser && cartItem.cartItemId) {
      await supabase.from("cart_items").delete().eq("id", cartItem.cartItemId);
    }

    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}

async function updateCartQuantity(productId, newQuantity) {
  if (newQuantity < 1) return removeFromCart(productId);

  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = newQuantity;

    if (currentUser && item.cartItemId) {
      await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", item.cartItemId);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}

// Search Function
function handleSearch(e) {
  e.preventDefault();
  const query = document.getElementById("search-box").value.trim();
  if (query) {
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  }
}

// Newsletter Function
function handleNewsletter(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  if (validateEmail(email)) {
    showAlert("Thank you for subscribing!", "success");
    e.target.reset();
  } else {
    showAlert("Please enter a valid email address", "error");
  }
}

// Load Page-Specific Content
function loadPageContent() {
  const path = window.location.pathname;

  if (path.includes("products.html")) {
    loadProducts();
  } else if (path.includes("product-detail.html")) {
    loadProductDetail();
  } else if (path.includes("index.html") || path.endsWith("/")) {
    loadFeaturedProducts();
    loadCategories();
  } else if (path.includes("cart.html")) {
    loadCartPage();
  } else if (path.includes("faq.html")) {
    loadFAQs();
  } else if (path.includes("dashboard.html")) {
    loadDashboard();
  } else if (path.includes("orders.html")) {
    loadOrders();
  } else if (path.includes("register.html")) {
    setupRegistration();
  } else if (path.includes("contact.html")) {
    setupContactForm();
  } else if (path.includes("admin")) {
    loadAdminContent();
  }
}

// Load Featured Products on Homepage
async function loadFeaturedProducts() {
  const container = document.querySelector(
    "#featured-products .swiper-wrapper",
  );
  if (!container) return;

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("featured", true)
    .limit(8);

  if (error || !data) {
    container.innerHTML = "<p>Error loading products</p>";
    return;
  }

  let html = "";
  data.forEach((product) => {
    html += `
            <div class="swiper-slide box">
                <img src="${product.image_url || "https://via.placeholder.com/200"}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price">Rs.${parseFloat(product.price).toLocaleString()}/-</div>
                <div class="stock">${product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</div>
                <a href="product-detail.html?id=${product.id}" class="btn">View Details</a>
                <button class="btn btn-primary" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')" ${product.stock_quantity < 1 ? "disabled" : ""}>Add to Cart</button>
            </div>
        `;
  });

  container.innerHTML = html;

  // Initialize Swiper
  new Swiper("#featured-products", {
    loop: true,
    spaceBetween: 20,
    autoplay: { delay: 5000, disableOnInteraction: false },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1020: { slidesPerView: 3 },
    },
  });
}

// Load Categories
async function loadCategories() {
  const container = document.getElementById("categories-container");
  if (!container) return;

  const { data, error } = await supabase.from("categories").select("*");

  if (error || !data) return;

  let html = "";
  data.forEach((cat) => {
    html += `
            <div class="box">
                <img src="${cat.image_url || "https://via.placeholder.com/150"}" alt="${cat.name}">
                <h3>${cat.name}</h3>
                <a href="products.html?category=${cat.id}" class="btn">Shop Now</a>
            </div>
        `;
  });

  container.innerHTML = html;
}

// Load Products Page
async function loadProducts() {
  const container = document.getElementById("products-grid");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");
  const categoryId = urlParams.get("category");

  let query = supabase.from("products").select("*, categories(name)");

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error || !data) {
    container.innerHTML = "<p>Error loading products</p>";
    return;
  }

  if (data.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fa fa-search"></i><h3>No products found</h3><p>Try a different search term</p></div>';
    return;
  }

  let html = "";
  data.forEach((product) => {
    html += `
            <div class="product-card">
                <img src="${product.image_url || "https://via.placeholder.com/200"}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price">Rs.${parseFloat(product.price).toLocaleString()}/-</div>
                <div class="stock">${product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of Stock"}</div>
                <p class="description">${product.description?.substring(0, 100) || ""}...</p>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <a href="product-detail.html?id=${product.id}" class="btn">View</a>
                    <button class="btn btn-primary" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')" ${product.stock_quantity < 1 ? "disabled" : ""}>Add to Cart</button>
                </div>
            </div>
        `;
  });

  container.innerHTML = html;
}

// Load Product Detail
async function loadProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "products.html";
    return;
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("id", productId)
    .single();

  if (error || !product) {
    document.getElementById("product-detail-container").innerHTML =
      "<p>Product not found</p>";
    return;
  }

  document.title = `${product.name} - ByteHub`;

  const imageEl = document.getElementById("product-image");
  const nameEl = document.getElementById("product-name");
  const priceEl = document.getElementById("product-price");
  const descEl = document.getElementById("product-description");
  const stockEl = document.getElementById("product-stock");
  const categoryEl = document.getElementById("product-category");
  const addBtn = document.getElementById("add-to-cart-btn");

  if (imageEl) imageEl.src = product.image_url;
  if (nameEl) nameEl.textContent = product.name;
  if (priceEl)
    priceEl.textContent = `Rs.${parseFloat(product.price).toLocaleString()}/-`;
  if (descEl)
    descEl.textContent = product.description || "No description available.";
  if (stockEl)
    stockEl.textContent =
      product.stock_quantity > 0
        ? `${product.stock_quantity} in stock`
        : "Out of Stock";
  if (categoryEl)
    categoryEl.textContent = product.categories?.name || "Uncategorized";
  if (addBtn) {
    addBtn.disabled = product.stock_quantity < 1;
    addBtn.onclick = () => {
      const qty = parseInt(document.getElementById("quantity")?.value || 1);
      for (let i = 0; i < qty; i++) {
        addToCart(product.id, product.name, product.price, product.image_url);
      }
    };
  }
}

// Load Cart Page
function loadCartPage() {
  updateCartPageUI();
}

function updateCartPageUI() {
  const container = document.getElementById("cart-items-list");
  const summaryItems = document.getElementById("summary-items");
  const summaryTotal = document.getElementById("summary-total");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fa fa-shopping-cart"></i><h3>Your cart is empty</h3><p>Add some products to get started</p><a href="products.html" class="btn">Browse Products</a></div>';
    document.getElementById("cart-summary-container")?.classList.add("hidden");
    return;
  }

  let html = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    html += `
            <div class="cart-item">
                <img src="${item.image || "https://via.placeholder.com/100"}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p class="price">Rs.${item.price.toLocaleString()}/-</p>
                </div>
                <div class="quantity-control">
                    <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <p class="item-total" style="font-size: 1.6rem; font-weight: bold; min-width: 15rem; text-align: right;">Rs.${itemTotal.toLocaleString()}/-</p>
                <button onclick="removeFromCart('${item.id}')" class="btn btn-danger" style="padding: 0.5rem 1rem;"><i class="fa fa-trash"></i></button>
            </div>
        `;
  });

  container.innerHTML = html;

  if (summaryItems) summaryItems.textContent = cart.length;
  if (summaryTotal)
    summaryTotal.textContent = `Rs.${subtotal.toLocaleString()}/-`;

  // Setup checkout button
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.onclick = handleCheckout;
  }
}

async function handleCheckout() {
  if (!currentUser) {
    showAlert("Please login to checkout", "warning");
    window.location.href = "index.html";
    return;
  }

  if (cart.length === 0) {
    showAlert("Your cart is empty", "warning");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: currentUser.id,
        total_amount: total,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (orderError) {
    showAlert("Error creating order: " + orderError.message, "error");
    return;
  }

  // Add order items
  const orderItems = cart.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    showAlert("Error adding order items", "error");
    return;
  }

  // Clear cart
  await supabase.from("cart_items").delete().eq("user_id", currentUser.id);
  cart = [];
  localStorage.removeItem("cart");

  showAlert("Order placed successfully!", "success");
  window.location.href = `orders.html`;
}

// Load FAQs
async function loadFAQs() {
  const container = document.getElementById("faq-container");
  if (!container) return;

  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order");

  if (error || !data) return;

  let html = "";
  data.forEach((faq, index) => {
    html += `
            <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(${index})">
                    <span>${faq.question}</span>
                    <i class="fa fa-chevron-down"></i>
                </div>
                <div class="faq-answer">${faq.answer}</div>
            </div>
        `;
  });

  container.innerHTML = html;
}

function toggleFAQ(index) {
  const items = document.querySelectorAll(".faq-item");
  if (items[index]) {
    items[index].classList.toggle("active");
  }
}

// Dashboard
async function loadDashboard() {
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  const nameEl = document.getElementById("user-full-name");
  const emailEl = document.getElementById("user-email");
  const phoneEl = document.getElementById("user-phone");
  const addressEl = document.getElementById("user-address");

  if (nameEl) nameEl.value = currentUser.profile?.full_name || "";
  if (emailEl) emailEl.textContent = currentUser.email;
  if (phoneEl) phoneEl.value = currentUser.profile?.phone || "";
  if (addressEl) addressEl.value = currentUser.profile?.address || "";

  // Profile form
  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.onsubmit = async (e) => {
      e.preventDefault();

      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: nameEl.value,
          phone: phoneEl.value,
          address: addressEl.value,
        })
        .eq("id", currentUser.id);

      if (error) {
        showAlert("Error updating profile", "error");
      } else {
        showAlert("Profile updated successfully", "success");
      }
    };
  }
}

// Load Orders
async function loadOrders() {
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  const container = document.getElementById("orders-container");
  if (!container) return;

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error || !orders) {
    container.innerHTML = "<p>Error loading orders</p>";
    return;
  }

  if (orders.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fa fa-shopping-bag"></i><h3>No orders yet</h3><p>Start shopping to see your orders here</p><a href="products.html" class="btn">Shop Now</a></div>';
    return;
  }

  let html = "";
  orders.forEach((order) => {
    const statusClass = `status-${order.status}`;
    const date = new Date(order.created_at).toLocaleDateString();

    html += `
            <div style="background: #f9f9f9; padding: 1.5rem; border-radius: .5rem; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-size: 1.8rem;">Order #${order.id.substring(0, 8).toUpperCase()}</h3>
                        <p style="font-size: 1.4rem; color: var(--light-color);">${date}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${order.status.toUpperCase()}</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    ${order.order_items
                      .map(
                        (item) => `
                        <div style="display: flex; justify-content: space-between; padding: .5rem 0; font-size: 1.4rem;">
                            <span>${item.product_name} x ${item.quantity}</span>
                            <span>Rs.${(item.unit_price * item.quantity).toLocaleString()}/-</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ddd; padding-top: 1rem;">
                    <strong style="font-size: 1.6rem;">Total: Rs.${parseFloat(order.total_amount).toLocaleString()}/-</strong>
                    ${order.tracking_number ? `<p style="font-size: 1.4rem;">Tracking: ${order.tracking_number}</p>` : ""}
                </div>
            </div>
        `;
  });

  container.innerHTML = html;
}

// Registration Form Setup
function setupRegistration() {
  const regForm = document.getElementById("registration-form");
  if (regForm) {
    regForm.onsubmit = handleRegister;
  }
}

// Contact Form
function setupContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.onsubmit = async (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name").value;
      const email = document.getElementById("contact-email").value;
      const subject = document.getElementById("contact-subject").value;
      const message = document.getElementById("contact-message").value;

      // Validation
      if (!name || name.length < 2) {
        showAlert("Please enter your name", "error");
        return;
      }

      if (!validateEmail(email)) {
        showAlert("Please enter a valid email", "error");
        return;
      }

      if (!message || message.length < 10) {
        showAlert("Please enter a message (at least 10 characters)", "error");
        return;
      }

      const { error } = await supabase
        .from("contacts")
        .insert([{ name, email, subject, message }]);

      if (error) {
        showAlert("Error sending message", "error");
      } else {
        showAlert("Message sent successfully!", "success");
        contactForm.reset();
      }
    };
  }
}

// Admin Functions
async function loadAdminContent() {
  if (!currentUser?.profile?.is_admin) {
    window.location.href = "index.html";
    return;
  }

  const path = window.location.pathname;

  if (path.includes("admin-products")) {
    loadAdminProducts();
  } else if (path.includes("admin-users")) {
    loadAdminUsers();
  } else if (path.includes("admin-orders")) {
    loadAdminOrders();
  } else if (path.includes("admin-faqs")) {
    loadAdminFAQs();
  } else if (path.includes("admin-dashboard")) {
    loadAdminDashboard();
  }
}

async function loadAdminDashboard() {
  // Load dashboard stats
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  const { count: userCount } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });
  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const productStat = document.getElementById("stat-products");
  const userStat = document.getElementById("stat-users");
  const orderStat = document.getElementById("stat-orders");

  if (productStat) productStat.textContent = productCount || 0;
  if (userStat) userStat.textContent = userCount || 0;
  if (orderStat) orderStat.textContent = orderCount || 0;
}

async function loadAdminProducts() {
  const container = document.getElementById("admin-products-table");
  if (!container) return;

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)");

  if (error) {
    showAlert("Could not load products: " + error.message, "error");
    return;
  }

  let html = `
        <button class="btn btn-primary" onclick="showProductModal()" style="margin-bottom: 2rem;">Add New Product</button>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

  data.forEach((product) => {
    html += `
            <tr>
                <td>${escapeHtml(product.name)}</td>
                <td>${product.categories?.name || "N/A"}</td>
                <td>Rs.${parseFloat(product.price).toLocaleString()}</td>
                <td>${product.stock_quantity}</td>
                <td>
                    <div class="admin-table-actions">
                        <button class="btn btn-primary" onclick="editProduct('${product.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
  });

  html += "</tbody></table></div>";
  container.innerHTML = html;
}

async function loadAdminUsers() {
  const container = document.getElementById("admin-users-table");
  if (!container) return;

  const { data, error } = await supabase.from("user_profiles").select("*");
  if (error) return;

  let html = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Admin</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

  data.forEach((user) => {
    html += `
            <tr>
                <td>${user.full_name || "N/A"}</td>
                <td>${user.phone || "N/A"}</td>
                <td>${user.address || "N/A"}</td>
                <td>${user.is_admin ? "Yes" : "No"}</td>
                <td>
                    <div class="admin-table-actions">
                        <button class="btn btn-primary" onclick="toggleAdmin('${user.id}', ${!user.is_admin})">${user.is_admin ? "Remove Admin" : "Make Admin"}</button>
                    </div>
                </td>
            </tr>
        `;
  });

  html += "</tbody></table></div>";
  container.innerHTML = html;
}

async function loadAdminOrders() {
  const container = document.getElementById("admin-orders-table");
  if (!container) return;

  const { data, error } = await supabase
    .from("orders")
    .select("*, user_profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) return;

  let html = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

  data.forEach((order) => {
    const statusClass = `status-${order.status}`;
    html += `
            <tr>
                <td>${order.id.substring(0, 8).toUpperCase()}</td>
                <td>${order.user_profiles?.full_name || "N/A"}</td>
                <td>Rs.${parseFloat(order.total_amount).toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="admin-table-actions">
                        <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 0.5rem; font-size: 1.3rem;">
                            <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
                            <option value="processing" ${order.status === "processing" ? "selected" : ""}>Processing</option>
                            <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Shipped</option>
                            <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
                            <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Cancelled</option>
                        </select>
                    </div>
                </td>
            </tr>
        `;
  });

  html += "</tbody></table></div>";
  container.innerHTML = html;
}

async function loadAdminFAQs() {
  const container = document.getElementById("admin-faqs-container");
  if (!container) return;

  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order");
  if (error) return;

  let html =
    '<button class="btn btn-primary" onclick="showFAQModal()" style="margin-bottom: 2rem;">Add New FAQ</button>';

  data.forEach((faq) => {
    html += `
            <div style="background: #f9f9f9; padding: 1.5rem; border-radius: .5rem; margin-bottom: 1rem;">
                <h4 style="font-size: 1.6rem; margin-bottom: 1rem;">${faq.question}</h4>
                <p style="font-size: 1.4rem; color: var(--light-color); margin-bottom: 1rem;">${faq.answer}</p>
                <div class="admin-table-actions">
                    <button class="btn btn-primary" onclick="editFAQ('${faq.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteFAQ('${faq.id}')">Delete</button>
                </div>
            </div>
        `;
  });

  container.innerHTML = html;
}

// Admin Actions
async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      tracking_number: status === "shipped" ? `BH${Date.now()}` : null,
    })
    .eq("id", orderId);

  if (error) {
    showAlert("Error updating order", "error");
  } else {
    showAlert("Order status updated", "success");
  }
}

async function toggleAdmin(userId, isAdmin) {
  const { error } = await supabase
    .from("user_profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) {
    showAlert("Error updating user", "error");
  } else {
    showAlert("User role updated", "success");
    loadAdminUsers();
  }
}

async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error(error);
    showAlert("Could not delete product: " + error.message, "error");
  } else {
    showAlert("Product deleted", "success");
    loadAdminProducts();
  }
}

async function deleteFAQ(faqId) {
  if (!confirm("Are you sure you want to delete this FAQ?")) return;

  const { error } = await supabase.from("faqs").delete().eq("id", faqId);

  if (error) {
    showAlert("Error deleting FAQ", "error");
  } else {
    showAlert("FAQ deleted", "success");
    loadAdminFAQs();
  }
}

// Modal Functions
function showProductModal(productId = null) {
  const isEdit = Boolean(productId);

  const modal = document.createElement("div");
  modal.className = "modal-overlay active";
  modal.innerHTML = `
        <div class="modal">
            <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            <h2>${isEdit ? "Edit Product" : "Add New Product"}</h2>
            <form id="product-form">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="prod-name" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="prod-desc" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Price (Rs.)</label>
                    <input type="number" id="prod-price" required step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label>Image URL</label>
                    <input type="text" id="prod-image">
                </div>
                <div class="form-group">
                    <label>Stock Quantity</label>
                    <input type="number" id="prod-stock" required step="1" min="0">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="prod-category" required>
                        <option value="">Select a category</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="prod-featured"> Featured Product
                    </label>
                </div>
                <button type="submit" id="prod-submit" class="btn btn-primary">${isEdit ? "Update" : "Add"} Product</button>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  const form = document.getElementById("product-form");
  const submitBtn = document.getElementById("prod-submit");
  const submitLabel = submitBtn.textContent;

  // Load categories first, then (when editing) the product, so the saved
  // category can be selected in the dropdown.
  (async () => {
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");

    if (catError) {
      console.error(catError);
      showAlert("Could not load categories: " + catError.message, "error");
      return;
    }

    const select = document.getElementById("prod-category");
    (categories || []).forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });

    if (!isEdit) return;

    const { data: product, error: prodError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (prodError || !product) {
      console.error(prodError);
      showAlert("Could not load product details", "error");
      return;
    }

    document.getElementById("prod-name").value = product.name || "";
    document.getElementById("prod-desc").value = product.description || "";
    document.getElementById("prod-price").value = product.price;
    document.getElementById("prod-image").value = product.image_url || "";
    document.getElementById("prod-stock").value = product.stock_quantity;
    document.getElementById("prod-featured").checked = Boolean(
      product.featured,
    );
    if (product.category_id !== null && product.category_id !== undefined) {
      select.value = String(product.category_id);
    }
  })();

  form.onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById("prod-name").value.trim();
    const price = parseFloat(document.getElementById("prod-price").value);
    const stock = parseInt(document.getElementById("prod-stock").value, 10);
    const categoryId = document.getElementById("prod-category").value;

    if (!name) {
      showAlert("Product name is required", "error");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      showAlert("Enter a valid price (0 or more)", "error");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      showAlert(
        "Enter a valid stock quantity (a whole number, 0 or more)",
        "error",
      );
      return;
    }
    if (!categoryId) {
      showAlert("Please choose a category", "error");
      return;
    }

    const productData = {
      name: name,
      description: document.getElementById("prod-desc").value.trim(),
      price: price,
      image_url: document.getElementById("prod-image").value.trim(),
      stock_quantity: stock,
      category_id: categoryId,
      featured: document.getElementById("prod-featured").checked,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const { error } = isEdit
      ? await supabase.from("products").update(productData).eq("id", productId)
      : await supabase.from("products").insert([productData]);

    if (error) {
      console.error(error);
      showAlert("Could not save product: " + error.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
      return;
    }

    modal.remove();
    showAlert(
      isEdit ? "Product updated successfully" : "Product added successfully",
      "success",
    );
    loadAdminProducts();
  };
}

function editProduct(productId) {
  showProductModal(productId);
}

function showFAQModal(faqId = null) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay active";
  modal.innerHTML = `
        <div class="modal">
            <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            <h2>${faqId ? "Edit FAQ" : "Add New FAQ"}</h2>
            <form id="faq-form">
                <div class="form-group">
                    <label>Question</label>
                    <input type="text" id="faq-question" required>
                </div>
                <div class="form-group">
                    <label>Answer</label>
                    <textarea id="faq-answer" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">${faqId ? "Update" : "Add"} FAQ</button>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  document.getElementById("faq-form").onsubmit = async (e) => {
    e.preventDefault();

    const faqData = {
      question: document.getElementById("faq-question").value,
      answer: document.getElementById("faq-answer").value,
    };

    if (faqId) {
      await supabase.from("faqs").update(faqData).eq("id", faqId);
    } else {
      await supabase.from("faqs").insert([faqData]);
    }

    modal.remove();
    showAlert("FAQ saved successfully", "success");
    loadAdminFAQs();
  };
}

function editFAQ(faqId) {
  showFAQModal(faqId);
  supabase
    .from("faqs")
    .select("*")
    .eq("id", faqId)
    .single()
    .then(({ data }) => {
      if (data) {
        document.getElementById("faq-question").value = data.question;
        document.getElementById("faq-answer").value = data.answer;
      }
    });
}

// Validation Functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\d\s\-+()]{10,}$/;
  return re.test(phone);
}

// Alert Function
function showAlert(message, type = "success") {
  // Escape text before putting it into innerHTML / attribute values
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "10rem";
  alertDiv.style.right = "2rem";
  alertDiv.style.zIndex = "3000";
  alertDiv.style.maxWidth = "40rem";

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleFAQ = toggleFAQ;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.showProductModal = showProductModal;
window.editFAQ = editFAQ;
window.deleteFAQ = deleteFAQ;
window.showFAQModal = showFAQModal;
window.updateOrderStatus = updateOrderStatus;
window.toggleAdmin = toggleAdmin;
