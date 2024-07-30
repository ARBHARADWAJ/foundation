const { Pool } = require("pg");

// Configure the PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    "postgresql://ecommers_sp9k_user:3JLXnxTTjU9WC5w1rBM9yeEeDo8E2YLi@dpg-cqckdt56l47c73d6lemg-a.oregon-postgres.render.com/ecommers_sp9k",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Create the 'users' table if it does not exist
// Create the 'users' table if it does not exist

// Drop the 'users' table if it exists
// const dropTableQuery = "DROP TABLE IF EXISTS users;";

// pool.query(dropTableQuery, (err, results) => {
//   if (err) {
//     console.error("Error dropping table:", err);
//     return;
//   }
//   console.log("Users table dropped successfully.");
// });
// Create the 'users' table

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    orders JSON,
    phno VARCHAR(15),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    whtlst JSON,
    role VARCHAR(255) NOT NULL
    );
    `;
pool.query(createTableQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  // console.log(results);
  console.log("Users table created successfully.");
});
const createOrdersQuery = `
  CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  product_id INT NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

    `;
pool.query(createOrdersQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  // console.log(results);
  console.log("orders  table created successfully.");
});

async function createUser(name, email, password, phno) {
  const orders = [{}];
  const whtlst = [{}];
  try {
    const query = `
      INSERT INTO users (name, email, password, orders, whtlst,role,phno)
      VALUES ($1, $2, $3, $4, $5,$6,$7) RETURNING id;
    `;
    const values = [
      name,
      email,
      password,
      JSON.stringify(orders),
      JSON.stringify(whtlst),
      "user",
      phno + "",
    ];
    const result = await pool.query(query, values);
    console.log("User added successfully:", result.rows[0].id);
  } catch (err) {
    console.error("Error inserting user:", err);
  }
}
// async function createUsers(name, email, phno, selectedOptions) {
//   try {
//     const query = `
//       INSERT INTO eventusers (name, email, phno, selected_options)
//       VALUES ($1, $2, $3, $4) RETURNING id;
//     `;
//     const values = [name, email, phno, JSON.stringify(selectedOptions)];
//     const result = await pool.query(query, values);
//     console.log("User added successfully:", result.rows[0].id);
//   } catch (err) {
//     console.error("Error inserting user:", err);
//   }
// }

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

async function removeCartItem(email, name) {
  try {
    console.log("Called to delete the item from wishlist");
    await getJsonArray(email, async (err, jsonArray) => {
      const updatedArray = jsonArray.filter((item) => item.name !== name);
      await updateJsonArray(email, updatedArray, (err, result) => {
        if (err) {
          console.log(err.message);
        }
        console.log("done");
      });
      console.log("Wishlist updated successfully.");
      // return true; // Indicate success
    });
    return true;
  } catch (err) {
    console.error("Error updating wishlist:", err.message);
    return false; // Indicate failure
  }
} ////centralised table for the whislist need to be implemented please maintain that very goodlu please

async function placeOrder(product_id, price, quantity, email) {
  try {
    const query = `
      INSERT INTO orders (price, quantity, product_id, user_email)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [price, quantity, product_id, email];
    const result = await pool.query(query, values);
    console.log("Order placed successfully:", result.rows);
    return true;
  } catch (e) {
    console.error("Error placing order:", e.message);
    return false;
  }
}

// Function to place multiple orders
async function placeOrderList(data, email) {
  console.log("Placing order list:", data);
  for (let product of data) {
    console.log("Processing product:", product);
    let handle = await placeOrder(
      product.id,
      product.price,
      product.quantity,
      email
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
  return true;
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
      SELECT o.id, o.product_id, p.name AS product_name,o.user_email, o.quantity, o.price, p.image
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
};
