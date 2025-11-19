import React from "react";
import { useTranslation } from "react-i18next";
import { FieldArray } from "formik";
import { RiAddLine, RiDeleteBinLine } from "react-icons/ri";
import { Col, Input, Label } from "reactstrap";
import SimpleInputField from "@/components/inputFields/SimpleInputField";
import Btn from "@/elements/buttons/Btn";

const ContentPoliciesTab = ({ values, setFieldValue }) => {
  const { t } = useTranslation("common");

  return (
    <Col>
      <div className="title-header option-title">
        <h5>{t("Content & Policies")}</h5>
      </div>

      {/* 'About This Item' field */}
      <SimpleInputField
        nameList={[
          {
            name: "product_policies.about_this_item",
            title: t("AboutThisItem"),
            type: "textarea",
            rows: 5,
            placeholder: t("Enteralongdescriptionfortheproduct"),
          },
        ]}
      />

      {/* 'Key Features' dynamic array */}
      <div className="mb-4">
        <Label className="form-label">{t("KeyFeatures")}</Label>
        <FieldArray
          name="product_policies.key_features"
          render={(arrayHelpers) => (
            <div>
              {values.product_policies?.key_features?.map((feature, index) => (
                <div className="input-group mb-2" key={index}>
                  <Input
                    type="text"
                    className="form-control"
                    placeholder={`${t("Feature")} ${index + 1}`}
                    value={feature}
                    onChange={(e) =>
                      setFieldValue(
                        `product_policies.key_features.${index}`,
                        e.target.value
                      )
                    }
                  />
                  <Btn
                    type="button"
                    className="btn-danger"
                    onClick={() => arrayHelpers.remove(index)}
                  >
                    <RiDeleteBinLine />
                  </Btn>
                </div>
              ))}
              <Btn
                type="button"
                className="btn-primary"
                onClick={() => arrayHelpers.push("")}
              >
                <RiAddLine className="me-1" /> {t("AddFeature")}
              </Btn>
            </div>
          )}
        />
      </div>

      {/* Other policy fields */}
      <SimpleInputField
        nameList={[
          {
            name: "product_policies.warranty_info",
            title: t("WarrantyInfo"),
            placeholder: t('e.g., "12 months limited warranty"'),
          },
          {
            name: "product_policies.return_policy",
            title: t("ReturnPolicy"),
            type: "textarea",
            rows: 3,
            placeholder: t("Enter return policy text"),
          },
          {
            name: "product_policies.refund_policy",
            title: t("RefundPolicy"),
            type: "textarea",
            rows: 3,
            placeholder: t("Enter refund policy text"),
          },
        ]}
      />
    </Col>
  );
};

export default ContentPoliciesTab;
