const { Pool } = require("pg");

const pool = new Pool({
  user: "farm2kitchen",
  host: "localhost",
  database: "foundation_bblf",
  password: "bharadwaj",
  port: 5432, // Default PostgreSQL port
});

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phno VARCHAR(15),
      status BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      whtlst JSON,
      role VARCHAR(255) NOT NULL,
      referral VARCHAR(255),
      address VARCHAR(255),
      bank_details varchar(255),
      district varchar(75),
      state varchar(75),
      pincode int,
      city varchar(75),
      landmark varchar(100)
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
const createQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      category VARCHAR(255) NOT NULL,
      status BOOLEAN DEFAULT TRUE
    );
  `;
pool.query(createQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  // console.log(results);
  console.log("category table created successfully.");
});
const createsubQuery = `
    CREATE TABLE IF NOT EXISTS subcategories (
      id SERIAL PRIMARY KEY,
      subcategory VARCHAR(255) NOT NULL,
      status BOOLEAN DEFAULT TRUE
    );
  `;
pool.query(createsubQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  // console.log(results);
  console.log("subcategory table created successfully.");
});

//..

const createOrdersQuery = `
    CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    ordersid int,
    price DECIMAL(10, 2) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    product_id INT NOT NULL,
    coupon VARCHAR(255),
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    reference_no VARCHAR,
    response JSON,
    status varchar(20)
  );  `;
pool.query(createOrdersQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  // console.log(results);
  console.log("orders  table created successfully.");
});
const createCouponQuery = `
  CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      coupon_name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_day DATE GENERATED ALWAYS AS (created_at::date) STORED,
      value DECIMAL(10, 2) NOT NULL,
      expire_at TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '48 hours') STORED
  ); `;
pool.query(createCouponQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  // console.log(results);
  console.log("coupon table created successfully.");
});

const createCommission = `
    CREATE TABLE IF NOT EXISTS commission (
    id SERIAL PRIMARY KEY,
    orderid int,
    purchase_amount DECIMAL(10, 2) NOT NULL,
    reseller_name varchar(30),
    customer_name varchar(30),
    commission_credited_amount DECIMAL(10, 2),
    commission_granted boolean default false,
    date_of_purchase TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_of_credit TIMESTAMP,
    link varchar default null,
    status varchar default ''
    );  
    `;

// commission_granted DECIMAL(10, 2),
// balance decimal(10,2),
pool.query(createCommission, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  // console.log(results);
  console.log("Commission table created successfully.");
});

const createReferalQuery = `
    CREATE TABLE IF NOT EXISTS referral (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phno VARCHAR(15),
      status VARCHAR(15),
      link  varchar(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `;
// role VARCHAR(255) NOT NULL
pool.query(createReferalQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  // console.log(results);
  console.log("Referral table created successfully.");
});

const createsubitdetailsQuery = `
    CREATE TABLE IF NOT EXISTS sb (
      id SERIAL PRIMARY KEY ,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL ,
      phno VARCHAR(15),
      address VARCHAR(255),
      orderdetails JSON[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status varchar(30) default 'Received',
    );
`;

pool.query(createsubitdetailsQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  console.log("Table created successfully.");
});

async function createTableIfNotExists() {
  try {
    try {
      await pool.query(`
              CREATE TABLE IF NOT EXISTS  products (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              price DECIMAL(10, 2) NOT NULL,
              image BYTEA NOT NULL,
              description VARCHAR(255) ,
              category VARCHAR(255),
              subcategory VARCHAR(255)
              );
            `);
      console.log("Table 'products' created successfully.");
    } finally {
      // client.release();
    }
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

module.exports = { pool, createTableIfNotExists };
