import { create } from "zustand";
import api from "../../config/api";

interface Stock {
  storeId: number;
  available: number;
}

interface Product {
  id: number;
  stocks?: Stock[];
  [key: string]: unknown;
}

interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

interface CartState {
  cartItemsCount: number;
  items: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
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

  addToCart: async (productId: number, quantity: number) => {
    try {
      await api.post("/cart", { productId, quantity });
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
}));

export const getDefaultAddQuantity = (
  product: Product,
  storeId?: number | null,
): number => {
  if (!product.stocks || !storeId) return 1;

  const storeStock = product.stocks.find((s: Stock) => s.storeId === storeId);
  if (!storeStock) return 1;

  const totalAvailable = Number(storeStock.available);

  const state = useCartStore.getState();
  const cartItem = state.items.find((item) => item.product.id === product.id);
  const currentlyInCart = cartItem ? Number(cartItem.quantity) : 0;

  const remaining = Number((totalAvailable - currentlyInCart).toFixed(3));

  if (remaining <= 0) return 1;

  return remaining >= 1 ? 1 : remaining;
};
