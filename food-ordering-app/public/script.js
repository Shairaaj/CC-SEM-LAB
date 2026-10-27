const $ = (id) => document.getElementById(id);

// Send API requests to the Express backend
async function api(url, method = "GET", body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body !== undefined) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Display food items and populate the order dropdown
async function loadFoods() {
  const foods = await api("/api/foods");

  $("foodList").innerHTML = foods
    .map(
      (food) => `
    <div class="item">
      <strong>${escapeHtml(food.name)}</strong> — ₹${food.price.toFixed(2)}
      <span class="${food.available ? "" : "unavailable"}">
        ${food.available ? "Available" : "Unavailable"}
      </span>
      <div class="actions">
        <button onclick="editFood(${food.id})">Edit</button>
        <button onclick="toggleFood(${food.id}, ${!food.available})">
          ${food.available ? "Mark Unavailable" : "Mark Available"}
        </button>
        <button onclick="deleteFood(${food.id})">Delete</button>
      </div>
    </div>
  `,
    )
    .join("");

  $("orderFood").innerHTML = foods
    .filter((food) => food.available)
    .map(
      (food) => `
      <option value="${food.id}">
        ${escapeHtml(food.name)} — ₹${food.price.toFixed(2)}
      </option>
    `,
    )
    .join("");
}

// Escape text before inserting user-controlled strings into HTML
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

// CREATE: Add a new dish
$("foodForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/foods", "POST", {
      name: $("foodName").value.trim(),
      price: Number($("foodPrice").value),
    });

    event.target.reset();
    await refresh();
  } catch (error) {
    alert(error.message);
  }
});

// UPDATE: Edit a dish
async function editFood(id) {
  try {
    const name = prompt("Enter the new dish name:");
    if (name === null) return;

    const price = prompt("Enter the new price:");
    if (price === null) return;

    await api(`/api/foods/${id}`, "PUT", {
      name: name.trim(),
      price: Number(price),
    });

    await refresh();
  } catch (error) {
    alert(error.message);
  }
}

// UPDATE: Change availability
async function toggleFood(id, available) {
  try {
    await api(`/api/foods/${id}`, "PUT", { available });
    await refresh();
  } catch (error) {
    alert(error.message);
  }
}

// DELETE: Remove a dish
async function deleteFood(id) {
  if (!confirm("Delete this dish?")) return;

  try {
    await api(`/api/foods/${id}`, "DELETE");
    await refresh();
  } catch (error) {
    alert(error.message);
  }
}

// CREATE: Place a customer order
$("orderForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/orders", "POST", {
      customer: $("customer").value.trim(),
      foodId: Number($("orderFood").value),
      quantity: Number($("quantity").value),
    });

    event.target.reset();
    $("quantity").value = 1;
    await loadOrders();
  } catch (error) {
    alert(error.message);
  }
});

// READ and UPDATE: Display orders and change their status
async function loadOrders() {
  const orders = await api("/api/orders");
  const statuses = ["Pending", "Preparing", "Delivered", "Cancelled"];

  $("orderList").innerHTML =
    orders
      .map(
        (order) => `
    <div class="item">
      <strong>Order #${order.id}</strong><br>
      Customer: ${escapeHtml(order.customer)}<br>
      Dish: ${escapeHtml(order.food)} × ${order.quantity}<br>
      Status: ${escapeHtml(order.status)}
      <div class="actions">
        <select id="status-${order.id}">
          ${statuses
            .map(
              (status) => `
            <option value="${status}" ${status === order.status ? "selected" : ""}>
              ${status}
            </option>
          `,
            )
            .join("")}
        </select>
        <button onclick="updateOrder(${order.id})">Update Status</button>
      </div>
    </div>
  `,
      )
      .join("") || "No orders yet.";
}

async function updateOrder(id) {
  try {
    await api(`/api/orders/${id}`, "PUT", {
      status: $(`status-${id}`).value,
    });
    await loadOrders();
  } catch (error) {
    alert(error.message);
  }
}

// Reload both sections after a change
async function refresh() {
  await loadFoods();
  await loadOrders();
}

refresh().catch((error) => alert(error.message));
