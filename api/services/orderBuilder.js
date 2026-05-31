const { findVariant } = require("./productStock");

const buildOrderPayload = (items = [], productsMap = {}) => {
  let subtotal = 0;
  const normalizedItems = items.map((item) => {
    const product = productsMap[String(item.productId)];
    if (!product) {
      throw new Error(`Producto no encontrado: ${item.productId}`);
    }

    const { variant } = findVariant(product.variants || [], {
      size: item.size,
      color: item.color,
    });

    if (!variant) {
      throw new Error(
        `Variante no disponible para el producto ${item.productId}`
      );
    }

    const stock = Number(variant.stock ?? 0);

    if (stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para ${item.productId} (${item.size || ""}/${
          item.color || ""
        })`
      );
    }

    const price = product.price;
    const quantity = Number(item.quantity) || 0;

    if (quantity <= 0) {
      throw new Error("La cantidad debe ser mayor a cero");
    }
    subtotal += price * quantity;

    return {
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity,
      price,
      title: product.title,
    };
  });

  return { items: normalizedItems, subtotal };
};

module.exports = { buildOrderPayload };
