const express = require("express");
const fs = require("fs");
const router = express.Router();

router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  const db = JSON.parse(fs.readFileSync("db.json"));

  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stock === 0 || quantity > product.stock)
    return res.status(400).json({ message: "Insufficient stock" });

  product.stock -= quantity;

  const order = {
    id: Date.now(),
    productId,
    quantity,
    totalAmount: product.price * quantity,
    status: "placed",
    createdAt: new Date().toISOString().split("T")[0]
  };

  db.orders.push(order);
  fs.writeFileSync("db.json", JSON.stringify(db));
  res.status(201).json(order);
});

router.get("/", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json"));
  res.json(db.orders);
});

router.delete("/:orderId", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json"));
  const order = db.orders.find(o => o.id == req.params.orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const today = new Date().toISOString().split("T")[0];
  if (order.status === "cancelled" || order.createdAt !== today)
    return res.status(400).json({ message: "Cannot cancel order" });

  order.status = "cancelled";
  const product = db.products.find(p => p.id === order.productId);
  product.stock += order.quantity;

  fs.writeFileSync("db.json", JSON.stringify(db));
  res.json(order);
});

router.patch("/change-status/:orderId", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json"));
  const order = db.orders.find(o => o.id == req.params.orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const flow = ["placed", "shipped", "delivered"];
  const index = flow.indexOf(order.status);

  if (order.status === "cancelled" || order.status === "delivered")
    return res.status(400).json({ message: "Invalid status change" });

  order.status = flow[index + 1];
  fs.writeFileSync("db.json", JSON.stringify(db));
  res.json(order);
});

module.exports = router;