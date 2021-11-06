const jwt = require("jsonwebtoken");
const synnylConfig = require("../config.js");
const db = require("../dbConnectExec.js");

const auth = async (req, res, next) => {
  //   console.log(req.header("Authorization"));
  //   next();
  try {
    let myToken = req.header("Authorization").replace("Bearer ", "");

    let decoded = jwt.verify(myToken, synnylConfig.JWT);
    let contactPK = decoded.pk;

    let query = `SELECT ContactPK, NameFirst, NameLast, Email
    FROM Contact
    WHERE ContactPK = ${contactPK} and token ='${myToken}'`;

    let returnedUser = await db.executeQuery(query);
    //console.log(returnedUser);

    if (returnedUser[0]) {
      req.contact = returnedUser[0];
      next();
    } else {
      return res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    return res.status(401).send("Invalid credentials");
  }
};

module.exports = auth;
