import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define la interfaz del producto en el carrito
interface Product {
  _id: string;
  title: string;
  price: number;
  quantity: number;
}

// Define la interfaz del estado inicial
interface CartState {
  products: Product[];
  quantity: number;
  total: number;
}

const initialState: CartState = {
  products: [],
  quantity: 0,
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.quantity += 1;
      state.products.push(action.payload);
      state.total += action.payload.price * action.payload.quantity;
    },
  },
});

export const { addProduct } = cartSlice.actions;
export default cartSlice.reducer;
