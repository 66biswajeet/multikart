"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Container, Row, Col, Card, CardBody, Table } from "reactstrap";
import request from "@/utils/axiosUtils";
import Loader from "@/components/commonComponent/Loader";

const OrderDetails = () => {
  const { orderId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: () => request({ url: `/api/order/${orderId}` }),
    select: (res) => res?.data?.data,
  });

  if (isLoading) return <Loader />;

  return (
    <Container fluid>
      <Row>
        <Col lg="8">
          <Card>
            <CardBody>
              <div className="title-header">
                <h5>Order Items (ID: {data?.order_number})</h5>
              </div>
              <Table responsive className="table-borderless">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_id?.name}</td>
                      <td>${item.single_price}</td>
                      <td>{item.quantity}</td>
                      <td>${item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
        <Col lg="4">
          <Card>
            <CardBody>
              <h5>Customer Information</h5>
              <div className="customer-detail">
                <p>
                  <strong>Name:</strong> {data?.consumer_id?.name}
                </p>
                <p>
                  <strong>Email:</strong> {data?.consumer_id?.email}
                </p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span className="badge badge-secondary">
                    {data?.payment_status}
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetails;
