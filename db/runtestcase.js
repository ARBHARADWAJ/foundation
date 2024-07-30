const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://ecommers_sp9k_user:3JLXnxTTjU9WC5w1rBM9yeEeDo8E2YLi@dpg-cqckdt56l47c73d6lemg-a.oregon-postgres.render.com/ecommers_sp9k",
  ssl: {
    rejectUnauthorized: false,
  },
});

const query = `select `;

pool.query(query, (err, results) => {
  if (err) {
    console.error("query failed", err);
    return;
  }
  console.log(results.rows);
//   console.log(result);
  console.log("query successfully.");
});


//the cmdswhich executed
//ALTER TABLE users ADD COLUMN role VARCHAR(255);
//UPDATE users SET role = 'admin' WHERE email = 'arbharadwaj120@gmail.com';
//ALTER TABLE orders
// ALTER COLUMN quantity TYPE DECIMAL USING quantity::DECIMAL;
//ALTER TABLE orders ALTER COLUMN quantity TYPE DECIMAL USING quantity::DECIMAL;
//  ALTER TABLE products ADD COLUMN description VARCHAR(255);
