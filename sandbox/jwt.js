const jwt = require("jsonwebtoken");

let myToken = jwt.sign({ pk: 333 }, "secretpw", { expiresIn: "60 minutes" });

console(myToken);
