"use client";
import SearchableSelectInput from "@/components/inputFields/SearchableSelectInput";
import AllProductTable from "@/components/product/AllProductTable";
import {BrandAPI,Category,ProductExportAPI,ProductImportAPI,product,store,} from "@/utils/axiosUtils/API";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { Col } from "reactstrap";
import request from "@/utils/axiosUtils";
import MultiSelectField from "@/components/inputFields/MultiSelectField";

import { useRouter } from "next/navigation";
import useCustomQuery from "@/utils/hooks/useCustomQuery";

const AllUsers = () => {
  const [isCheck, setIsCheck] = useState([]);
  const router =useRouter()
  const {data: brandData,isLoading: brandLoading,refetch: brandRefetch,} = useCustomQuery([BrandAPI],() => request({url: BrandAPI, params: {status: 1},},router),{ enabled: false,refetchOnWindowFocus: false,select: (res) =>res?.data?.data?.map((elem) => { return { id: elem.id, name: elem?.name, slug: elem?.slug };}),}
  );
  useEffect(() => {
    brandLoading && brandRefetch();
  }, [brandLoading]);

  const {data: storeData,isLoading,refetch: storeRefetch,} = useCustomQuery([store],() => request({url: store,params: {status: 1,},},router),
    { enabled: false,refetchOnWindowFocus: false,select: (res) => res?.data?.data?.map((elem) => { return { id: elem.id, name: elem?.store_name, slug: elem?.slug };}),}
  );
  useEffect(() => {
    isLoading && storeRefetch();
  }, [isLoading]);

  const { data: categoryData, isLoading: categoryLoader } = useCustomQuery([Category],() => request({ url: Category, params: { status: 1, type: "product" } },router),{ refetchOnWindowFocus: false,select: (res) =>res?.data?.data.map((elem) => { return {id: elem.id,name: elem.name,image: elem?.category_icon?.original_url || "/assets/images/placeholder.png",slug: elem?.slug,subcategories: elem?.subcategories,};}),});
const productTypes =[
  {
    id: "physical",
    name: "Physical Product",
    slug: "slug",
  },
  {
    id: "digital",
    name: "Digital Product",
    slug: "slug",
  },
  {
    id: "external",
    name: "External/Affiliate  Product",
    slug: "slug",
  },
]
  return (
    <Col sm="12">
      <Formik
        initialValues={{category_ids: [],brand_ids: [],store_ids: [],product_type: ""}}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <AllProductTable
              url={product}
              moduleName="Product"
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              isReplicate={{ title: "Duplicate", replicateAPI: "replicate" }}
              exportButton={true}
              importExport={{
                importUrl: ProductImportAPI,
                exportUrl: ProductExportAPI,
                sampleFile:"product.csv",
                instructionsAndSampleFile:true ,instructions:"product-bulk-upload-instructions.txt",
                paramsProps : {
                  category_ids:values["category_ids"].length > 0? values.category_ids.join(","): null,
                  brand_ids:values["brand_ids"].length > 0? values.brand_ids.join(","): null,
                  store_ids:values["store_ids"].length > 0? values["store_ids"].join(","): null,
                  product_type: values["product_type"]? values["product_type"]: null,}
              }}
              paramsProps={{
                category_ids:values["category_ids"].length > 0? values.category_ids.join(","): null,
                brand_ids:values["brand_ids"].length > 0? values.brand_ids.join(","): null,
                store_ids:values["store_ids"].length > 0? values["store_ids"].join(","): null,
                product_type: values["product_type"]? values["product_type"]: null,}}
              showFilterDifferentPlace
              advanceFilter={{
                category_ids: (
                  <MultiSelectField  
                    notitle="true"
                    values={values}
                    setFieldValue={setFieldValue}
                    name="category_ids"
                    title="Category"
                    data={categoryData}
                    initialTittle = "SelectCategories"
                  />
                ),
                brand: (
                  <SearchableSelectInput
                    nameList={[
                      {
                        name: "brand_ids",
                        notitle: "true",
                        inputprops: {
                          name: "brand_ids",
                          id: "brand_ids",
                          initialTittle: "SelectBrand",
                          options: brandData || [],
                        },
                      },
                    ]}
                  />
                ),
                store_ids: (
                  <SearchableSelectInput
                    nameList={[
                      {
                        name: "store_ids",
                        notitle: "true",
                        inputprops: {
                          name: "store_ids",
                          id: "store_ids",
                          options: storeData || [],
                          initialTittle: "SelectStore",
                        },
                      },
                    ]}
                  />
                ),
                productType: (
                  <SearchableSelectInput
                    nameList={[
                      {
                        name: "product_type",
                        notitle: "true",
                        inputprops: {
                          name: "product_type",
                          id: "product_type",
                          options:productTypes, 
                          close: values["product_type"] ? true :false,
                          initialTittle: "SelectProductType",
                        },
                      },
                    ]}
                  />
                ),
              }}
            />
          </Form>
        )}
      </Formik>
    </Col>
  );
};

export default AllUsers;
