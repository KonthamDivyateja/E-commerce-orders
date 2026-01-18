const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const productsRouter = require("./routes/products.routes");
const ordersRouter = require("./routes/orders.routes");
const analyticsRouter = require("./routes/analytics.routes");

app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/analytics", analyticsRouter);

app.listen(3000);