import { Product as ProductType } from "../types";

export type ColorOption = { name: string; available: boolean };

const getColorBase = (color: string) =>
  color.replace(/\d+/g, "").trim().toLowerCase();

const isPrimaryColorName = (color: string) => {
  const match = color.match(/(\d+)/);
  if (!match) return true;
  return match[1] === "1";
};

const getUniqueValues = (values: string[]) => Array.from(new Set(values));

export function getAvailableSizes(currentProduct?: ProductType) {
  if (!currentProduct) return [] as string[];

  if (currentProduct.variants?.length) {
    return getUniqueValues(
      currentProduct.variants
        .filter((variant) => variant.stock > 0)
        .map((variant) => variant.size)
    );
  }

  const hasBaseStock =
    (currentProduct.totalStock ?? (currentProduct.inStock ? 1 : 0)) > 0;

  if (!hasBaseStock) return [] as string[];

  return currentProduct.size || [];
}

export function getPrimaryColorsForSize(
  currentProduct: ProductType | undefined,
  selectedSize: string,
  currentColor?: string
): ColorOption[] {
  if (!currentProduct) return [] as ColorOption[];

  const variantsForSize = currentProduct.variants?.filter(
    (variant) => variant.size === selectedSize
  );

  if (variantsForSize?.length) {
    const baseColorMap = new Map<string, ColorOption>();

    variantsForSize.forEach((variant) => {
      const base = getColorBase(variant.color || "");
      const isPrimary = isPrimaryColorName(variant.color || "");
      const existing = baseColorMap.get(base);

      if (!existing) {
        baseColorMap.set(base, {
          name: variant.color,
          available: (variant.stock || 0) > 0,
        });
        return;
      }

      if (!existing.available && (variant.stock || 0) > 0)
        existing.available = true;

      if (isPrimary) existing.name = variant.color;
    });

    if (
      currentColor &&
      !Array.from(baseColorMap.values()).some(
        (option) => option.name === currentColor
      )
    ) {
      const matchingVariant = variantsForSize.find(
        (variant) => variant.color === currentColor
      );

      if (matchingVariant) {
        baseColorMap.set(getColorBase(currentColor), {
          name: currentColor,
          available: (matchingVariant.stock || 0) > 0,
        });
      }
    }

    return Array.from(baseColorMap.values());
  }

  const colorsFromImages = getUniqueValues(
    Object.keys(currentProduct.images || {}).map((key) =>
      key.replace(/\d+/g, "")
    )
  );

  return colorsFromImages.map((colorName) => ({
    name: colorName,
    available: true,
  }));
}
export function getPrimaryColors(
  currentProduct: ProductType | undefined,
  currentColor?: string
): ColorOption[] {
  if (!currentProduct) return [] as ColorOption[];

  const variantsForProduct = currentProduct.variants;

  if (variantsForProduct?.length) {
    const baseColorMap = new Map<string, ColorOption>();

    variantsForProduct.forEach((variant) => {
      const base = getColorBase(variant.color || "");
      const isPrimary = isPrimaryColorName(variant.color || "");
      const existing = baseColorMap.get(base);

      if (!existing) {
        baseColorMap.set(base, {
          name: variant.color,
          available: (variant.stock || 0) > 0,
        });
        return;
      }

      if (!existing.available && (variant.stock || 0) > 0)
        existing.available = true;

      if (isPrimary) existing.name = variant.color;
    });

    if (
      currentColor &&
      !Array.from(baseColorMap.values()).some(
        (option) => option.name === currentColor
      )
    ) {
      const matchingVariant = variantsForProduct.find(
        (variant) => variant.color === currentColor
      );

      if (matchingVariant) {
        baseColorMap.set(getColorBase(currentColor), {
          name: currentColor,
          available: (matchingVariant.stock || 0) > 0,
        });
      }
    }

    return Array.from(baseColorMap.values());
  }

  const colorsFromImages = getUniqueValues(
    Object.keys(currentProduct.images || {}).map((key) =>
      key.replace(/\d+/g, "")
    )
  );

  return colorsFromImages.map((colorName) => ({
    name: colorName,
    available: true,
  }));
}

export function getAvailableColorsForSize(
  currentProduct: ProductType | undefined,
  selectedSize: string
) {
  return getPrimaryColorsForSize(currentProduct, selectedSize)
    .filter((option) => option.available)
    .map((option) => option.name);
}

export function hasStockForSize(
  currentProduct: ProductType | undefined,
  size: string
) {
  if (!currentProduct) return false;
  if (!currentProduct?.variants?.length)
    return (currentProduct.totalStock ?? (currentProduct.inStock ? 1 : 0)) > 0;

  return currentProduct.variants.some(
    (variant) => variant.size === size && variant.stock > 0
  );
}

export function hasStockForVariant(
  currentProduct: ProductType | undefined,
  selectedSize: string,
  selectedColor: string
) {
  if (!currentProduct) return false;
  if (!currentProduct?.variants?.length)
    return (currentProduct.totalStock ?? (currentProduct.inStock ? 1 : 0)) > 0;

  return currentProduct.variants.some(
    (variant) =>
      variant.size === selectedSize &&
      variant.color === selectedColor &&
      variant.stock > 0
  );
}
