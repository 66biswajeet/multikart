import React, { useContext } from "react";
import request from "../../utils/axiosUtils";
import { tax } from "../../utils/axiosUtils/API";
import { store } from "../../utils/axiosUtils/API";
import SimpleInputField from "../inputFields/SimpleInputField";
import SearchableSelectInput from "../inputFields/SearchableSelectInput";
import DescriptionInput from "../widgets/DescriptionInput";
import SettingContext from "../../helper/settingContext";
import { useTranslation } from "react-i18next";
import AccountContext from "@/helper/accountContext";
import { useRouter } from "next/navigation";
import useCustomQuery from "@/utils/hooks/useCustomQuery";

const GeneralTab = ({ values, setFieldValue, updateId }) => {
  const { t } = useTranslation("common");
  const { state } = useContext(SettingContext);
  const { role } = useContext(AccountContext);
  const router = useRouter();
  const { data: taxData } = useCustomQuery([tax], () => request({ url: tax, params: { status: 1 } }, router), { refetchOnWindowFocus: false, select: (data) => data.data.data });
  const { data: StoreData } = useCustomQuery([store], () => request({ url: store, params: { status: 1 } }, router), { refetchOnWindowFocus: false, select: (data) => data.data.data.map((item) => ({ id: item.id, name: item.store_name })) });
  return (
    <>
      {!updateId && (
        <SearchableSelectInput
          nameList={[
            {
              name: "product_type",
              title: "Product Type",
              require: "true",
              inputprops: {
                name: "product_type",
                id: "product_type",
                options: [
                  { id: "physical", name: "Physical Product" },
                  { id: "digital", name: "Digital Product" },
                  { id: "external", name: "External/Affiliate  Product" },
                ],
                close: false,
              },
            },
          ]}
        />
      )}
      {state?.isMultiVendor && role === "admin" && (
        <SearchableSelectInput
          nameList={[
            {
              name: "store_id",
              title: "Store",
              require: "true",
              inputprops: {
                name: "store_id",
                id: "store_id",
                options: StoreData || [],
                close: false,
              },
            },
          ]}
        />
      )}
      <SimpleInputField
        nameList={[
          { name: "name", require: "true", placeholder: t("EnterName") },
          { name: "short_description", require: "true", title: "ShortDescription", type: "textarea", rows: 3, placeholder: t("EnterShortDescription"), helpertext: "*Maximum length should be 300 characters." },
        ]}
      />
      <DescriptionInput
        values={values}
        setFieldValue={setFieldValue}
        title={t("Description")}
        nameKey="description"
        // errorMessage={"Descriptionisrequired"}
      />
      <SearchableSelectInput
        nameList={[
          {
            name: "tax_id",
            title: "Tax",
            require: "true",
            inputprops: {
              name: "tax_id",
              id: "tax_id",
              options: taxData || [],
            },
          },
        ]}
      />
    </>
  );
};

export default GeneralTab;
