const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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
  getProductsByCategory,
  getSortedOrdersByReferral,
  modifyOrderPaymentResponse,
  getCategories,
  addCategory,
  deleteCategory,
  updateProduct,
  updateReseller,
  deleteReseller,
  toogleshowhide,
  updateUserProfile,
  updateCommission,
  submitDetails,
  submittedOrders,
  submittedOrders2,
  updateSubmittedOrders,
} = require("./db/db_functions");
const { createTableIfNotExists } = require("./db/Tables/Connections_Tables");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // for form data (application/x-www-form-urlencoded)
app.use(bodyParser.json()); // for JSON data
app.use(cookieParser()); // to parse cookies

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Basic route
app.get("/", (req, res) => {
  console.log("jai shree ram");

  res.send("Jai shree ram");
});

app.post("/registers", async (req, res) => {
  const { name, email, password, phno, referral, address, role } = req.body;
  console.log(req.body);
  let role2 = role !== "" ? role : "user";
  try {
    console.log(name, email, password, phno, referral, address, role2);
    await createUser(name, email, password, phno, referral, address, role2);

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
app.post("/wholesaleAddCart", async (req, res) => {
  const { id, name, quantity, email } = req.body;
  try {
    await insertCart(id, name, 0, quantity, email);
    res.status(200).json({ message: "cart inserted", value: true });
  } catch (e) {
    res.status(500).json({ message: "An error occurred.", error: e.message });
    console.log(e);
  }
});

app.post("/submitDetails", async (req, res) => {
  const { data, email } = req.body;
  try {
    await submitDetails(data, email);
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
        // console.log("see this the final data",data);
        res.status(200).json({ data: data, value: true });
      }
    });
  } catch (e) {
    res.status(500).json({ value: false });

    console.log(e);
  }
});

