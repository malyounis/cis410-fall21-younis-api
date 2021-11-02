const express = require("express");

const db = require("./dbConnectExec.js");

const app = express();
app.use(express.json());

app.listen(5000, () => {
  console.log("app is running on port 5000");
});

app.get("/hi", (req, res) => {
  res.send("hello world");
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// app.post();
// app.put();

app.post("/contact", async (req, res) => {
  //res.send("contacts called");

  //console.log(req.body);

  let nameFirst = req.body.nameFirst;
  let nameLast = req.body.nameLast;
  let email = req.body.email;
  let password = req.body.password;

  let emailCheckQuery = `SELECT Email
  FROM Contact
  WHERE Email = '${email}'`;

  let existingUser = await db.executeQuery(emailCheckQuery);

  //console.log(existingUser);

  if (existingUser[0]) {
    return res.status(409).send("Duplicate email");
  }

  let insertQuery = `INSERT INTO Contact(NameFirst, NameLast, Email, Password)
  VALUES('${nameFirst}', '${nameLast}', '${email}', '${password}')`;
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
  //console.log(pk);
  let myQuery = `SELECT *
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
