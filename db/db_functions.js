const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const crypto = require("crypto");
const { pool, createTableIfNotExists } = require("./Tables/Connections_Tables");
const { getPaymentUrl } = require("../middleware/payment");
async function createUser(
  name,
  email,
  password,
  phno,
  referral,
  address,
  role
) {
  const whtlst = [];
  try {
    const query = `
      INSERT INTO users (name, email, password, whtlst,role,phno,referral,address)
      VALUES ($1, $2, $3, $4, $5,$6,$7,$8) RETURNING id;
    `;
    const values = [
      name,
      email,
      password,
      JSON.stringify(whtlst),
      role,
      phno + "",
      referral,
      address,
    ];
    const result = await pool.query(query, values);

    console.log("User added successfully:", result.rows[0].id);
  } catch (err) {
    console.error("Error inserting user:", err);
  }
}

async function getUser(email, password, callback) {
  const query = `
    SELECT * FROM users
    WHERE email = $1 AND password = $2;
  `;
  try {
    const result = await pool.query(query, [email, password]);
    if (result.rows.length > 0) {
      console.log("User retrieved successfully:", result.rows[0]);
      callback(null, result.rows[0]);
    } else {
      console.log("No user found with the given email and password.");
      callback(null, null);
    }
  } catch (err) {
    console.error("Error retrieving user:", err);
    callback(err, null);
  }
}

async function getAllProducts() {
  try {
    const query = `SELECT * FROM products`;
    const result = await pool.query(query);

    // Check if any products were found
    if (result.rows.length === 0) {
      console.log("No products found in the 'products' table.");
      return [];
    } else {
      console.log("All products from 'products':");

      const products = result.rows.map((product) => {
        return {
          ...product,
          image: product.image.toString("base64"),
        };
      });

      return products;
    }
  } catch (error) {
    console.error("Error retrieving products:", error);
    return [];
  }
}
async function getProductsByCategory(category) {
  try {
    const query = `SELECT * FROM products WHERE category= $1`;
    const result = await pool.query(query, [category]);

    // Check if any products were found
    if (result.rows.length === 0) {
      console.log("No products found in the 'products' table.");
      return [];
    } else {
      console.log("All products from 'products' with the category is here");

      const products = result.rows.map((product) => {
        return {
          ...product,
          image: product.image.toString("base64"),
        };
      });

      return products;
    }
  } catch (error) {
    console.error("Error retrieving products:", error);
    return [];
  }
}

async function addProduct(
  name,
  price,
  subprice,
  image,
  description,
  category,
  subcategory
) {
  try {
    // const client = await pool.connect();

    try {
      await createTableIfNotExists();

      const query =
        "INSERT INTO products (name, price,subprice, image,description,category,subcategory) VALUES ($1, $2, $3,$4,$5,$6,$7) RETURNING *";

      const result = await pool.query(query, [
        name,
        price,
        subprice,
        image,
        description,
        category,
        subcategory,
      ]);

      console.log("product added successfully:", result.rowCount);

      let re = await getAllProducts();
      return result;
    } finally {
      // client.release();
    }
  } catch (error) {
    console.error("Error inserting user:", error);
  }
}

async function getUserByEmail(email) {
  const query = `
  SELECT * FROM users
  WHERE email = $1;
`;
  try {
    const result = await pool.query(query, [email]);
    if (result.rows.length > 0) {
      console.log("User retrieved successfully:", result.rows[0]);
      return result.rows[0];
    } else {
      console.log("No user found with the given email and password.");
      return null;
    }
  } catch (err) {
    console.error("Error retrieving user:", err);
    return null;
  }
}

const getJsonArray = async (email, callback) => {
  const query = `
    SELECT whtlst FROM users WHERE email = $1;
  `;
  try {
    const result = await pool.query(query, [email]);
    if (result.rows.length > 0) {
      let jsonArray;
      try {
        jsonArray = JSON.parse(result.rows[0].whtlst) || [];
      } catch (e) {
        jsonArray = result.rows[0].whtlst;
      }
      // console.log("Current array:", jsonArray);
      callback(null, jsonArray);
    } else {
      callback(new Error("No data found for the specified email."));
    }
  } catch (err) {
    callback(err);
  }
};

