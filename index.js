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
  getReferalData,
  insertIntoReferralTable,
  // updateReferralStatus,
  // getReferralStatusByEmail,
  getOrdersByReferee,
  addReseller,
  getUsersByReferral,
  getOrdersByReferral,
  addProduct,
  getAllProducts,

} = require("./db/db_functions");
const {createTableIfNotExists}=require("./db/Tables/Connections_Tables")
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");

app.use(express.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Basic route
app.get("/", (req, res) => {
  res.send("Jai shree ram");
});

app.post("/registers", async (req, res) => {
  const { name, email, password, phno, referral, address } = req.body;
  console.log(req.body);
  const role = "user";
  try {
    console.log(name, email, password, phno, referral, address, role);
    await createUser(name, email, password, phno, referral, address, role);

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
      } else if (!user) {
        // Handle case where no user is found
        res.status(404).json({
          message: "No user found with the given email and password.",
        });
      } else {
        // Proceed if user is found
        console.log("this is at the index file please check", user);
        res.status(200).json({
          message: "Login successful!",
          data: user,
          val1: true,
          role: user.role,
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
  const { name, price, description, category } = req.body;
  const image = req.file.buffer;
  try {
    const response = await addProduct(
      name,
      price,
      image,
      description,
      category
    );
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
  const { email, orderId } = req.body; // Include orderId in the request body
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
    res
      .status(500)
      .json({ message: "Error generating invoice", error: error.message });
  }
});

app.get("/referalData", async (req, res) => {
  console.log("referral data");

  try {
    const response = await getReferalData();
    console.log(response);

    if (response.length > 0) {
      res.status(201).json({
        message: "the referal list is here",
        value: true,
        data: response,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating invoice", error: error.message });
    console.log(error.message);
  }
});

app.post("/applyReferral", async (req, res) => {
  console.log("apply referral");
  console.log(req.body);

  const { name, email, phno } = req.body;
  const response = await insertIntoReferralTable(name, email, phno);
  try {
    if (response) {
      res.status(201).json({
        message: "the referal list not found",
        value: true,
      });
    }
  } catch (e) {
    console.log(e.message);
  }
});

// app.post("/processStatus", async (req, res) => {
//   console.log("processStatus");
//   try {
//     const { email, newStatus } = req.body;
//     console.log("referal update");

//     console.log(email, " --", newStatus);

//     const response = await updateReferralStatus(email, newStatus);
//     res.status(201).json({ value: true, status: "updated" });
//   } catch (e) {
//     console.log(e);
//   }
// });

// getReferralStatusByEmail,
// getOrdersByReferee

// getReferrals
app.post("/getReferrals", async (req, res) => {
  console.log("get the rederals rable");
  const { name } = req.body;
  try {
    // const response=await getOrdersByReferee();
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/addReseller", async (req, res) => {
  const { data } = req.body;
  try {
    // console.log(data);
    
    const { name, email, phno, password, address, role } = data;
    
    
    await createUser(name, email, password, phno, "", address, role);
    await insertIntoReferralTable(name, email, phno);

    res.status(200).json({
      message: "reseller registered",
      val1: true,
      data: email,
      phno: phno,
    });
  } catch (e) {
    res.status(500).json({ message: "An error occurred.", error: e.message });
    console.log(e);
  }
});



app.post("/getUsersByReferral", async (req, res) => {
  console.log("Fetching users by referral name...");
  const { referralName } = req.body;

  try {
    const response = await getUsersByReferral(referralName);
    if (response.length > 0) {
      res
        .status(200)
        .json({ message: "Users found", value: true, data: response });
    } else {
      res
        .status(404)
        .json({
          message: "No users found with this referral name",
          value: false,
        });
    }
  } catch (e) {
    res
      .status(500)
      .json({ message: "There was a problem retrieving users", value: false });
    console.error(e.message);
  }
});



app.post("/getOrdersByReferral", async (req, res) => {
  console.log("Fetching orders by referral name...");
  const { referralName } = req.body;

  try {
    const response = await getOrdersByReferral(referralName);
    if (response.length > 0) {
      res
        .status(200)
        .json({ message: "Orders found", value: true, data: response });
    } else {
      res
        .status(404)
        .json({
          message: "No orders found with this referral name",
          value: false,
        });
    }
  } catch (e) {
    res
      .status(500)
      .json({ message: "There was a problem retrieving orders", value: false });
    console.error(e.message);
  }
});



// Start the server
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await createTableIfNotExists();
});
