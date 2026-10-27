const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Sample food menu
let foods = [
  { id: 1, name: "Veg Burger", price: 99, available: true },
  { id: 2, name: "Pizza", price: 199, available: true },
  { id: 3, name: "Fried Rice", price: 149, available: true },
];

// Sample customer orders
let orders = [
  { id: 1, customer: "Arun", food: "Pizza", quantity: 2, status: "Pending" },
];

// READ: Get all food items
app.get("/api/foods", (req, res) => {
  res.json(foods);
});

// CREATE: Add a new food item
app.post("/api/foods", (req, res) => {
  const { name, price } = req.body;

  if (!name || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: "Enter a valid name and price." });
  }

  const food = {
    id: Date.now(),
    name,
    price,
    available: true,
  };

  foods.push(food);
  res.status(201).json(food);
});

// UPDATE: Edit food details
app.put("/api/foods/:id", (req, res) => {
  const food = foods.find((f) => f.id === Number(req.params.id));

  if (!food) {
    return res.status(404).json({ error: "Food item not found." });
  }

  const { name, price, available } = req.body;

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Invalid name." });
    }
    food.name = name.trim();
  }

  if (price !== undefined) {
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid price." });
    }
    food.price = price;
  }

  if (available !== undefined) {
    if (typeof available !== "boolean") {
      return res.status(400).json({ error: "Invalid availability." });
    }
    food.available = available;
  }

  res.json(food);
});

// DELETE: Remove a food item
app.delete("/api/foods/:id", (req, res) => {
  const oldLength = foods.length;
  foods = foods.filter((f) => f.id !== Number(req.params.id));

  if (foods.length === oldLength) {
    return res.status(404).json({ error: "Food item not found." });
  }

  res.json({ message: "Food item deleted." });
});

// READ: Get all customer orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// CREATE: Place a customer order
app.post("/api/orders", (req, res) => {
  const { customer, foodId, quantity } = req.body;
  const food = foods.find((f) => f.id === Number(foodId));

  if (
    !customer?.trim() ||
    !food ||
    !food.available ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return res.status(400).json({ error: "Invalid order details." });
  }

  const order = {
    id: Date.now(),
    customer: customer.trim(),
    food: food.name,
    quantity,
    status: "Pending",
  };

  orders.push(order);
  res.status(201).json(order);
});

// UPDATE: Change order status
app.put("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  const allowed = ["Pending", "Preparing", "Delivered", "Cancelled"];

  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ error: "Invalid order status." });
  }

  order.status = req.body.status;
  res.json(order);
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Food Ordering App running on port ${PORT}`);
});