const appendDataToJsonArray = (jsonArray, newData) => {
  jsonArray.push(newData);
  return jsonArray;
};

const updateJsonArray = async (email, updatedJsonArray, callback) => {
  const updatedJsonString = JSON.stringify(updatedJsonArray);
  const query = `
    UPDATE users SET whtlst = $1 WHERE email = $2 RETURNING *;
  `;
  try {
    const result = await pool.query(query, [updatedJsonString, email]);

    callback(null, result);
  } catch (err) {
    callback(err);
  }
};

const insertCart = async (id, name, price, quantity, email) => {
  const newItem = {
    id: id,
    name: name,
    quantity: parseFloat(quantity),
    price: parseInt(price, 10),
  };

  getJsonArray(email, (err, jsonArray) => {
    if (err) {
      return console.error("Error fetching JSON array:", err.message);
    }
    // console.log(jsonArray);
    const updatedJsonArray = appendDataToJsonArray(jsonArray, newItem);
    // console.log(updatedJsonArray);
    updateJsonArray(email, updatedJsonArray, (err, results) => {
      if (err) {
        return console.error("Error updating JSON array:", err.message);
      }
      console.log("JSON array updated successfully:");
    });
  });
};

async function getCart(email, callback) {
  const query = `
    SELECT whtlst FROM users WHERE email = $1;
  `;
  try {
    const result = await pool.query(query, [email]);
    if (result.rows.length > 0) {
      console.log("User retrieved successfully:", result.rows);
      callback(null, result.rows);
    } else {
      console.log("No user found with the given email.");
      callback(null, null);
    }
  } catch (err) {
    console.error("Error retrieving user:", err);
    callback(err, null);
  }
}

async function removeCartItem(email, name, quantity, id) {
  try {
    console.log("Called to delete the item from the wishlist");

    // Fetch the current wishlist JSON array
    await getJsonArray(email, async (err, jsonArray) => {
      if (err) {
        console.error("Error fetching wishlist:", err.message);
        return;
      }
      console.log("jsonarray", jsonArray);

      const updatedArray = jsonArray.filter((item, index) => index !== id);

      await updateJsonArray(email, updatedArray, (err, result) => {
        if (err) {
          console.error("Error updating wishlist:", err.message);
          return;
        }

        console.log("Wishlist updated successfully.");
      });
    });

    return true; // Indicate success
  } catch (err) {
    console.error("Error updating wishlist:", err.message);
    return false; // Indicate failure
  }
}

async function placeOrder(
  product_id,
  price,
  quantity,
  email,
  coupon,
  reference_no,
  response,
  ordersid
) {
  console.log(product_id, price, quantity, email, coupon, response, ordersid);

  try {
    const query = `
      INSERT INTO orders (price, quantity, product_id, user_email,coupon,reference_no,response,ordersid)
      VALUES ($1, $2, $3, $4,$5,$6,$7,$8) RETURNING *;
    `;
    const values = [
      price,
      quantity,
      product_id,
      email,
      coupon,
      reference_no,
      response,
      ordersid,
    ];
    const result = await pool.query(query, values);
    console.log("Order placed successfully:", result.rows);
    return true;
  } catch (e) {
    console.error("Error placing order:", e.message);
    return false;
  }
}
function generateRandomFiveDigitNumber() {
  return Math.floor(10000 + Math.random() * 90000);
}
// Function to place multiple orders
async function placeOrderList(data, email, coupon, amount) {
  let randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
  console.log("Placing order list:", data);

  let url = getPaymentUrl(amount, randomSixDigitNumber);
  console.log(url);
  //need to change its actual problem it need to be done the payent is done

  const orderid = generateRandomFiveDigitNumber();
  console.log(orderid);

  for (let product of data) {
    console.log("Processing product:", product);
    let handle = await placeOrder(
      product.id,
      product.price,
      product.quantity,
      email,
      coupon,
      randomSixDigitNumber + "",
      {},
      orderid
    );
    if (!handle) {
      console.error("Failed to place order for product:", product);
      return false;
    }
  }
  await updateJsonArray(email, [], (err, res) => {
    if (err) {
      console.log(err.message);
    }
  });
  return url;
}

