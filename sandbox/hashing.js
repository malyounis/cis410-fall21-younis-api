const bcrypt = require("bcryptjs");

let hashedPassword = bcrypt.hashSync("");

let hashTest = bcrypt.compareSync("", hashedPassword);
