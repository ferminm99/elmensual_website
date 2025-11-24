const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const sharp = require("sharp");
const { verifyTokenAndAdmin } = require("./verifyToken");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const PUBLIC_STORAGE_ROOT =
  process.env.PUBLIC_STORAGE_ROOT ||
  path.join(__dirname, "..", "..", "client", "public");

router.post(
  "/product-image",
  verifyTokenAndAdmin,
  upload.single("file"),
  async (req, res) => {
    const { productId, key } = req.body;

    if (!req.file || !productId || !key) {
      return res.status(400).json({
        message: "productId, key y archivo son requeridos",
      });
    }

    try {
      const targetDir = path.join(PUBLIC_STORAGE_ROOT, "products", productId);
      await fs.mkdir(targetDir, { recursive: true });

      const filename = `${key}.webp`;
      const targetPath = path.join(targetDir, filename);

      await sharp(req.file.buffer)
        .resize({ width: 900, height: 1200, fit: "cover" })
        .webp({ quality: 85 })
        .toFile(targetPath);

      const relativePath = `/products/${productId}/${filename}`;
      return res.status(200).json({ path: relativePath });
    } catch (error) {
      console.error("Error guardando imagen de producto", error);
      return res.status(500).json({ message: "No se pudo guardar la imagen" });
    }
  }
);

module.exports = router;
