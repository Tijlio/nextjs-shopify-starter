"use client";

import { atom, useAtom } from "jotai";
import { fetchGraphQL } from "@/shopify/client";
import {
  ADD_TO_CART,
  UPDATE_CART_ITEMS,
  REMOVE_FROM_CART,
  GET_CART,
  CREATE_CART,
} from "@/graphql/cart";
import { CartLineInput, CartLineUpdateInput } from "@/types/shopify-graphql";

export type CartState = {
  id: string;
  checkoutUrl: string;
  note: string;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount: {
      amount: string;
      currencyCode: string;
    } | null;
  };
  lines: {
    edges: Array<{
      node: {
        cost: {
          totalAmount: {
            amount: string;
            currencyCode: string;
          };
        };
        id: string;
        quantity: number;
        merchandise: {
          selectedOptions: Record<string, string>;
          id: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          title: string;
          product: {
            description: string;
            id: string;
            title: string;
            vendor: string;
            handle: string;
            images: {
              edges: Array<{
                node: {
                  url: string;
                  altText: string;
                  height: number;
                  width: number;
                };
              }>;
            };
          };
        };
      };
    }>;
  };
  totalQuantity: number;
};

const initialCartState: CartState = {
  id: "",
  checkoutUrl: "",
  note: "",
  cost: {
    subtotalAmount: {
      amount: "0.0",
      currencyCode: "XXX",
    },
    totalAmount: {
      amount: "0.0",
      currencyCode: "XXX",
    },
    totalTaxAmount: null,
  },
  lines: {
    edges: [],
  },
  totalQuantity: 0,
};

const cartAtom = atom<CartState>(initialCartState);

// Helper function to calculate line item cost
function calculateLineItemCost(
  price: number,
  quantity: number,
  currencyCode: string
) {
  return {
    amount: (price * quantity).toFixed(2),
    currencyCode,
  };
}

// Helper function to calculate cart totals
function calculateCartTotals(lines: CartState["lines"]) {
  // Initialize running totals for the entire cart
  let subtotal = 0;
  let totalQuantity = 0;

  // Get currency code from first line item, default to USD if cart is empty
  const currencyCode =
    lines.edges[0]?.node.merchandise.price.currencyCode || "USD";

  // Map over each line item to:
  // 1. Calculate per-line costs
  // 2. Update running cart totals
  // 3. Return updated line items with costs
  const updatedEdges = lines.edges.map(({ node }) => {
    // Get price and quantity for this line
    const price = parseFloat(node.merchandise.price.amount);
    const quantity = node.quantity;

    // Add to cart running totals
    subtotal += price * quantity;
    totalQuantity += quantity;

    // Return line with calculated cost
    return {
      node: {
        ...node,
        cost: {
          totalAmount: calculateLineItemCost(
            price,
            quantity,
            node.merchandise.price.currencyCode
          ),
        },
      },
    };
  });

  // Assuming no tax or additional fees for simplicity
  const total = subtotal;

  return {
    subtotalAmount: {
      amount: subtotal.toFixed(2),
      currencyCode,
    },
    totalAmount: {
      amount: total.toFixed(2),
      currencyCode,
    },
    totalTaxAmount: null,
    totalQuantity,
    updatedEdges,
  };
}

