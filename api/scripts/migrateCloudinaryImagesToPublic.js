const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Product = require("../models/Product");

const mongoURI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI
    : process.env.MONGO_URL;

if (!mongoURI) {
  throw new Error(
    "MongoDB connection string is missing (MONGODB_URI or MONGO_URL)"
  );
}

const dryRun = process.argv.includes("--dry-run");

const buildRelativePath = (productId, key) =>
  `/products/${productId}/${key}.webp`;

const getImageValue = (images, key) => {
  if (!images) return undefined;
  if (images instanceof Map) return images.get(key);
  return images[key];
};

const setImageValue = (images, key, value) => {
  if (images instanceof Map) {
    images.set(key, value);
  } else {
    images[key] = value;
  }
};

const updateImages = (product, productId) => {
  const imagesCollection = product.images || new Map();
  const entries =
    imagesCollection instanceof Map
      ? Array.from(imagesCollection.entries())
      : Object.entries(imagesCollection);

  let changed = false;
  const updatedKeys = [];

  entries.forEach(([key, value]) => {
    if (typeof value !== "string") return;
    if (value.startsWith("/products/")) return;

    const isCloudinary =
      value.includes("res.cloudinary.com") || value.startsWith("http");
    if (!isCloudinary) return;

    const relativePath = buildRelativePath(productId, key);
    setImageValue(imagesCollection, key, relativePath);
    updatedKeys.push({ key, from: value, to: relativePath });
    changed = true;
  });

  product.images = imagesCollection;

  return { changed, updatedKeys };
};

const ensurePrimaryImage = (product, productId) => {
  const currentImg = product.img;
  if (typeof currentImg === "string" && currentImg.startsWith("/products/")) {
    return null;
  }

  const imagesCollection = product.images || new Map();
  const entries =
    imagesCollection instanceof Map
      ? Array.from(imagesCollection.entries())
      : Object.entries(imagesCollection);

  if (!entries.length) return null;

  const preferedKeys = ["img", "principal"];
  let chosen = null;

  for (const key of preferedKeys) {
    const value = getImageValue(imagesCollection, key);
    if (typeof value === "string" && value.startsWith("/products/")) {
      chosen = value;
      break;
    }
  }

  if (!chosen) {
    const [firstKey] = entries.sort((a, b) => a[0].localeCompare(b[0]))[0];
    chosen = buildRelativePath(productId, firstKey);
  }

  if (chosen && chosen !== currentImg) {
    product.img = chosen;
    return { from: currentImg, to: chosen };
  }

  return null;
};

const migrate = async () => {
  await mongoose.connect(mongoURI);
  console.log(`Connected to MongoDB${dryRun ? " (dry-run)" : ""}`);

  const products = await Product.find();
  let updatedCount = 0;
  const examples = [];

  for (const product of products) {
    const productId = product._id?.toString();
    if (!productId) {
      console.warn(`Skipping product without _id: ${product.title}`);
      continue;
    }

    const { changed, updatedKeys } = updateImages(product, productId);
    const primaryChange = ensurePrimaryImage(product, productId);

    if (changed || primaryChange) {
      updatedCount += 1;
      if (examples.length < 5) {
        examples.push({
          title: product.title,
          productId,
          updatedImages: updatedKeys,
          primaryChange,
        });
      }

      if (!dryRun) {
        await product.save();
      }
    }
  }

  console.log(`Products processed: ${products.length}`);
  console.log(`Products updated: ${updatedCount}`);

  if (examples.length) {
    console.log("Examples of updates:");
    examples.forEach((example) => {
      console.log("---");
      console.log(`Title: ${example.title}`);
      console.log(`Product ID: ${example.productId}`);
      if (example.updatedImages.length) {
        console.log("Images:");
        example.updatedImages.forEach(({ key, from, to }) => {
          console.log(`  ${key}: ${from} -> ${to}`);
        });
      }
      if (example.primaryChange) {
        console.log(
          `Primary image: ${example.primaryChange.from} -> ${example.primaryChange.to}`
        );
      }
    });
  }
};

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    mongoose.connection
      .close()
      .then(() => console.log("Mongo connection closed"))
      .catch((err) => console.error("Error closing Mongo connection", err));
  });
