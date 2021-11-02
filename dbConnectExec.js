const sql = require("mssql");

const config = {
  user: "csu",
  password: "Uuxwp7Mcxo7Khy",
  server: "cobazsqlcis410.database.windows.net", // You can use 'localhost\\instance' to connect to named instance
  database: "synnyl",
};

async function executeQuery(aQuery) {
  let connection = await sql.connect(config);
  let result = await connection.query(aQuery);

  //console.log(result);
  return result.recordset;
}

// executeQuery(`SELECT *
// FROM Product
// LEFT JOIN ProductType
// ON ProductType.ProductTypePK = Product.ProductTypePK`);

module.exports = { executeQuery: executeQuery };
