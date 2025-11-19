"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import request from "@/utils/axiosUtils";
import { OrderAPI } from "@/utils/axiosUtils/API";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import Loader from "@/components/commonComponent/Loader";
import OrderDetailsComponent from "@/components/orders/details";

const OrderDetails = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.updateId;

  const { data, isLoading, refetch } = useCustomQuery(
    [OrderAPI, orderId],
    () => request({ url: `${OrderAPI}/${orderId}` }, router),
    {
      enabled: !!orderId,
      refetchOnWindowFocus: false,
      select: (res) => res?.data?.data,
    }
  );

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return (
      <div className="text-center p-5">
        <h4>Order not found</h4>
      </div>
    );
  }

  return <OrderDetailsComponent order={data} refetch={refetch} />;
};

export default OrderDetails;
