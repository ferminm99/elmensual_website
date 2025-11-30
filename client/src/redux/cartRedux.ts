import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define la interfaz del producto en el carrito
interface VariantOption {
  _id?: string;
  size?: string;
  color?: string;
  stock?: number;
}

interface Product {
  cartItemId?: string;
  productId: string;
  _id: string;
  title: string;
  price: number;
  quantity: number;
  img: string;
  color?: string;
  size?: string;
  variants?: VariantOption[];
  availableSizes?: string[];
  availableColors?: string[];
  images?: { [key: string]: string }; // 🔥 NUEVO
}

// Define la interfaz del estado inicial
interface CartState {
  products: Product[];
  quantity: number;
  total: number;
}

const initialState: CartState = {
  products: [] as Product[],
  quantity: 0,
  total: 0,
};

const recalculateTotals = (state: CartState) => {
  state.products = state.products.map((product) => ({
    ...product,
    cartItemId:
      product.cartItemId ||
      `${product._id || product.productId}-${product.size || ""}-${
        product.color || ""
      }`,
  }));

  state.quantity = state.products.reduce(
    (count, product) => count + (product.quantity || 0),
    0
  );
  state.total = state.products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      const payload = action.payload;
      const baseId = payload._id || payload.productId;
      const cartKey = `${baseId}-${payload.size || ""}-${payload.color || ""}`;

      const existingProductIndex = state.products.findIndex(
        (product) =>
          (product._id || product.productId) === baseId &&
          (product.size || "") === (payload.size || "") &&
          (product.color || "") === (payload.color || "")
      );

      if (existingProductIndex !== -1) {
        const existingProduct = state.products[existingProductIndex];
        state.products[existingProductIndex] = {
          ...existingProduct,
          quantity: (existingProduct.quantity || 0) + payload.quantity,
          cartItemId: existingProduct.cartItemId || cartKey,
        };
      } else {
        const cartItemId = payload.cartItemId || cartKey;
        state.products.push({ ...payload, cartItemId });
      }

      recalculateTotals(state);
    },
    updateProduct: (
      state,
      action: PayloadAction<{ cartItemId: string; updates: Partial<Product> }>
    ) => {
      const { cartItemId, updates } = action.payload;
      const index = state.products.findIndex(
        (product) => product.cartItemId === cartItemId
      );

      if (index === -1) return;

      state.products[index] = { ...state.products[index], ...updates };
      recalculateTotals(state);
    },
    removeProduct: (state, action: PayloadAction<{ cartItemId: string }>) => {
      state.products = state.products.filter(
        (product) => product.cartItemId !== action.payload.cartItemId
      );
      recalculateTotals(state);
    },
  },
});

export const { addProduct, updateProduct, removeProduct } = cartSlice.actions;
export default cartSlice.reducer;
