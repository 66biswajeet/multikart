// import { Col, TabContent, TabPane } from "reactstrap";
// import DigitalTab from "../DigitalTab";
// import GeneralTab from "../GeneralTab";
// import InventoryTab from "../InventoryTab";
// import OptionsTab from "../OptionsTab";
// import ProductImageTab from "../ProductImageTab";
// import SeoTab from "../SeoTab";
// import SetupTab from "../SetupTab";
// import ShippingTaxTab from "../ShippingTaxTab";
// import { generateTitleList } from "./TitleList";
// import { useEffect } from "react";
// import VariationsTab from "./variations/VariationsTab";

// const AllProductTabs = ({ setErrors, setTouched, values, setFieldValue, errors, updateId, activeTab, isSubmitting, setActiveTab, touched }) => {
//   useEffect(() => {
//     let productTabs = generateTitleList(values)
//       .map((main) => main.inputs.filter((item) => errors[item] && touched[item]))
//       .findIndex((innerArray) => Array.isArray(innerArray) && innerArray.some((item) => typeof item == "string"));

//     if (productTabs !== -1 && activeTab !== productTabs + 1) {
//       setActiveTab(String(productTabs + 1));
//     }
//   }, [isSubmitting]);
//   return (
//     <Col xl="7" lg="8">
//       {values.product_type == "physical" && (
//         <TabContent activeTab={activeTab}>
//           <TabPane tabId="1" className="some">
//             <GeneralTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>
//           <TabPane tabId="2">
//             <ProductImageTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>
//           <TabPane tabId="3">
//             <InventoryTab setErrors={setErrors} setTouched={setTouched} values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} touched={touched} />
//           </TabPane>

//           {values.type == "classified" && (
//             <TabPane tabId="4">
//               <VariationsTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//             </TabPane>
//           )}

//           <TabPane tabId={values.type == "classified" ? "5" : "4"}>
//             <SetupTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>

//           <TabPane tabId={values.type == "classified" ? "6" : "5"}>
//             <SeoTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>

//           <TabPane tabId={values.type == "classified" ? "7" : "6"}>
//             <ShippingTaxTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>

//           <TabPane tabId={values.type == "classified" ? "8" : "7"}>
//             <OptionsTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>
//         </TabContent>
//       )}
//       {values.product_type == "digital" && (
//         <TabContent activeTab={activeTab}>
//           <TabPane tabId="1" className="some">
//             <GeneralTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>
//           <TabPane tabId="2">
//             <ProductImageTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>
//           <TabPane tabId="3">
//             <InventoryTab setErrors={setErrors} setTouched={setTouched} values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>

//           {values.type == "classified" && (
//             <TabPane tabId="4">
//               <VariationsTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//             </TabPane>
//           )}

//           <TabPane tabId={values.type == "classified" ? "5" : "4"}>
//             <DigitalTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>

//           <TabPane tabId={values.type == "classified" ? "6" : "5"}>
//             <SetupTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>
//           <TabPane tabId={values.type == "classified" ? "7" : "6"}>
//             <SeoTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>

//           <TabPane tabId={values.type == "classified" ? "8" : "7"}>
//             <OptionsTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>
//         </TabContent>
//       )}
//       {values.product_type == "external" && (
//         <TabContent activeTab={activeTab}>
//           <TabPane tabId="1" className="some">
//             <GeneralTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>
//           <TabPane tabId="2">
//             <ProductImageTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>
//           <TabPane tabId="3">
//             <InventoryTab setErrors={setErrors} setTouched={setTouched} values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>

//           <TabPane tabId="4">
//             <SetupTab values={values} setFieldValue={setFieldValue} errors={errors} updateId={updateId} />
//           </TabPane>
//           <TabPane tabId="5">
//             <SeoTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>

//           <TabPane tabId="6">
//             <OptionsTab values={values} setFieldValue={setFieldValue} updateId={updateId} />
//           </TabPane>
//         </TabContent>
//       )}
//     </Col>
//   );
// };

// export default AllProductTabs;

///------- new file -------///

import { Col, TabContent, TabPane } from "reactstrap";
import { generateTitleList } from "./TitleList";
import { useEffect } from "react";

// We will update these existing components later
import GeneralTab from "../GeneralTab";
import SetupTab from "../SetupTab";
import SeoTab from "../SeoTab";

// These are NEW components we will create in the next steps
import ContentPoliciesTab from "../ContentPoliciesTab";
import MediaTab from "../MediaTab";
import TaxonomyTab from "../TaxonomyTab";

// REMOVED old components:
// - DigitalTab
// - InventoryTab
// - OptionsTab
// - ProductImageTab
// - VariationsTab

const AllProductTabs = ({
  setErrors,
  setTouched,
  values,
  setFieldValue,
  errors,
  updateId,
  activeTab,
  isSubmitting,
  setActiveTab,
  touched,
}) => {
  // This logic is good, it automatically switches to a tab with an error on submit.
  useEffect(() => {
    let productTabs = generateTitleList(values)
      .map((main) =>
        main.inputs.filter((item) => errors[item] && touched[item])
      )
      .findIndex(
        (innerArray) =>
          Array.isArray(innerArray) &&
          innerArray.some((item) => typeof item == "string")
      );

    if (productTabs !== -1 && activeTab !== productTabs + 1) {
      setActiveTab(String(productTabs + 1));
    }
  }, [isSubmitting]);

  return (
    <Col xl="7" lg="8">
      {/* All conditional logic for 'product_type' is REMOVED.
        We now have a single, unified tab structure for the Master Product.
      */}
      <TabContent activeTab={activeTab}>
        {/* Tab 1: General */}
        <TabPane tabId="1" className="some">
          <GeneralTab
            values={values}
            setFieldValue={setFieldValue}
            updateId={updateId}
          />
        </TabPane>

        {/* Tab 2: Content & Policies (New) */}
        <TabPane tabId="2">
          <ContentPoliciesTab values={values} setFieldValue={setFieldValue} />
        </TabPane>

        {/* Tab 3: Media (New) */}
        <TabPane tabId="3">
          <MediaTab
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
            updateId={updateId}
          />
        </TabPane>

        {/* Tab 4: Taxonomy (New) */}
        <TabPane tabId="4">
          <TaxonomyTab
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
          />
        </TabPane>

        {/* Tab 5: Related Products (was SetupTab) */}
        <TabPane tabId="5">
          <SetupTab
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
            updateId={updateId}
          />
        </TabPane>

        {/* Tab 6: SEO */}
        <TabPane tabId="6">
          <SeoTab
            values={values}
            setFieldValue={setFieldValue}
            updateId={updateId}
          />
        </TabPane>
      </TabContent>
    </Col>
  );
};

export default AllProductTabs;
