import { attribute } from "@/utils/axiosUtils/API";
import { useEffect } from "react";
import Btn from "../../../../elements/buttons/Btn";
import request from "../../../../utils/axiosUtils";
import allPossibleCases from "../../../../utils/customFunctions/AllPossibleCases";
import getStringId from "../../../../utils/customFunctions/getStringId";
import VariationsForm from "./VariationsForm"
import VariationTop from "./VariationTop"
import { useRouter } from "next/navigation";
import useCustomQuery from "@/utils/hooks/useCustomQuery";

const VariationsTab = ({ values, setFieldValue, errors, updateId }) => {
  const router = useRouter();
  const { data } = useCustomQuery([attribute], () => request({ url: attribute }, router), { refetchOnWindowFocus: false, select: (data) => data.data.data });

  
  useEffect(() => {
    setFieldValue("attribute_values", values["options"]?.map((item) => item.values).flat(Infinity));
    // set our combination in values obj
    setFieldValue("variation_options", allPossibleCases(values["combination"]?.map((item) => item?.values?.map((elem) => ({ 
      name: item.name?.name, 
      value: item.name.attribute_values?.find((attr) => (attr._id || attr.id) == elem)?.value 
    })))))
  }, [values["combination"]]);

  useEffect(() => {
    if (!updateId || (values['variation_options'] && values['variation_options'].length > 0)) {
      getNewVariations();
    }
  }, [values["variation_options"]]);
  
  const getNewVariations = () => {
    
    let temp_variations = []
    const variations_val = values['variations']

    values['variation_options']?.map((opt, ind) => {
      const att_vals = opt.map((val) => val.value)
      
      // Match variations by checking if all attribute value names match
      // attribute_values can be either:
      // 1. Array of ObjectId strings (from database on edit)
      // 2. Array of objects with {name, value} (generated from combination)
      let variant_val = variations_val.find(({ attribute_values }) => {
        if (!attribute_values || attribute_values.length === 0) return false;
        
        // If attribute_values contains objects with 'value' property
        if (typeof attribute_values[0] === 'object' && attribute_values[0]?.value) {
          return attribute_values.every(({ value }) => att_vals.includes(value));
        }
        
        // If attribute_values contains ObjectId strings (from database)
        // We need to match by getting the value names from the ObjectIds
        if (typeof attribute_values[0] === 'string' || !attribute_values[0]?.value) {
          // Get attribute value names from the combination
          const variantValueNames = [];
          
          values['combination']?.forEach((combo) => {
            attribute_values.forEach((attrValId) => {
              const attrVal = combo.name?.attribute_values?.find(
                (av) => (av._id || av.id) === attrValId
              );
              if (attrVal) {
                variantValueNames.push(attrVal.value);
              }
            });
          });
          
          
          // Check if all att_vals are in variantValueNames
          const matches = att_vals.length === variantValueNames.length && 
                         att_vals.every(val => variantValueNames.includes(val));
          return matches;
        }
        
        return false;
      });
      
      const addObject = { stock_status: 'in_stock', status: true }
      if (values.product_type === "digital") {
        addObject.is_licensable = false;
        addObject.digital_file_ids = []

        if (values["variations"][ind]?.["is_licensable"] && values["variations"][ind]["digital_file_ids"]?.length) {
          addObject.is_licensekey_auto = false
        }

      }
      if (variant_val) {
        if (variant_val?.is_licensekey_auto) {
          variant_val['is_licensekey_auto'] = true
        } else {
          variant_val['is_licensekey_auto'] = false
        }

        // }
        if (variant_val?.is_licensable) {
          variant_val['is_licensable'] = true
        } else {
          variant_val['is_licensable'] = false
        }
        if (variant_val?.status) {
          variant_val['status'] = true
        } else {
          variant_val['status'] = false
        }
      }
      temp_variations.push(variant_val || addObject)
    })

    if (temp_variations.length > 0) {
      setFieldValue("variations", temp_variations)
    }
  }
  return (
    <div className="variant-box border-top-0">
      {values["combination"]?.map((elem, i) => (
        <VariationTop key={i} index={i} data={data} setFieldValue={setFieldValue} values={values} />
      ))}
      <div className="save-back-button">
        <Btn className="btn-primary mb-4" title="AddVariation" onClick={() => setFieldValue("combination", [...values["combination"], {}])} />
      </div>
      {values["variation_options"]?.length >= 1 && <h3 className="form-label-title mb-2">Variants</h3>}
      {values["variation_options"]?.map((elem, i) => (
        <VariationsForm elem={elem} values={values} setFieldValue={setFieldValue} key={i} index={i} newId={getStringId(elem)} errors={errors} />
      ))}
    </div>
  );
};

export default VariationsTab;
