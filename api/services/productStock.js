const toSafeNumber = (value) => {
  const number = Number(value);
  if (Number.isFinite(number) && number >= 0) {
    return number;
  }
  return 0;
};

const computeTotalStock = (variants = []) =>
  variants.reduce((total, variant) => total + toSafeNumber(variant.stock), 0);

const buildLegacyFields = (variants = []) => {
  const sizes = new Set();
  const colors = new Set();

  variants.forEach((variant) => {
    if (variant.size !== undefined && variant.size !== null) {
      sizes.add(variant.size);
    }
    if (variant.color !== undefined && variant.color !== null) {
      colors.add(variant.color);
    }
  });

  return { size: Array.from(sizes), colors: Array.from(colors) };
};

const normalizeVariants = (payload = {}, fallbackVariants = []) => {
  const providedVariants = Array.isArray(payload.variants)
    ? payload.variants
    : fallbackVariants;

  let variants = providedVariants;

  if (!variants || variants.length === 0) {
    const colors = Array.isArray(payload.colors) ? payload.colors : [];
    const sizes = Array.isArray(payload.size) ? payload.size : [];

    if (colors.length || sizes.length) {
      const normalizedSizes = sizes.length ? sizes : [undefined];
      const normalizedColors = colors.length ? colors : [undefined];

      variants = normalizedSizes.flatMap((size) =>
        normalizedColors.map((color) => ({ size, color, stock: 0 }))
      );
    }
  }

  variants = (variants || []).map((variant) => ({
    _id: variant._id,
    size: variant.size,
    color: variant.color,
    stock: toSafeNumber(variant.stock),
  }));

  const totalStock = computeTotalStock(variants);
  const legacyFields = buildLegacyFields(variants);

  return {
    ...payload,
    variants,
    totalStock,
    inStock: totalStock > 0,
    ...legacyFields,
  };
};

const filterVariants = (variants = [], { size, color } = {}) =>
  variants.filter((variant) => {
    const sizeMatches = size ? variant.size === size : true;
    const colorMatches = color ? variant.color === color : true;
    return sizeMatches && colorMatches;
  });

const findVariant = (variants = [], { variantId, size, color } = {}) => {
  const index = variants.findIndex((variant) => {
    if (variantId && String(variant._id) === String(variantId)) return true;
    const sizeMatches = size ? variant.size === size : true;
    const colorMatches = color ? variant.color === color : true;
    return sizeMatches && colorMatches;
  });

  return { variant: variants[index], index };
};

const formatProductResponse = (product, filters = {}) => {
  const base = product.toObject ? product.toObject() : { ...product };
  const filteredVariants = filterVariants(base.variants || [], filters);
  const totalStock = computeTotalStock(filteredVariants);
  const legacyFields = buildLegacyFields(filteredVariants);

  return {
    ...base,
    variants: filteredVariants,
    totalStock,
    inStock: totalStock > 0,
    ...legacyFields,
  };
};

module.exports = {
  buildLegacyFields,
  computeTotalStock,
  filterVariants,
  findVariant,
  formatProductResponse,
  normalizeVariants,
  toSafeNumber,
};
