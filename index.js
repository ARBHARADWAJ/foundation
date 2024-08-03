const express = require("express");
const app = express();
const port = 3001; // You can change this port to your desired value
const {
  createUser,
  getUser,
  insertCart,
  getCart,
  getUserByEmail,
  removeCartItem,
  placeOrderList,
  removeProduct,
  OrdersList,
  SinglesOrdersList,
  checkCoupon,
  generateUserOrderHistoryPDF,
} = require("./db/db_functions");
const {
  addProduct,
  createTableIfNotExists,
  getAllProducts,
} = require("./db/admin");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");

app.use(express.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
var productslist = "";
// Basic route
app.get("/", (req, res) => {
  res.send("Jai shree ram");
});

app.post("/registers", async (req, res) => {
  const { name, email, password, phno } = req.body;
  console.log(req.body);
  try {
    console.log(name, email, password, phno);
    await createUser(name, email, password, phno);

    res.status(200).json({
      message: "User registered",
      val1: true,
      data: email,
      phno: phno,
    });
  } catch (e) {
    res.status(500).json({ message: "An error occurred.", error: e.message });
    console.log(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    await getUser(email, password, (err, user) => {
      if (err) {
        res.status(401).json({ message: "Invalid email or password." });
        console.log(err);
      } else {
        let valid = user;
        console.log("this is at the inde file please check", valid);
        res.status(200).json({
          message: "Login successful!",
          data: valid,
          val1: true,
          role: valid.role,
        });
      }
    });
  } catch (e) {
    res.status(500).json({ message: "An error occurred.", error: e.message });
    console.log(e);
  }
});

app.post("/cart", async (req, res) => {
  const { id, name, price, quantity, email } = req.body;
  // const image = req.file.buffer;
  console.log(id, name, price, quantity, email);
  try {
    await insertCart(id, name, price, quantity, email);
    res.status(200).json({ message: "cart inserted", value: true });
  } catch (e) {
    res.status(500).json({ message: "An error occurred.", error: e.message });
    console.log(e);
  }
});

app.post("/cartlist", async (req, res) => {
  console.log("cartlist");
  const { email } = req.body;
  console.log(req.body);
  try {
    await getCart(email, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.status(200).json({ data: data, value: true });
      }
    });
  } catch (e) {
    res.status(500).json({ value: false });

    console.log(e);
  }
});

app.post("/addorder", upload.single("image"), async (req, res) => {
  const { name, price, description } = req.body;
  const image = req.file.buffer;
  try {
    const response = await addProduct(name, price, image, description);
    console.log(response);
    if (response.rows.length > 0) {
      res.status(201).json({
        message: "Object is successfully registered",
        value: true,
        data: response,
      });
    } else {
      console.log("there is no data in the table");
      res
        .status(500)
        .json({ message: "record is not stored successful", value: false });
    }
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "record is not stored successful", value: false });
  }
});
app.get("/getAllProducts", async (req, res) => {
  try {
    const response = await getAllProducts();
    if (response.length > 0) {
      res.status(201).json({
        message: "Object is successfully registered",
        value: true,
        data: response,
      });
    } else {
      console.log("there is no data in the table");
      res
        .status(500)
        .json({ message: "record is not stored successful", value: false });
    }
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "record is not stored successful", value: false });
  }
});

app.post("/getUser", async (req, res) => {
  console.log("get users");
  const { email } = req.body;
  try {
    const response = await getUserByEmail(email);
    console.log(response);
    res
      .status(200)
      .json({ message: "user found", data: response, value: true });
  } catch (e) {
    res.status(401).json({ message: "Invalid email or password." });

    console.log(e);
  }
});

app.post("/removeCartItem", async (req, res) => {
  console.log("thii is delted");
  const { email, name } = req.body;
  console.log(email, " ", name);
  const response = await removeCartItem(email, name);
  console.log(response);
  console.log("deleted");
  if (response) {
    res.status(200).json({ message: "remvved from cart", value: true });
  } else {
    res
      .status(500)
      .json({ message: "record is not stored successful", value: false });
  }
});

app.post("/placeOrder", async (req, res) => {
  const { product_id, price, quantity, email } = req.body;
});
app.post("/placeOrderList", async (req, res) => {
  const { data, email, coupon } = req.body;
  console.log(req.body);
  try {
    let handle = await placeOrderList(data, email, coupon);
    if (handle) {
      res.status(200).json({ message: "orders are placed", value: true });
    } else {
      res.status(500).json({ message: "there is some problem", value: false });
    }
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/removeProduct", async (req, res) => {
  const { data } = req.body;
  try {
    let handle = await removeProduct(data);
    if (handle) {
      res.status(200).json({ message: "orders are placed", value: true });
    } else {
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/ordersList", async (req, res) => {
  console.log("entered");
  try {
    const response = await OrdersList();
    if (response) {
      res.status(200).json({ message: "orders ", value: true, data: response });
    }
  } catch (e) {
    res.status(500).json({ message: "there is some problem", value: false });
    console.log(e.message);
  }
});
app.post("/singleordersList", async (req, res) => {
  console.log("entered");
  const { email } = req.body;
  try {
    const response = await SinglesOrdersList(email);
    if (response) {
      res.status(200).json({ message: "orders ", value: true, data: response });
    }
  } catch (e) {
    res.status(500).json({ message: "there is some problem", value: false });
    console.log(e.message);
  }
});
app.post("/checkCoupon", async (req, res) => {
  const { coupon } = req.body;
  try {
    const response = await checkCoupon(coupon);
    if (response.value) {
      res
        .status(200)
        .json({ message: "valid coupon", value: true, data: response.data });
    } else {
      res.status(500).json({ message: "invalid coupon", value: false });
    }
  } catch (error) {
    res.status(500).json({ message: "problem with connection ", value: false });

    console.log(error.message);
  }
});

app.post("/generateInvoice", async (req, res) => {
  const { email, orderId } = req.body;  // Include orderId in the request body
  try {
    const filePath = await generateUserOrderHistoryPDF(email, orderId);
    if (filePath) {
      res.download(filePath, `${email}_order_${orderId}_invoice.pdf`, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Internal Server Error");
        } else {
          console.log("File sent successfully.");
        }
      });
    } else {
      res.status(404).json({ message: "No orders found for the user." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error generating invoice", error: error.message });
  }
});



// Start the server
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await createTableIfNotExists();
});
