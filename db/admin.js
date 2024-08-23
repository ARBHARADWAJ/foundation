const { Pool } = require("pg");

// Configure the PostgreSQL connection pool
// const pool = new Pool({
//   connectionString:
//     "postgresql://ecommers_sp9k_user:3JLXnxTTjU9WC5w1rBM9yeEeDo8E2YLi@dpg-cqckdt56l47c73d6lemg-a.oregon-postgres.render.com/ecommers_sp9k",
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });
const pool = new Pool({
  user: "farm2kitchen",
  host: "localhost",
  database: "foundation_bblf",
  password: "bharadwaj",
  port: 5432, // Default PostgreSQL port
});


async function createTableIfNotExists() {
  try {
    // const client = await pool.connect();

    try {
      // Check if the table exists

      await pool.query(`
            CREATE TABLE IF NOT EXISTS  products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            image BYTEA NOT NULL,
            description VARCHAR(255) ,
            category VARCHAR(255)
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

      // console.log(products); // Moved this line after defining the 'products' variable
      return products;
    }
  } catch (error) {
    console.error("Error retrieving products:", error);
    return [];
  }
}

async function addProduct(name, price, image, description,category) {
  try {
    // const client = await pool.connect();

    try {
      await createTableIfNotExists();

      const query =
        "INSERT INTO products (name, price, image,description,category) VALUES ($1, $2, $3,$4,$5) RETURNING *";

      const result = await pool.query(query, [name, price, image, description,category]);

      console.log("User added successfully:", result.rowCount);

      let re = await getAllProducts();
      return result;
    } finally {
      // client.release();
    }
  } catch (error) {
    console.error("Error inserting user:", error);
  }
}


module.exports = { addProduct, createTableIfNotExists, getAllProducts };
