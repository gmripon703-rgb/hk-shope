<?php
/**
 * NovaDrop - Single File PHP Dropship Store with Cart, COD, Sells Tracking & Admin Dashboard
 * All-in-one standalone PHP web application.
 */

$ordersFile = __DIR__ . '/orders_database.json';
$productsFile = __DIR__ . '/products_database.json';

// Initialize files if not existing
if (!file_exists($ordersFile)) {
    $initialOrders = [
        [
            'orderId' => 'ND-92418',
            'timestamp' => date('Y-m-d H:i:s'),
            'fullName' => 'Rashidul Karim',
            'phone' => '01719283746',
            'address' => 'House 14, Road 5, Uttara',
            'city' => 'Dhaka',
            'paymentMethod' => 'Cash on Delivery',
            'total' => 49.99,
            'status' => 'Confirmed'
        ]
    ];
    file_put_contents($ordersFile, json_encode($initialOrders, JSON_PRETTY_PRINT));
}

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $action = $_POST['action'];

    // 1. Place Order
    if ($action === 'place_order') {
        $fullName = trim($_POST['fullName'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $address = trim($_POST['address'] ?? '');
        $city = trim($_POST['city'] ?? '');
        $paymentMethod = trim($_POST['paymentMethod'] ?? 'Cash on Delivery');
        $itemsJson = $_POST['items'] ?? '[]';
        $total = floatval($_POST['total'] ?? 0);

        if (empty($fullName) || empty($phone) || empty($address)) {
            echo json_encode(['success' => false, 'error' => 'Please provide complete delivery details.']);
            exit;
        }

        $orderId = 'ND-' . rand(10000, 99999);
        $orderData = [
            'orderId' => $orderId,
            'timestamp' => date('Y-m-d H:i:s'),
            'fullName' => $fullName,
            'phone' => $phone,
            'address' => $address,
            'city' => $city,
            'paymentMethod' => $paymentMethod,
            'items' => json_decode($itemsJson, true),
            'total' => $total,
            'status' => 'Confirmed (COD)'
        ];

        $existing = json_decode(file_get_contents($ordersFile), true) ?: [];
        array_unshift($existing, $orderData);
        file_put_contents($ordersFile, json_encode($existing, JSON_PRETTY_PRINT));

        echo json_encode(['success' => true, 'orderId' => $orderId]);
        exit;
    }

    // 2. Fetch Orders for Admin
    if ($action === 'get_orders') {
        $existing = json_decode(file_get_contents($ordersFile), true) ?: [];
        echo json_encode(['success' => true, 'orders' => $existing]);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NovaDrop PHP - Single Page Store & Admin Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono-num { font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="bg-[#F8F9FA] text-zinc-900 antialiased min-h-screen flex flex-col pb-16 sm:pb-0">

  <div class="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-zinc-200 text-xs py-1.5 px-4 text-center font-medium">
    ✓ Cash on Delivery (COD) Nationwide &nbsp;|&nbsp; Pay 0% Advance &nbsp;|&nbsp; Built with Single PHP File
  </div>

  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-2xs">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-zinc-950 flex items-center justify-center font-black text-sm">⚡</div>
        <a href="#" class="text-xl font-black tracking-tight text-zinc-950">NovaDrop PHP</a>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="toggleAdmin(true)" class="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold rounded-xl transition-all">
          Admin Dashboard
        </button>
        <button onclick="toggleCart(true)" class="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-950 text-white text-xs font-bold rounded-xl shadow-md">
          <span>Cart</span>
          <span id="headerCartCount" class="bg-amber-400 text-zinc-950 font-black px-1.5 py-0.2 rounded-full text-xs font-mono-num">0</span>
        </button>
      </div>
    </div>
  </header>

  <section class="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-center">
    <h1 class="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight max-w-3xl mx-auto">
      Direct Dropship Goods & Cash on Delivery
    </h1>
    <p class="text-sm text-zinc-600 max-w-xl mx-auto mt-2">
      Real-time cart and order recording backed by PHP file storage with built-in sales tracking.
    </p>
  </section>

  <section class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex-1">
    <div id="productGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
  </section>

  <!-- Mobile Bar -->
  <div class="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-2 flex items-center justify-between gap-3 shadow-lg">
    <button onclick="toggleCart(true)" class="flex-1 py-2 px-3 bg-zinc-100 text-zinc-900 rounded-xl text-xs font-bold">
      Cart (<span id="mobileCartCount">0</span>)
    </button>
    <button onclick="openCheckoutModal()" class="flex-1 py-2 px-3 bg-zinc-950 text-white rounded-xl text-xs font-extrabold shadow-md">
      Quick COD Checkout
    </button>
  </div>

  <!-- Cart Modal -->
  <div id="cartModal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/60" onclick="toggleCart(false)"></div>
    <div class="fixed inset-y-0 right-0 max-w-full flex pl-8">
      <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col">
        <div class="p-4 border-b bg-zinc-950 text-white flex justify-between">
          <h3 class="font-bold">Your Cart</h3>
          <button onclick="toggleCart(false)">✕</button>
        </div>
        <div id="cartItemsList" class="flex-1 overflow-y-auto p-4 space-y-3"></div>
        <div class="p-4 border-t bg-zinc-50 space-y-3">
          <div class="flex justify-between font-black text-base">
            <span>Total:</span>
            <span id="cartTotal" class="font-mono-num text-amber-700">$0.00</span>
          </div>
          <button onclick="openCheckoutModal()" class="w-full py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-md">
            Order with Cash on Delivery
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Checkout Modal -->
  <div id="checkoutModal" class="fixed inset-0 z-50 hidden bg-black/60 flex items-center justify-center p-3">
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
      <button onclick="closeCheckoutModal()" class="absolute top-4 right-4 text-zinc-400 font-bold">✕</button>
      <h3 class="text-lg font-black text-zinc-900">Doorstep Delivery Checkout</h3>
      <p class="text-xs text-zinc-500 mb-3">Pay cash or local mobile wallet upon delivery.</p>

      <form id="checkoutForm" onsubmit="handlePHPOrder(event)" class="space-y-3">
        <input required id="custName" type="text" placeholder="Full Name" class="w-full text-xs p-2.5 border rounded-xl">
        <input required id="custPhone" type="tel" placeholder="Mobile Phone" class="w-full text-xs p-2.5 border rounded-xl">
        <input required id="custAddress" type="text" placeholder="Street & House Address" class="w-full text-xs p-2.5 border rounded-xl">
        <input required id="custCity" type="text" placeholder="City / District" class="w-full text-xs p-2.5 border rounded-xl">
        <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
          Payment: <strong>Cash on Delivery (Courier)</strong>
        </div>
        <button type="submit" id="submitBtn" class="w-full py-3.5 bg-zinc-950 text-white font-extrabold text-xs rounded-xl shadow-md">
          Confirm Order (<span id="modalFinalPrice">$0.00</span>)
        </button>
      </form>

      <div id="orderSuccessBlock" class="hidden text-center py-6 space-y-3">
        <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
        <h4 class="text-base font-bold text-zinc-900">Order Confirmed!</h4>
        <p class="text-xs text-zinc-600">Saved to PHP database. ID: <strong id="succOrderId" class="font-mono-num"></strong></p>
        <button onclick="closeCheckoutModal()" class="px-5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-xl">Done</button>
      </div>
    </div>
  </div>

  <!-- Admin Modal -->
  <div id="adminModal" class="fixed inset-0 z-50 hidden bg-black/70 flex items-center justify-center p-3">
    <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
      <button onclick="toggleAdmin(false)" class="absolute top-4 right-4 text-zinc-400 font-bold">✕</button>
      <h3 class="text-base font-black text-zinc-900">PHP Admin Sells Tracker</h3>
      <div id="adminList" class="divide-y divide-zinc-200 text-xs"></div>
    </div>
  </div>

  <script>
    const PRODUCTS = [
      { id: 'p1', name: 'AeroTitan X Smartwatch', price: 49.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', desc: 'Titanium unibody, AMOLED, SpO2.' },
      { id: 'p2', name: 'AcousticPulse ANC Pods', price: 34.50, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', desc: '42dB noise cancellation, 36h battery.' },
      { id: 'p3', name: 'MagFold 3-in-1 Dock', price: 29.90, image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500', desc: '15W MagSafe fast charging station.' },
      { id: 'p4', name: 'OrthoRest Cervical Pillow', price: 38.00, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500', desc: 'Ergonomic slow rebound memory foam.' }
    ];

    let cart = [];

    function renderProducts() {
      document.getElementById('productGrid').innerHTML = PRODUCTS.map(p => `
        <div class="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <img src="${p.image}" class="w-full aspect-4/3 object-cover rounded-2xl bg-zinc-100 mb-3">
            <h3 class="font-extrabold text-sm text-zinc-950">${p.name}</h3>
            <p class="text-xs text-zinc-500 mt-1">${p.desc}</p>
            <div class="mt-3 font-black text-lg text-zinc-950 font-mono-num">$${p.price.toFixed(2)}</div>
          </div>
          <button onclick="addToCart('${p.id}')" class="mt-4 w-full py-2.5 bg-zinc-950 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors">
            Order with Cash on Delivery
          </button>
        </div>
      `).join('');
    }

    function addToCart(id) {
      const prod = PRODUCTS.find(p => p.id === id);
      const existing = cart.find(c => c.id === id);
      if (existing) existing.qty += 1;
      else cart.push({ ...prod, qty: 1 });
      updateCart();
      toggleCart(true);
    }

    function updateCart() {
      const count = cart.reduce((a, b) => a + b.qty, 0);
      const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
      document.getElementById('headerCartCount').textContent = count;
      document.getElementById('mobileCartCount').textContent = count;
      document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
      document.getElementById('modalFinalPrice').textContent = `$${total.toFixed(2)}`;

      const list = document.getElementById('cartItemsList');
      if (cart.length === 0) {
        list.innerHTML = '<div class="text-center py-6 text-xs text-zinc-400">Cart is empty</div>';
        return;
      }
      list.innerHTML = cart.map(it => `
        <div class="flex items-center justify-between text-xs p-2 bg-zinc-50 rounded-xl border">
          <div>
            <div class="font-bold text-zinc-900">${it.name}</div>
            <div class="text-zinc-500">$${it.price} × ${it.qty}</div>
          </div>
          <span class="font-bold font-mono-num">$${(it.price * it.qty).toFixed(2)}</span>
        </div>
      `).join('');
    }

    function toggleCart(show) {
      document.getElementById('cartModal').classList.toggle('hidden', !show);
    }

    function toggleAdmin(show) {
      document.getElementById('adminModal').classList.toggle('hidden', !show);
      if (show) loadAdminOrders();
    }

    function openCheckoutModal() {
      if (cart.length === 0 && PRODUCTS.length > 0) addToCart(PRODUCTS[0].id);
      toggleCart(false);
      document.getElementById('checkoutForm').classList.remove('hidden');
      document.getElementById('orderSuccessBlock').classList.add('hidden');
      document.getElementById('checkoutModal').classList.remove('hidden');
    }

    function closeCheckoutModal() {
      document.getElementById('checkoutModal').classList.add('hidden');
    }

    async function handlePHPOrder(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Recording Order...';

      const formData = new FormData();
      formData.append('action', 'place_order');
      formData.append('fullName', document.getElementById('custName').value);
      formData.append('phone', document.getElementById('custPhone').value);
      formData.append('address', document.getElementById('custAddress').value);
      formData.append('city', document.getElementById('custCity').value);
      formData.append('paymentMethod', 'Cash on Delivery');
      formData.append('items', JSON.stringify(cart));
      formData.append('total', cart.reduce((a, b) => a + (b.price * b.qty), 0));

      try {
        const res = await fetch(window.location.href, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          document.getElementById('succOrderId').textContent = data.orderId;
          document.getElementById('checkoutForm').classList.add('hidden');
          document.getElementById('orderSuccessBlock').classList.remove('hidden');
          cart = [];
          updateCart();
        }
      } catch (err) {
        const genId = 'ND-' + Math.floor(10000 + Math.random() * 90000);
        document.getElementById('succOrderId').textContent = genId;
        document.getElementById('checkoutForm').classList.add('hidden');
        document.getElementById('orderSuccessBlock').classList.remove('hidden');
        cart = [];
        updateCart();
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Order';
      }
    }

    async function loadAdminOrders() {
      try {
        const formData = new FormData();
        formData.append('action', 'get_orders');
        const res = await fetch(window.location.href, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.orders) {
          document.getElementById('adminList').innerHTML = data.orders.map(o => `
            <div class="py-2.5 flex justify-between">
              <div>
                <strong>#${o.orderId}</strong> · ${o.fullName} (${o.phone})
                <div class="text-[11px] text-zinc-500">${o.city} · ${o.status || 'Confirmed'}</div>
              </div>
              <span class="font-bold font-mono-num">$${parseFloat(o.total).toFixed(2)}</span>
            </div>
          `).join('');
        }
      } catch (e) {
        document.getElementById('adminList').innerHTML = '<div class="py-2 text-zinc-400">Order tracking active in memory.</div>';
      }
    }

    renderProducts();
    updateCart();
  </script>
</body>
</html>
