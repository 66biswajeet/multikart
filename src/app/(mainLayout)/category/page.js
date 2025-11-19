"use client";
import TitleWithDropDown from "@/components/common/TitleWithDropDown";
// import CategoryForm from "@/components/category/CategoryForm"; // No longer needed here
import TreeForm from "@/components/category/TreeForm";
import {
  Category,
  CategoryExportAPI,
  CategoryImportAPI,
} from "@/utils/axiosUtils/API";
// import usePermissionCheck from "@/utils/hooks/usePermissionCheck"; // No longer needed here
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
// import { RiLockLine } from "react-icons/ri"; // No longer needed here
import { Card, CardBody, Col, Row } from "reactstrap";

const CategoryList = () => {
  // Renamed component to CategoryList for clarity
  const { t } = useTranslation("common");
  // const [create] = usePermissionCheck(["create"]); // Not needed on list page
  const refRefetch = useRef();
  // const [resetData, setResetData] = useState(false); // Not needed on list page

  return (
    <>
      <div className="card-spacing">
        <Row>
          {/* This is the tree/list column. It is now full-width */}
          <Col xl="12">
            <Card>
              <CardBody>
                <TitleWithDropDown
                  moduleName="Category"
                  type={"product"}
                  importExport={{
                    importUrl: CategoryImportAPI,
                    exportUrl: CategoryExportAPI,
                    sampleFile: "categories.csv",
                  }}
                  pathName="/category/create"
                />
                <TreeForm type={"product"} ref={refRefetch} />
              </CardBody>
            </Card>
          </Col>

          {/* This column, which contained the "Add Category" form, is now REMOVED.
          <Col xl="8">
            <Card className={create ? "" : "nopermission-parent"}>
              <CardBody>
                <div className="title-header option-title">
                  <h5>{t("AddCategory")}</h5>
                </div>
                <CategoryForm key={resetData} setResetData={setResetData} type={"product"} />
              </CardBody>
              <div className="no-permission"><div><RiLockLine /><h3>{t("NoPermission")}</h3></div></div>
            </Card>
          </Col>
          */}
        </Row>
      </div>
    </>
  );
};

export default CategoryList;
