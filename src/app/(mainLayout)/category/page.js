"use client";
import TitleWithDropDown from "@/components/common/TitleWithDropDown";
import CategoryForm from "@/components/category/CategoryForm";
import TreeForm from "@/components/category/TreeForm";
import { Category, CategoryExportAPI, CategoryImportAPI } from "@/utils/axiosUtils/API";
import usePermissionCheck from "@/utils/hooks/usePermissionCheck";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiLockLine } from "react-icons/ri";
import { Card, CardBody, Col, Row } from "reactstrap";

const CategoryCreate = () => {
  const { t } = useTranslation('common');
  const [create] = usePermissionCheck(["create"]);
  const refRefetch = useRef();
  const [resetData, setResetData] = useState(false);
  return (  
    <>
      <div className="card-spacing">
        <Row>
          <Col xl="4">
            <Card>
              <CardBody>
                <TitleWithDropDown moduleName="Category" type={'product'}  importExport={{ importUrl: CategoryImportAPI, exportUrl: CategoryExportAPI , sampleFile:"categories.csv"}} />
                <TreeForm type={"product"} ref={refRefetch} />
              </CardBody>
            </Card>
          </Col>
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
        </Row>
      </div>
    </>
  );
};

export default CategoryCreate;
