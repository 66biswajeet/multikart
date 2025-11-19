//
//------------------------------------------------------

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxField from "../inputFields/CheckBoxField.js";
import request from "../../utils/axiosUtils/index.js";
import { product } from "../../utils/axiosUtils/API.js"; // Removed BrandAPI, Category, tag
import SearchableSelectInput from "../inputFields/SearchableSelectInput.js";
import useCustomQuery from "@/utils/hooks/useCustomQuery.js";
// Removed MultiSelectField, SimpleInputField, ProductDateRangePicker

const SetupTab = ({ values, setFieldValue, errors, updateId }) => {
  const { t } = useTranslation("common");
  const [search, setSearch] = useState(false);
  const [customSearch, setCustomSearch] = useState("");
  const [tc, setTc] = useState(null);
  const router = useRouter();

  // Removed Category, Tag, and Brand data fetching

  // Getting Products Data (to populate the selectors)
  const [arrayState, setArrayState] = useState([]);
  useEffect(() => {
    if (updateId) {
      setArrayState((prev) =>
        Array.from(
          new Set([
            ...prev,
            ...(values["related_products"] || []),
            ...(values["cross_sell_products"] || []),
          ])
        )
      );
    }
  }, [updateId]);

  const {
    data: productData,
    isLoading: productLoader,
    refetch,
  } = useCustomQuery(
    [product, arrayState, customSearch], // Added customSearch to queryKey
    () =>
      request(
        {
          url: product,
          params: {
            status: "active", // Use new status string
            search: customSearch ? customSearch : "",
            paginate: 15,
            ids: customSearch ? null : arrayState?.join() || null,
          },
        },
        router
      ),
    {
      enabled: true, // Enable query
      refetchOnWindowFocus: false,
      select: (res) =>
        res?.data?.data
          .filter((elem) => (updateId ? elem.id !== updateId : elem)) // Filter out self
          .map((elem) => {
            // Find primary image from the NEW media array
            const primaryImage =
              elem.media?.find((m) => m.is_primary)?.url ||
              elem.media?.[0]?.url ||
              "/assets/images/placeholder.png";
            return {
              id: elem.id,
              name: elem.product_name,
              image: primaryImage,
              slug: elem.slug,
            };
          }),
    }
  );

  // Added debouncing
  useEffect(() => {
    if (tc) clearTimeout(tc);
    setTc(setTimeout(() => setCustomSearch(search), 500));
  }, [search]);

  // Refetch when search changes
  useEffect(() => {
    refetch();
  }, [customSearch]);

  return (
    <>
      {/* Removed DateRangePicker, Unit, Tags, Categories, Brand */}

      <CheckBoxField
        name="is_random_related_products"
        title="RandomRelatedProduct"
        helpertext="*Enabling this option allows the backend to randomly select 6 products for display."
      />
      {!values["is_random_related_products"] && (
        <SearchableSelectInput
          nameList={[
            {
              name: "related_products",
              title: "RelatedProducts",
              inputprops: {
                name: "related_products",
                id: "related_products",
                options: productData || [],
                setsearch: setSearch,
                helpertext:
                  "*Choose a maximum of 6 products for effective related products display.",
              },
            },
          ]}
        />
      )}

      {/* Removed product_type check */}
      <SearchableSelectInput
        nameList={[
          {
            name: "cross_sell_products",
            title: "CrossSellProduct",
            inputprops: {
              name: "cross_sell_products",
              id: "cross_sell_products",
              options:
                productData?.map((elem) => {
                  // Use productData directly
                  return {
                    id: elem.id,
                    name: elem.name,
                    image: elem?.image || "/assets/images/placeholder.png",
                  };
                }) || [],
              setsearch: setSearch,
              helpertext:
                "*Choose a maximum of 3 products for effective cross-selling display.",
            },
          },
        ]}
      />
    </>
  );
};

export default SetupTab;
