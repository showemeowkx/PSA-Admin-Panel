import { create } from "zustand";
import api from "../../config/api";

interface CartProduct {
  id: number;
  name: string;
  price: number;
  pricePromo: number | null;
  unitsOfMeasurments: string;
  categoryId: number;
  imagePath: string;
  isActive: boolean;
  isPromo: boolean;
  stocks: { storeId: number; available: number | string }[];
}

export interface CartItem {
  id: number;
  quantity: number | string;
  product: CartProduct;
}

interface CartState {
  cartItemsCount: number;
  items: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: number,
    quantity: number,
    setQuantity?: boolean,
  ) => Promise<void>;
  removeFromCart: (productId: number, removeAll?: 0 | 1) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cartItemsCount: 0,
  items: [],

  fetchCart: async () => {
    try {
      const { data } = await api.get("/cart");
      set({
        cartItemsCount: data?.items?.length || 0,
        items: data?.items || [],
      });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  },

  addToCart: async (
    productId: number,
    quantity: number,
    setQuantity?: boolean,
  ) => {
    try {
      await api.post("/cart", { productId, quantity, setQuantity });
      const { data } = await api.get("/cart");
      set({
        cartItemsCount: data?.items?.length || 0,
        items: data?.items || [],
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  },

  removeFromCart: async (productId: number, removeAll: 0 | 1 = 0) => {
    try {
      await api.delete(`/cart/${productId}?removeAll=${removeAll}`);
      const { data } = await api.get("/cart");
      set({
        cartItemsCount: data?.items?.length || 0,
        items: data?.items || [],
      });
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await api.delete("/cart");
      set({
        cartItemsCount: 0,
        items: [],
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  },
}));

export const getDefaultAddQuantity = (
  product: CartProduct,
  storeId?: number | null,
): number => {
  if (!product.stocks || !storeId) {
    console.log("Product stocks or storeId is missing");
    return 1;
  }

  const storeStock = product.stocks.find(
    (s: { storeId: number; available: number | string }) =>
      s.storeId === storeId,
  );

  if (!storeStock) {
    console.log(
      "Store stock not found for product:",
      product.id,
      "and storeId:",
      storeId,
    );
    return 1;
  }

  const totalAvailable = Number(storeStock.available);

  const state = useCartStore.getState();
  const cartItem = state.items.find((item) => item.product.id === product.id);
  const currentlyInCart = cartItem ? Number(cartItem.quantity) : 0;

  const remaining = Number((totalAvailable - currentlyInCart).toFixed(3));

  if (remaining <= 0) {
    console.log("No stock available for product:", product.id);
    return 1;
  }

  return remaining >= 1 ? 1 : remaining;
};
