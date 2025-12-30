"use client";
import { useState } from "react";
import {
  QueryClientProvider,
  QueryClient,
  HydrationBoundary,
} from "@tanstack/react-query";
import SettingProvider from "@/helper/settingContext/SettingProvider";
import AccountProvider from "@/helper/accountContext/AccountProvider";
import BadgeProvider from "@/helper/badgeContext/BadgeProvider";
import CategoryProvider from "@/helper/categoryContext/CategoryProvider";
import CartProvider from "@/helper/cartContext/CartProvider";
import MenuProvider from "@/helper/menuContext/MenuProvider";

const TanstackWrapper = ({ children }) => {
  // 1. IMPROVEMENT: Define robust global defaults to stop the loop
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes globally
            gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
            refetchOnWindowFocus: false, // STOP re-fetching when clicking back into the browser
            retry: false, // Prevents multiple retries on 401 errors
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* 2. FIX: Only use HydrationBoundary if you are actually passing dehydratedState 
          from a Server Component. If not, this can cause hydration loops. */}
      <HydrationBoundary state={children?.props?.dehydratedState || null}>
        <SettingProvider>
          <AccountProvider>
            <BadgeProvider>
              <CategoryProvider>
                <CartProvider>
                  <MenuProvider>{children}</MenuProvider>
                </CartProvider>
              </CategoryProvider>
            </BadgeProvider>
          </AccountProvider>
        </SettingProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default TanstackWrapper;
