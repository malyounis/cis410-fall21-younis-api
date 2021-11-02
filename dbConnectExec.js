const sql = require("mssql");

const synnylConfig = require("./config.js");

const config = {
  user: synnylConfig.DB.user,
  password: synnylConfig.DB.password,
  server: synnylConfig.DB.server,
  database: synnylConfig.DB.database,
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
