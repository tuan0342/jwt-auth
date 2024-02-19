import express from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 8000;

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(morgan("common"));

// Thực tế refeshTokens được lưu ở db.
let refeshTokens = [];

app.post("/refeshToken", (req, res) => {
  const refeshToken = req.body.token;
  if (!refeshToken) res.sendStatus(401);
  if (!refeshTokens.includes(refeshToken)) res.sendStatus(403); // Forbidden

  jwt.verify(refeshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) res.sendStatus(403);
    const accessToken = jwt.sign(
      { username: data.username }, // ko lấy các giá trị 'iat' và 'exp', chỉ lấy 'username' thêm vô payload
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    res.json({ accessToken });
  });
});

app.post("/login", (req, res) => {
  // Authorization
  const data = req.body;
  const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
  const refeshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET);
  refeshTokens.push(refeshToken);
  res.json({ accessToken, refeshToken });
});

// Khi logout sẽ xóa refresh token do refesh token ko để 'expiresIn'.
// Khi logout client sẽ gửi refesh token lên cho server.
app.post("/logout", (req, res) => {
  const refeshToken = req.body.token; // refresh token được gửi từ client
  refeshTokens = refeshTokens.filter((refToken) => refToken != refeshToken); // lấy những refresh token khác refresh token do client gửi lên
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