async function modifyOrderPaymentResponse(responsedata) {
  let ReferenceNo = responsedata.ReferenceNo.trim();
  console.log(typeof ReferenceNo);
  const query = `
  UPDATE orders
  SET response = $2
  WHERE reference_no = $1;
  `;
  const result = await pool.query(query, [ReferenceNo, responsedata]);
  console.log("there is the result of payment", result);
  try {
    // console.log("updated the status fo order reference no:", ReferenceNo);
    if (result) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e.message);
    return false;
  }
}

// Function to retrieve orders
async function OrdersList() {
  try {
    const query = `
      SELECT o.id, o.product_id, p.name AS product_name,o.user_email, o.quantity, o.price, p.image
      FROM orders o 
      JOIN products p ON o.product_id = p.id 

      ;
    `;
    const res = await pool.query(query);
    console.log("Retrieved orders:");
    const orders = res.rows.map((order) => {
      return {
        ...order,
        image: order.image.toString("base64"),
      };
    });

    return orders;
  } catch (err) {
    console.error("Error retrieving orders:", err.stack);
    return [];
  }
}
async function SinglesOrdersList(email) {
  try {
    const query = `
      SELECT o.id,o.ordersid, o.product_id, p.name AS product_name,o.user_email, o.quantity, o.price, p.image
      FROM orders o 
      JOIN products p ON o.product_id = p.id 
      where o.user_email=$1
      ;
    `;
    const res = await pool.query(query, [email]);
    console.log("Retrieved orders:");
    const orders = res.rows.map((order) => {
      return {
        ...order,
        image: order.image.toString("base64"),
      };
    });

    return orders;
  } catch (err) {
    console.error("Error retrieving orders:", err.stack);
    return [];
  }
}

async function removeProduct(item) {
  const { name, price } = item;
  console.log(name, price);
  try {
    const query = "DELETE FROM products WHERE name = $1 and price=$2";
    const values = [name, price];

    const res = await pool.query(query, values);
    console.log(`Number of rows deleted: ${res.rowCount}`);
    return true;
  } catch (err) {
    console.error("Error executing query", err.stack);
    return false;
  }
}

async function checkCoupon(couponName) {
  const query = `
    SELECT id, coupon_name, type, created_at, created_day, value, expire_at
    FROM coupons
    WHERE coupon_name = $1;
  `;

  try {
    const res = await pool.query(query, [couponName]);
    if (res.rows.length > 0) {
      return { value: true, data: res.rows[0] }; // Return the first matching record
    } else {
      return { value: false }; // Return false if no matching record is found
    }
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err;
  }
}

