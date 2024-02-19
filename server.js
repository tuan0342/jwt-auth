import express from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(morgan("common"));

const books = [
  {
    id: 1,
    title: "Book 1",
    author: "Author 1",
  },
  {
    id: 2,
    title: "Book 2",
    author: "Author 2",
  },
];

app.get("/books", authenToken, (req, res) => {
  res.json({ status: "success", data: books });
});

function authenToken(req, res, next) {
  const authorizationHeader = req.headers["authorization"];
  // Header: 'Beaer [token]'
  const token = authorizationHeader.split(" ")[1];
  if (!token) res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) res.sendStatus(403);
    next();
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
