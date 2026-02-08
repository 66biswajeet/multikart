import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Row,
  Col,
  Button,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import Btn from "@/elements/buttons/Btn";

const StockManagementModal = ({
  isOpen,
  toggle,
  productTitle,
  sku,
  warehouses,
  currentStockData,
  onSave,
}) => {
  const { t } = useTranslation("common");
  // Local state to hold stock values while editing: { [warehouseId]: { stock: 0, low_stock: 0 } }
  const [stockState, setStockState] = useState({});

  useEffect(() => {
    if (isOpen && warehouses) {
      const initial = {};
      warehouses.forEach((wh) => {
        // Pre-fill with existing data or 0
        const existing = currentStockData?.[wh._id] || {};
        initial[wh._id] = {
          stock: existing.stock || "",
          low_stock: existing.low_stock || "",
        };
      });
      setStockState(initial);
    }
  }, [isOpen, warehouses, currentStockData]);

  const handleChange = (whId, field, value) => {
    setStockState((prev) => ({
      ...prev,
      [whId]: {
        ...prev[whId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(stockState);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalHeader toggle={toggle}>{t("Add/Edit Stock")}</ModalHeader>
      <ModalBody>
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted small">{t("SKU")}</span>
            <strong>{sku}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted small">{t("Product")}</span>
            <span className="text-end" style={{ maxWidth: "70%" }}>
              {productTitle}
            </span>
          </div>
        </div>

        <Row className="fw-bold mb-2 small text-muted text-center">
          <Col xs="6" className="text-start">
            {t("Warehouse")}
          </Col>
          <Col xs="3">{t("Available")}</Col>
          <Col xs="3">{t("Low Stock")}</Col>
        </Row>

        {warehouses?.map((wh) => (
          <Row key={wh._id} className="mb-2 align-items-center">
            <Col xs="6">
              <Label className="mb-0 small fw-bold">{wh.name}</Label>
              <div className="small text-muted" style={{ fontSize: "10px" }}>
                {wh.address || wh.city}
              </div>
            </Col>
            <Col xs="3">
              <Input
                type="number"
                bsSize="sm"
                placeholder="0"
                value={stockState[wh._id]?.stock}
                onChange={(e) => handleChange(wh._id, "stock", e.target.value)}
              />
            </Col>
            <Col xs="3">
              <Input
                type="number"
                bsSize="sm"
                placeholder="0"
                value={stockState[wh._id]?.low_stock}
                onChange={(e) =>
                  handleChange(wh._id, "low_stock", e.target.value)
                }
              />
            </Col>
          </Row>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={toggle}>
          {t("Cancel")}
        </Button>
        <Btn title={t("Save")} className="btn-primary" onClick={handleSave} />
      </ModalFooter>
    </Modal>
  );
};

export default StockManagementModal;