async function generateUserOrderHistoryPDF(email, ordersId) {
  const query = `
    SELECT o.id, o.price, o.quantity, o.created_at, o.coupon, p.name, p.description, p.image 
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.user_email = $1 and o.ordersid=$2;
  `;

  try {
    const result = await pool.query(query, [email, ordersId]);
    if (result.rows.length === 0) {
      throw new Error("No orders found for the user.");
    }
    console.log(
      "=========================",
      result.rows.length,
      "========================="
    );

    const doc = new PDFDocument();
    const filePath = path.join(
      __dirname,
      `${email}_${ordersId}_order_history.pdf`
    );

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(25).text("Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(18).text(`User: ${email}`);
    doc.moveDown();

    let totalAmount = 0;
    result.rows.forEach((order, index) => {
      console.log(order.id, "]]", ordersId);
      // if (order.ordersid === ordersId) {
      doc.fontSize(15).text(`Order #${ordersId}`);
      doc.fontSize(12).text(`Product Name: ${order.name}`);
      doc.fontSize(12).text(`Description: ${order.description}`);
      doc.fontSize(12).text(`Price: ₹${order.price}`);
      doc.fontSize(12).text(`Quantity: ${order.quantity}`);
      doc.fontSize(12).text(`Coupon: ${order.coupon || "N/A"}`);
      doc
        .fontSize(12)
        .text(`Date: ${new Date(order.created_at).toLocaleString()}`);
      // if (order.image) {
      //   doc.image(order.image, { width: 100, height: 100 });
      // }
      doc.moveDown();

      totalAmount += parseFloat(order.price) * parseFloat(order.quantity);
      console.log(order);
      // }
    });

    doc.moveDown();
    doc.fontSize(18).text(`Total Amount: ₹${totalAmount}`);
    doc.end();

    return filePath;
  } catch (error) {
    console.error("Error generating invoice:", error.message);
    throw error;
  }
}

async function getReferalData() {
  try {
    const query = "select * from referral";
    const response = await pool.query(query);

    if (response.rows.length === 0) {
      console.log("no referals are there");
      return [];
    } else {
      console.log("the referrals table is here");
      return response.rows;
    }
  } catch (e) {
    console.log(e);
  }
}
async function insertIntoReferralTable(name, email, phno) {
  const status = "accepted";
  const link = `https://farm2kitchen.co.in/?referral=${encodeURIComponent(
    name
  )}`;
  //https://farm2kitchen.co.in/
  const insertReferalQuery = `
    INSERT INTO referral (name, email, phno, status,link )
    VALUES ($1, $2, $3, $4,$5)
    RETURNING *;
  `;
  //link need to be added later by once asking

  pool.query(
    insertReferalQuery,
    [name, email, phno, status, link],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return;
      }
      console.log("Data inserted successfully:", result.rows[0]);
    }
  );
}

// async function updateReferralStatus(email, newStatus) {
//   const updateStatusQuery = `
//     UPDATE referral
//     SET status = $1
//     WHERE email = $2;
//   `;

//   pool.query(updateStatusQuery, [newStatus, email], (err, result) => {
//     if (err) {
//       console.error("Error updating status:", err);
//       return;
//     }
//     console.log("Status updated successfully:", result.rows[0]);
//   });
// }

// async function getReferralStatusByEmail(email) {
//   const getStatusQuery = `
//     SELECT status
//     FROM referral
//     WHERE email = $1;
//   `;

//   try {
//     const result = await pool.query(getStatusQuery, [email]);
//     if (result.rows.length > 0) {
//       return result.rows[0].status;
//     } else {
//       console.log("No referral found with the provided email.");
//       return null;
//     }
//   } catch (err) {
//     console.error("Error retrieving status:", err);
//     return null;
//   }
// }

async function getOrdersByReferee(name) {
  const getOrdersQuery = `
    SELECT *
    FROM orders
    WHERE referee = $1;
  `;

  try {
    const result = await pool.query(getOrdersQuery, [name]);
    if (result.rows.length > 0) {
      return result.rows;
    } else {
      console.log("No orders found for the provided referee.");
      return [];
    }
  } catch (err) {
    console.error("Error retrieving orders:", err);
    return [];
  }
}

async function addReseller(name, email, password, phno, address, role) {
  const whtlst = [{}];
  try {
    const query = `
      INSERT INTO users (name, email, password, whtlst,role,phno,address)
      VALUES ($1, $2, $3, $4, $5,$6,$7) RETURNING id;
    `;
    const values = [
      name,
      email,
      password,
      JSON.stringify(whtlst),
      role,
      phno + "",
      address,
    ];
    const result = await pool.query(query, values);
    console.log("reseller added successfully:", result.rows[0].id);
    return true;
  } catch (err) {
    console.error("Error inserting reseller:", err);
    return false;
  }
}

async function getUsersByReferral(referralName) {
  try {
    const query = `
      SELECT id, name, email, phno, status, created_at, whtlst, role, referral, address
      FROM users
      WHERE referral = $1;
    `;
    const res = await pool.query(query, [referralName]);

    console.log("Retrieved users with referral name:", referralName);
    return res.rows;
  } catch (err) {
    console.error("Error retrieving users by referral:", err.stack);
    return [];
  }
}

