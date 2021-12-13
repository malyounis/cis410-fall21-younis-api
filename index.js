const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("./dbConnectExec.js");
const jwt = require("jsonwebtoken");
const synnylConfig = require("./config.js");
const auth = require("./middleware/authenticate");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});

app.get("/hi", (req, res) => {
  res.send("hello world");
});

app.get("/", (req, res) => {
  res.send("API is running");
});

app.post("/contact/logout", auth, (req, res) => {
  let query = `UPDATE Contact 
  SET Token = NULL
  WHERE ContactPK = ${req.contact.ContactPK}`;

  db.executeQuery(query)
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get("/contactpref/me", auth, async (req, res) => {
  //get contactPK
  let query = `SELECT ContactPreferencesPK, ContactPreferences.Color, Storage, ScreenSize, ProductFK, Price
  FROM ContactPreferences
  LEFT JOIN Product
  ON Product.ProductPK = ContactPreferences.ProductFK
  WHERE ContactFK = ${req.contact.ContactPK}
  `;
  //query database for their records
  //db.executeQuery(query)
  try {
    let queryResponse = await db.executeQuery(query);
    res.status(200).send(queryResponse);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
  //send reviews back to them
});

app.post("/contactpref", auth, async (req, res) => {
  try {
    let productFK = req.body.productFK;
    let color = req.body.color;
    let storage = req.body.storage;
    let screenSize = req.body.screenSize;

    if (
      !productFK ||
      !color ||
      !storage ||
      !Number.isInteger(storage) ||
      !screenSize ||
      !Number.isInteger(screenSize)
    ) {
      return res.status(400).send("Bad Request");
    }
    color = color.replace("'", "''");

    let insertQuery = `INSERT INTO ContactPreferences(Color, Storage, ScreenSize, ContactFK, ProductFK)
    OUTPUT inserted.ContactPreferencesPK, inserted.Color, inserted.Storage, inserted.ScreenSize, inserted.ProductFk
    VALUES('${color}', '${storage}', '${screenSize}', '${req.contact.ContactPK}', '${productFK}')`;

    let insertedPreference = await db.executeQuery(insertQuery);
    console.log(insertedPreference);
    res.status(201).send(insertedPreference[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.get("/contact/me", auth, (req, res) => {
  res.send(req.contact);
});

app.post("/contact/login", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Bad Request");
  }

  let query = `SELECT * 
  FROM Contact
  WHERE Email = '${email}' `;

  let result;
  try {
    result = await db.executeQuery(query);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }

  if (!result[0]) {
    return res.status(401).send("Invalid user credentials");
  }

  let user = result[0];

  if (!bcrypt.compareSync(password, user.Password)) {
    return res.status(401).send("Invalid user credentials");
  }

  let token = jwt.sign({ pk: user.ContactPK }, synnylConfig.JWT, {
    expiresIn: "60 minutes",
  });

  let setTokenQuery = `Update Contact
  Set token = '${token}'
  WHERE ContactPK = ${user.ContactPK}`;

  try {
    await db.executeQuery(setTokenQuery);
    res.status(200).send({
      token: token,
      user: {
        NameFirst: user.NameFirst,
        NameLast: user.NameLast,
        Email: user.Email,
        ContactPK: user.ContactPK,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.post("/contact", async (req, res) => {
  //res.send("contacts called");

  //console.log(req.body);

  let nameFirst = req.body.nameFirst;
  let nameLast = req.body.nameLast;
  let email = req.body.email;
  let password = req.body.password;

  if (!nameFirst || !nameLast || !email || !password) {
    return res.status(400).send("Bad Request");
  }

  nameFirst = nameFirst.replace("'", "''");
  nameLast = nameLast.replace("'", "''");

  let emailCheckQuery = `SELECT Email
  FROM Contact
  WHERE Email = '${email}'`;

  let existingUser = await db.executeQuery(emailCheckQuery);

  //console.log(existingUser);

  if (existingUser[0]) {
    return res.status(409).send("Duplicate email");
  }

  let hashedPassword = bcrypt.hashSync(password);

  let insertQuery = `INSERT INTO Contact(NameFirst, NameLast, Email, Password)
  VALUES('${nameFirst}', '${nameLast}', '${email}', '${hashedPassword}')`;
  db.executeQuery(insertQuery)
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get("/product", (req, res) => {
  //get data from database
  db.executeQuery(
    `SELECT *
  FROM Product
  LEFT JOIN ProductType
  ON ProductType.ProductTypePK = Product.ProductTypePK`
  )
    .then((theResults) => {
      res.status(200).send(theResults);
    })
    .catch((myError) => {
      console.log(myError);
      res.status(500).send();
    });
});

app.get("/product/:pk", (req, res) => {
  let pk = req.params.pk;
  let myQuery = `SELECT Product.ProductPK, ProductType.ProductTypePK, Product.Price, Product.Color, ProductType.Storage, ProductType.ScreenSize
  FROM Product
  LEFT JOIN ProductType
  ON ProductType.ProductTypePK = Product.ProductTypePK
  WHERE ProductPk = ${pk};`;

  db.executeQuery(myQuery)
    .then((result) => {
      //console.log(result);
      if (result[0]) {
        res.send(result[0]);
      } else {
        res.status(404).send(`Bad Request`);
      }
    })
    .catch((error) => {
      console.log(err);
      res.status(500).send();
    });
});
