import { useRouter } from "next/navigation";
import { useTranslation } from "react-i-next";
import Btn from "../../../elements/buttons/Btn";
import { checkout } from "../../../utils/axiosUtils/API";
import request from "../../../utils/axiosUtils";
import { ToastNotification } from "../../../utils/customFunctions/ToastNotification";
import { useState } from "react";

const PlaceOrder = ({ values, mutate, loading }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    // Validation
    if (!values["consumer_id"]) {
      ToastNotification("error", "Please select a customer");
      return;
    }
    if (!values["billing_address_id"]) {
      ToastNotification("error", "Please select a billing address");
      return;
    }
    if (
      !values["shipping_address_id"] &&
      !values["products"]?.some((p) => p.product?.product_type === "digital")
    ) {
      ToastNotification("error", "Please select a shipping address");
      return;
    }
    if (!values["payment_method"]) {
      ToastNotification("error", "Please select a payment method");
      return;
    }
    if (!values["delivery_description"]) {
      ToastNotification("error", "Please select delivery option");
      return;
    }
    if (!values["products"] || values["products"].length === 0) {
      ToastNotification("error", "Cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare order data
      const orderData = {
        consumer_id: values["consumer_id"],
        billing_address_id: values["billing_address_id"],
        shipping_address_id:
          values["shipping_address_id"] || values["billing_address_id"],
        products: values["products"].map((item) => ({
          product_id: item.product_id || item.product?.id || item.product?._id,
          variation_id: item.variation_id || item.variation?._id || null,
          quantity: item.quantity,
          store_id: item.product?.store_id || 1,
        })),
        payment_method: values["payment_method"],
        delivery_description: values["delivery_description"],
        delivery_interval: values["delivery_interval"] || null,
        coupon_code: values["coupon"] || null,
        wallet_discount: values["wallet_balance"] ? values["total"] * 0.1 : 0, // Adjust as needed
        points_discount: values["isPoint"] ? values["points_amount"] || 0 : 0,
        shipping_total: values["shipping_total"] || 0,
      };

      console.log("📤 Placing order:", orderData);

      // Call checkout API
      const response = await request(
        {
          url: checkout,
          method: "POST",
          data: orderData,
        },
        router
      );

      if (response?.data?.success) {
        ToastNotification("success", "Order placed successfully!");
        // Redirect to order details page
        router.push(`/order/details/${response.data.data._id}`);
      } else {
        ToastNotification(
          "error",
          response?.data?.message || "Failed to place order"
        );
      }
    } catch (error) {
      console.error("❌ Place Order Error:", error);
      ToastNotification(
        "error",
        error?.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled =
    !values["consumer_id"] ||
    !values["billing_address_id"] ||
    (!values["shipping_address_id"] &&
      !values["products"]?.some(
        (p) => p.product?.product_type === "digital"
      )) ||
    !values["payment_method"] ||
    !values["delivery_description"] ||
    !values["products"] ||
    values["products"].length === 0 ||
    isSubmitting ||
    loading;

  return (
    <Btn
      className="btn btn-theme payment-btn mt-4"
      onClick={handleClick}
      disabled={isDisabled}
    >
      {isSubmitting ? t("PlacingOrder") || "Placing Order..." : t("PlaceOrder")}
    </Btn>
  );
};

export default PlaceOrder;