// Helper functions to interact with the API
async function addToCart(cartId: string, lines: CartLineInput[]) {
  try {
    await fetchGraphQL(ADD_TO_CART, { cartId, lines });
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
}

async function updateCartItems(cartId: string, lines: CartLineUpdateInput[]) {
  try {
    await fetchGraphQL(UPDATE_CART_ITEMS, { cartId, lines });
  } catch (error) {
    console.error("Error updating cart items:", error);
  }
}

async function removeFromCart(cartId: string, lineIds: string[]) {
  try {
    await fetchGraphQL(REMOVE_FROM_CART, { cartId, lineIds });
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
}

// Helper function to create a new cart
async function createCart() {
  try {
    const response = await fetchGraphQL(CREATE_CART, { lineItems: [] });
    return response.cartCreate.cart;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
}

// Cart actions
export const useCartActions = () => {
  const [cart, setCart] = useAtom(cartAtom);

  const addItem = async (merchandiseId: string, quantity: number) => {
    const existingLineItem = cart.lines.edges.findIndex(
      (edge) => edge.node.merchandise.id === merchandiseId
    );

    if (existingLineItem >= 0) {
      const existingLine = cart.lines.edges[existingLineItem];
      const updatedEdges = cart.lines.edges.map((edge, index) =>
        index === existingLineItem
          ? {
              ...edge,
              node: {
                ...edge.node,
                quantity: edge.node.quantity + quantity,
              },
            }
          : edge
      );

      await updateCartItems(cart.id, [
        {
          id: existingLine.node.id,
          quantity: existingLine.node.quantity + quantity,
        },
      ]);

      const {
        subtotalAmount,
        totalAmount,
        totalTaxAmount,
        totalQuantity,
        updatedEdges: edgesWithCost,
      } = calculateCartTotals({
        edges: updatedEdges,
      });

      setCart({
        ...cart,
        lines: { edges: edgesWithCost },
        cost: {
          subtotalAmount,
          totalAmount,
          totalTaxAmount,
        },
        totalQuantity,
      });
    } else {
      await addToCart(cart.id, [{ merchandiseId, quantity }]);
      const { cart: updatedCart } = await fetchGraphQL(GET_CART, {
        cartId: cart.id,
      });
      setCart(updatedCart);
    }
  };

  const updateItem = async (merchandiseId: string, quantity: number) => {
    if (quantity <= 0) {
      const lineToRemove = cart.lines.edges.find(
        (edge) => edge.node.merchandise.id === merchandiseId
      );
      if (lineToRemove) {
        const updatedEdges = cart.lines.edges.filter(
          (edge) => edge.node.merchandise.id !== merchandiseId
        );
        await removeFromCart(cart.id, [lineToRemove.node.id]);

        const {
          subtotalAmount,
          totalAmount,
          totalTaxAmount,
          totalQuantity,
          updatedEdges: edgesWithCost,
        } = calculateCartTotals({
          edges: updatedEdges,
        });

        setCart({
          ...cart,
          lines: { edges: edgesWithCost },
          cost: {
            subtotalAmount,
            totalAmount,
            totalTaxAmount,
          },
          totalQuantity,
        });
      }
      return;
    }

    const lineToUpdate = cart.lines.edges.find(
      (edge) => edge.node.merchandise.id === merchandiseId
    );
    if (lineToUpdate) {
      const updatedEdges = cart.lines.edges.map((edge) =>
        edge.node.merchandise.id === merchandiseId
          ? {
              ...edge,
              node: {
                ...edge.node,
                quantity,
              },
            }
          : edge
      );

      await updateCartItems(cart.id, [
        {
          id: lineToUpdate.node.id,
          quantity,
        },
      ]);

      const {
        subtotalAmount,
        totalAmount,
        totalTaxAmount,
        totalQuantity,
        updatedEdges: edgesWithCost,
      } = calculateCartTotals({
        edges: updatedEdges,
      });

      setCart({
        ...cart,
        lines: { edges: edgesWithCost },
        cost: {
          subtotalAmount,
          totalAmount,
          totalTaxAmount,
        },
        totalQuantity,
      });
    }
  };

  const removeItem = async (merchandiseId: string) => {
    const lineToRemove = cart.lines.edges.find(
      (edge) => edge.node.merchandise.id === merchandiseId
    );
    if (lineToRemove) {
      const updatedEdges = cart.lines.edges.filter(
        (edge) => edge.node.merchandise.id !== merchandiseId
      );
      await removeFromCart(cart.id, [lineToRemove.node.id]);

      const {
        subtotalAmount,
        totalAmount,
        totalTaxAmount,
        totalQuantity,
        updatedEdges: edgesWithCost,
      } = calculateCartTotals({
        edges: updatedEdges,
      });

      setCart({
        ...cart,
        lines: { edges: edgesWithCost },
        cost: {
          subtotalAmount,
          totalAmount,
          totalTaxAmount,
        },
        totalQuantity,
      });
    }
  };

  const initializeCart = async () => {
    try {
      let cartId = localStorage.getItem("cartId");
      if (!cartId) {
        const newCart = await createCart();
        cartId = newCart.id;

        if (cartId) {
          localStorage.setItem("cartId", cartId);
        }
      }

      const { cart: fetchedCart } = await fetchGraphQL(GET_CART, { cartId });
      setCart(fetchedCart);
    } catch (error) {
      console.error("Error initializing cart:", error);
    }
  };

  return {
    cart,
    addItem,
    updateItem,
    removeItem,
    initializeCart,
  };
};
