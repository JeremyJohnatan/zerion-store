import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Unique ID for the cart item (since same service can be added multiple times with different details)
  serviceId: string;
  title: string;
  gameName: string;
  quantity: number;
  details: string;
  basePrice: number;
  totalPrice: number;
  imageUrl?: string;
}

interface CartState {
  carts: Record<string, CartItem[]>;
  getItems: (userId: string) => CartItem[];
  addItem: (userId: string, item: Omit<CartItem, 'id'>) => void;
  removeItem: (userId: string, id: string) => void;
  updateItemDetails: (userId: string, id: string, newDetails: string) => void;
  updateQuantity: (userId: string, id: string, delta: number) => void;
  clearCart: (userId: string) => void;
  getTotalPrice: (userId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},
      getItems: (userId) => get().carts[userId] || [],
      addItem: (userId, item) => {
        set((state) => {
          const userCart = state.carts[userId] || [];
          const existingItemIndex = userCart.findIndex(i => i.serviceId === item.serviceId);
          
          if (existingItemIndex >= 0) {
            // Group identical items
            const updatedCart = [...userCart];
            const existingItem = updatedCart[existingItemIndex];
            updatedCart[existingItemIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + item.quantity,
              totalPrice: existingItem.totalPrice + item.totalPrice,
              details: existingItem.details 
                ? (item.details ? `${existingItem.details}\n${item.details}` : existingItem.details)
                : item.details
            };
            return {
              carts: { ...state.carts, [userId]: updatedCart }
            };
          }

          return {
            carts: {
              ...state.carts,
              [userId]: [
                ...userCart,
                { ...item, id: crypto.randomUUID() },
              ],
            }
          };
        });
      },
      removeItem: (userId, id) => {
        set((state) => {
          const userCart = state.carts[userId] || [];
          return {
            carts: {
              ...state.carts,
              [userId]: userCart.filter((item) => item.id !== id),
            }
          };
        });
      },
      updateQuantity: (userId, id, delta) => {
        set((state) => {
          const userCart = state.carts[userId] || [];
          return {
            carts: {
              ...state.carts,
              [userId]: userCart.map((item) => {
                if (item.id === id) {
                  const newQuantity = Math.max(1, item.quantity + delta);
                  return {
                    ...item,
                    quantity: newQuantity,
                    totalPrice: newQuantity * item.basePrice
                  };
                }
                return item;
              }),
            }
          };
        });
      },
      updateItemDetails: (userId, id, newDetails) => {
        set((state) => {
          const userCart = state.carts[userId] || [];
          return {
            carts: {
              ...state.carts,
              [userId]: userCart.map((item) => 
                item.id === id ? { ...item, details: newDetails } : item
              ),
            }
          };
        });
      },
      clearCart: (userId) => {
        set((state) => ({
          carts: {
            ...state.carts,
            [userId]: [],
          }
        }));
      },
      getTotalPrice: (userId) => {
        const userCart = get().carts[userId] || [];
        return userCart.reduce((total, item) => total + item.totalPrice, 0);
      },
    }),
    {
      name: 'zerionstore-cart-v2',
    }
  )
);
