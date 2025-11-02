"use client"
import TitleWithDropDown from "@/components/common/TitleWithDropDown";
import CategoryForm from "@/components/category/CategoryForm";
import TreeForm from "@/components/category/TreeForm";
import { CategoryExportAPI, CategoryImportAPI } from "@/utils/axiosUtils/API";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Col, Row } from "reactstrap";

const CategoryCreate = () => {
  const { t } = useTranslation('common');
  return (
    <>
      <Row>
        <Col xl="4">
          <Card>
            <CardBody>
              <TitleWithDropDown  moduleName="Category"   importExport={{ importUrl: CategoryImportAPI, exportUrl: CategoryExportAPI}} />
              <TreeForm type={"product"} />
            </CardBody>
          </Card>
        </Col>
        <Col xl="8">
          <Card>
            <CardBody>
              <div className="title-header option-title">
                <h5>{t("AddCategory")}</h5>
              </div>
              <CategoryForm type={"product"} buttonName="Save" />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CategoryCreate;

