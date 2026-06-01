const Product = require("../models/Product");
const { computeTotalStock, findVariant } = require("./productStock");

const mapProductsById = (products = []) =>
  products.reduce(
    (acc, product) => ({ ...acc, [product._id.toString()]: product }),
    {}
  );

const deductStockForOrder = async (order) => {
  const productIds = order.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productsMap = mapProductsById(products);

  const updatedProducts = [];

  order.items.forEach((item) => {
    const product = productsMap[String(item.productId)];
    if (!product) return;

    const { variant, index } = findVariant(product.variants || [], {
      size: item.size,
      color: item.color,
    });

    if (variant === undefined || index === undefined || index < 0) return;

    const currentStock = Number(variant.stock ?? 0);
    const nextStock = Math.max(0, currentStock - Number(item.quantity || 0));
    product.variants[index].stock = nextStock;
    product.totalStock = computeTotalStock(product.variants || []);
    product.inStock = product.totalStock > 0;
    updatedProducts.push(product.save());
  });

  await Promise.all(updatedProducts);
};

module.exports = { deductStockForOrder };
