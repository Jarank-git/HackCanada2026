import "dotenv/config";
import express from "express";
import cors from "cors";
import petsRouter from "./routes/pets.js";
import tagHeroRouter from "./routes/tag-hero.js";
import captionRouter from "./routes/caption.js";
import photoTipsRouter from "./routes/photo-tips.js";
import platformCaptionsRouter from "./routes/platform-captions.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/pets", petsRouter);
app.use("/api/tag-hero", tagHeroRouter);
app.use("/api/caption", captionRouter);
app.use("/api/photo-tips", photoTipsRouter);
app.use("/api/platform-captions", platformCaptionsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