async function getOrdersByReferral(referralName) {
  try {
    const query = `
      SELECT  o.price, u.name, o.created_at
      FROM orders o
      JOIN users u ON o.user_email = u.email
      WHERE u.referral = $1;
    `;
    //..
    const res = await pool.query(query, [referralName]);

    console.log("Retrieved orders for referral name:", referralName);
    return res.rows;
  } catch (err) {
    console.error("Error retrieving orders by referral:", err.stack);
    return [];
  }
}
async function getSortedOrdersByReferral(referralName, sortBy) {
  try {
    const validColumns = ["name", "created_at", "price"];
    if (!validColumns.includes(sortBy)) {
      throw new Error("Invalid column name for sorting");
    }

    const query = `
      SELECT o.price, u.name, o.created_at
      FROM orders o
      JOIN users u ON o.user_email = u.email
      WHERE u.referral = $1
      ORDER BY ${sortBy} ASC;
    `;

    const res = await pool.query(query, [referralName]);

    console.log(
      `Retrieved sorted orders by ${sortBy} for referral name:`,
      referralName
    );
    return res.rows;
  } catch (err) {
    console.error("Error retrieving sorted orders by referral:", err.stack);
    return [];
  }
}
async function getCategories() {
  const query1 = "select category from categories";
  const query2 = "select subcategory from subcategories";
  const category = await pool.query(query1);
  const subcategory = await pool.query(query2);
  const response = {};
  if (category.rows.length === 0) {
    // console.log("no categories");
    response.category = [];
  } else {
    response.category = category.rows;
  }
  if (subcategory.rows.length === 0) {
    // console.log("no subcategories");
    response.subcategory = [];
  } else {
    response.subcategory = subcategory.rows;
  }
  return response;
}

async function addCategory(category, subcategory) {
  const query1 = "insert into categories (category) values($1)";
  const query2 = "insert into subcategories (subcategory) values($1)";

  if (category.length > 0) {
    const category2 = await pool.query(query1, [category]);
    console.log(category2);
  } else if (subcategory.length > 0) {
    const subcategory2 = await pool.query(query2, [subcategory]);
    console.log(subcategory2);
  }

  const response = await getCategories();

  return response; // Moved to ensure it returns the response for both category and subcategory
}

async function deleteCategory(name, type) {
  console.log(name, type);

  const queryMap = {
    category: "DELETE FROM categories WHERE category = $1",
    subcategory: "DELETE FROM subcategories WHERE subcategory = $1",
  };
  const query = queryMap[type]; // Select the correct query based on type
  if (!query) {
    console.log("Invalid category type");
    return;
  }
  try {
    const result = await pool.query(query, [name]);
    console.log("Deleted", result.rowCount, "row(s) from", type);
  } catch (e) {
    console.log(e.message);
  }
  const response = await getCategories(); // Fetch updated categories after deletion
  return response;
}
async function updateProduct(
  name,
  description,
  price,
  subprice,
  category,
  subcategory,
  oldName // Renamed from name2 for clarity
) {
  const query =
    "UPDATE products SET name=$1, description=$2, price=$3, subprice=$4, category=$5, subcategory=$6 WHERE name=$7";
  try {
    const response = await pool.query(query, [
      name,
      description,
      price,
      subprice,
      category,
      subcategory,
      oldName, // Use the renamed parameter
    ]);
    console.log("Record has been updated", response.rowCount);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
}
async function updateReseller(name, id) {
  const link = `https://farm2kitchen.co.in/?referral=${encodeURIComponent(
    name
  )}`;
  const query = "UPDATE referral SET name=$1,link=$2 WHERE id=$3";
  try {
    const response = await pool.query(query, [
      name,
      link,
      id, // Use the renamed parameter
    ]);
    console.log("Reseller has been updated", response.rowCount);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
}
async function deleteReseller(id) {
  try {
    const query = "delete  from referral where id=$1";
    const response = await pool.query(query, [id]);
    console.log("Reseller is been deleted", response.rowCount);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
}

module.exports = {
  getCart,
  createUser,
  removeProduct,
  getUser,
  insertCart,
  getUserByEmail,
  removeCartItem,
  placeOrderList,
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
};
