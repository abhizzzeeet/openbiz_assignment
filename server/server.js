// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { Pool } = require("pg");

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // PostgreSQL connection pool
// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "openbiz_assignment",
//   password: "postgres",
//   port: 5432,
// });

// // Create table if not exists
// pool.query(`
//   CREATE TABLE IF NOT EXISTS udyam_forms (
//     aadhaarnumber VARCHAR(12) PRIMARY KEY,
//     aadhaarname TEXT,
//     organisationtype TEXT,
//     pannumber TEXT,
//     panname TEXT,
//     dob TEXT
//   );
// `);

// // Route to handle form submission
// app.post("/submit", async (req, res) => {
//   const { aadhaarNumber, aadhaarName, organisationType, panNumber, panName, dob } = req.body;

//   try {
//     await pool.query(
//       `INSERT INTO udyam_forms (aadhaarnumber, aadhaarname, organisationtype, pannumber, panname, dob)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        ON CONFLICT (aadhaarnumber) DO UPDATE
//        SET aadhaarname = EXCLUDED.aadhaarname,
//            organisationtype = EXCLUDED.organisationtype,
//            pannumber = EXCLUDED.pannumber,
//            panname = EXCLUDED.panname,
//            dob = EXCLUDED.dob;`,
//       [ aadhaarNumber, aadhaarName, organisationType, panNumber, panName, dob ]
//     );
//     res.status(200).json({ message: "Form saved successfully!" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong." });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });


const app = require("./app");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
