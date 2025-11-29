import { Product as ProductType } from "../types";

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

  return currentProduct.size || [];
}

export function getAvailableColorsForSize(
  currentProduct: ProductType | undefined,
  selectedSize: string
) {
  if (!currentProduct) return [] as string[];

  if (currentProduct.variants?.length) {
    return getUniqueValues(
      currentProduct.variants
        .filter(
          (variant) =>
            variant.size === selectedSize && variant.stock > 0 && variant.color
        )
        .map((variant) => variant.color)
    );
  }

  const colorsFromImages = Object.keys(currentProduct.images || {}).map((key) =>
    key.replace(/\d+/g, "")
  );

  return getUniqueValues(colorsFromImages);
}

export function hasStockForSize(
  currentProduct: ProductType | undefined,
  size: string
) {
  if (!currentProduct?.variants?.length) return true;

  return currentProduct.variants.some(
    (variant) => variant.size === size && variant.stock > 0
  );
}

export function hasStockForVariant(
  currentProduct: ProductType | undefined,
  selectedSize: string,
  selectedColor: string
) {
  if (!currentProduct?.variants?.length) return true;

  return currentProduct.variants.some(
    (variant) =>
      variant.size === selectedSize &&
      variant.color === selectedColor &&
      variant.stock > 0
  );
}