app.post("/addorder", upload.single("image"), async (req, res) => {
  const { name, price, subprice, description, category, subcategory } =
    req.body;
  const image = req.file.buffer;
  try {
    const response = await addProduct(
      name,
      price,
      subprice,
      image,
      description,
      category,
      subcategory
    );
    // console.log(response);
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

app.post("/getProductsByCategory", async (req, res) => {
  const { category } = req.body;
  try {
    const response = await getProductsByCategory(category);
    if (response.length > 0) {
      res.status(201).json({
        message: "the category: " + category + " data has been retrived",
        value: true,
        data: response,
      });
    } else {
      console.log("there is no data in the table");
      res.status(200).json({
        message: "record is not stored successful",
        value: true,
        data: [],
      });
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
  const { email, name, quantity, index } = req.body;
  console.log(email, " ", name, " ", quantity);
  const response = await removeCartItem(email, name, quantity, index);
  // console.log(response);
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
  console.log("entered");

  const { data, email, coupon, amount } = req.body;
  console.log(req.body);
  try {
    let handle = await placeOrderList(data, email, coupon, amount);
    if (handle) {
      res.status(200).json({
        message: "orders are placed",
        value: true,
        paymentUrl: handle,
      });
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
  // console.log("entered");
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
  // console.log(email, " ", orderId);

  try {
    const filePath = await generateUserOrderHistoryPDF(email, orderId);
    console.log(filePath);

    if (filePath) {
      res.download(filePath, `${email}_order_${orderId}_invoice.pdf`, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Internal Server Error");
        } else {
          console.log("File sent /downoaded successfully.");
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

app.post("/viewInvoice", async (req, res) => {
  const { email, ordersId } = req.body; // Include orderId in the request body
  console.log(email, " ", ordersId);

  try {
    const filePath = await generateUserOrderHistoryPDF(email, ordersId);
    console.log(filePath);

    if (filePath) {
      res.sendFile(
        filePath,
        `${email}_order_${ordersId}_invoice.pdf`,
        (err) => {
          if (err) {
            console.error("Error sending file:", err);
            res.status(500).send("Internal Server Error");
          } else {
            console.log("File sent /downoaded successfully.");
          }
        }
      );
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
      res.status(404).json({
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

app.post("/getSortedOrdersByReferral", async (req, res) => {
  const { referralName, sortBy } = req.body;

  try {
    const sortedOrders = await getSortedOrdersByReferral(referralName, sortBy);
    res.json({ success: true, data: sortedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/payment-response", async (req, res) => {
  console.log(req.body);
  const allRequestData = {
    ...req.query, // Get parameters from the query string (equivalent to $_GET)
    ...req.body, // Get data from the request body (equivalent to $_POST)
    ...req.cookies, // Get data from cookies (equivalent to $_COOKIE)
  };

  // const resultss = allRequestData.ResponseCode;
  // console.log(resultss);
  if (allRequestData["Response Code"] === "E000") {
    const response = await modifyOrderPaymentResponse(allRequestData); //we can use it for the payment or request id updation

    res.redirect("https://farm2kitchen.co.in/successpage");
  } else {
    console.log(allRequestData["Response Code"]);
    res.redirect("https://farm2kitchen.co.in/errorpage");
  }
});

app.get("/categories", async (req, res) => {
  try {
    const response = await getCategories();
    if (!response) {
      res.status(500).json({ message: "no category found", value: false });
    }
    res.status(200).json({ message: "here is the data", category: response });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: "no category found", value: false });
  }
});

app.post("/addCategories", async (req, res) => {
  const { category, subcategory } = req.body;
  try {
    const response = await addCategory(category, subcategory);
    res.status(201).json({
      message: "category and sub category  is successfully registered",
      value: true,
      category: response.category,
      subcategory: response.subcategory,
    });
  } catch (e) {
    console.log(e.message);
    res
      .status(500)
      .json({ message: "record is not stored successful", value: false });
  }
});

app.delete("/deleteCategory", async (req, res) => {
  const { name, type } = req.body;
  try {
    const response = await deleteCategory(name, type);
    res.status(201).json({
      message: "successfully deleted",
      value: true,
      category: response,
    });
  } catch (e) {
    console.log(e.message);
    res
      .status(500)
      .json({ message: "record is not stored successful", value: false });
  }
});

app.post("/updateProduct", async (req, res) => {
  const { data } = req.body;
  console.log(data);
  const { name, description, price, subprice, category, subcategory, name2 } =
    data;

  console.log(name, description, price, subprice, category, subcategory, name2);

  try {
    const response = await updateProduct(
      name,
      description,
      price,
      subprice,
      category,
      subcategory,
      name2
    );
    if (response) {
      res.status(201).json({
        message: "successfully deleted",
        value: true,
      });
    } else {
      res
        .status(500)
        .json({ message: "record is not updated successful", value: false });
    }
  } catch (e) {
    console.log(e.message);
    res
      .status(500)
      .json({ message: "record is not updated successful", value: false });
  }
});
app.post("/updateReseller", async (req, res) => {
  const { name, id } = req.body;

  console.log(name, id);

  try {
    const response = await updateReseller(name, id);
    if (response) {
      res.status(201).json({
        message: "successfully updated",
        value: true,
      });
    } else {
      res
        .status(500)
        .json({ message: "record is not updated successful", value: false });
    }
  } catch (e) {
    console.log(e.message);
    res
      .status(500)
      .json({ message: "record is not updated successful", value: false });
  }
});
app.post("/deleteReseller", async (req, res) => {
  const { data } = req.body;
  try {
    const response = await deleteReseller(data);
    if (response) {
      res.status(201).json({
        message: "successfully deleted",
        value: true,
      });
    } else {
      res
        .status(500)
        .json({ message: "record is not deleted successful", value: false });
    }
  } catch (e) {
    console.log(e.message);
    res
      .status(500)
      .json({ message: "record is not deleted successful", value: false });
  }
});
//get resllers orders
app.post("/getOrdersByReferral", async (req, res) => {
  console.log("Fetching orders by referral name...");
  const { referralName } = req.body;

  try {
    const response = await getOrdersByReferral(referralName);
    if (response.length > 0) {
      res
        .status(200)
        .json({ message: "Commissions found", value: true, data: response });
    } else {
      res.status(404).json({
        message: "No Commissions found with this referral name",
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
app.post("/updateResellersCommission", async (req, res) => {
  const { commission_credited_amount, orderId } = req.body;
  try {
    const response = await updateCommission(
      commission_credited_amount,
      orderId
    );
    if (response) {
      res.status(200).json({
        message: "successfully updated",
        value: true,
      });
    } else {
      res
        .status(500)
        .json({ message: "record is not updated successful", value: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "record is not updated successful", value: false });

    console.log(error.message);
  }
});

app.post("/updatevisibility", async (req, res) => {
  const { name, type, value } = req.body;
  try {
    const response = await toogleshowhide(name, type, value);
    if (response) {
      res.status(200).json({ value: true });
    } else {
      res.status(500).json({ value: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ value: false });
  }
});

app.post("/updateUserDetails", async (req, res) => {
  const {
    email,
    address,
    bank_details,
    district,
    state,
    pincode,
    city,
    landmark,
  } = req.body;

  try {
    const response = await updateUserProfile(
      email,
      address,
      bank_details,
      district,
      state,
      pincode,
      city,
      landmark
    );
    if (response) {
      res.status(201).send({ value: true });
    } else {
      res.status(500).json({ value: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ value: false });
  }
});

app.post("/submittedOrders", async (req, res) => {
  const { email } = req.body;
  console.log("Fetching orders of wholesale", email);

  try {
    const response = await submittedOrders(email);
    if (response.length > 0) {
      res.status(200).json({ value: true, data: response });
    } else {
      res.status(500).json({ value: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ value: false });
  }
});
app.get("/submittedOrders2", async (req, res) => {
  try {
    const response = await submittedOrders2();
    if (response.length > 0) {
      res.status(200).json({ value: true, data: response });
    } else {
      res.status(200).json({ value: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(200).json({ value: false });
  }
});
app.post("/updateSubmittedOrders", async (req, res) => {
  const { status, id } = req.body;
  try {
    const response = await updateSubmittedOrders(status, id);
    if (response) {
      res.status(200).json({ value: true });
    } else {
      res.status(500).json({ value: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ value: false });
  }
});
// app.get("/getResellersCommission",async (req,res)=>{
//   const {}
// })

// Start the server
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await createTableIfNotExists();
});
