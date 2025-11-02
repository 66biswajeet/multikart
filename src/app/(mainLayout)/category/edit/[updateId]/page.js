"use client";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import dynamic from "next/dynamic";
import { Category, CategoryExportAPI, CategoryImportAPI } from "@/utils/axiosUtils/API";
import CategoryForm from "@/components/category/CategoryForm";
import TreeForm from "@/components/category/TreeForm";
import usePermissionCheck from "@/utils/hooks/usePermissionCheck";
import TitleWithDropDown from "@/components/common/TitleWithDropDown";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CategoryUpdate = () => {
  const params = useParams();
  const TableTitle = dynamic(() => import("@/components/table/TableTitle"), {
    ssr: false,
  });
  // const [edit] = usePermissionCheck(["edit"]);

  return (
    <>
      <Container fluid={true}>
        <Row>
          <Col xl="4">
            <Card>
              <CardBody>
                <TitleWithDropDown pathName="/category" moduleName="Category" importExport={{ importUrl: CategoryImportAPI, exportUrl: CategoryExportAPI }} />
                <TreeForm type={"product"} />
              </CardBody>
            </Card>
          </Col>
          <Col xl="8">
            <Card>
              { (
                <CardBody>
                  <TableTitle moduleName="Edit Category" onlyTitle={true} />
                  {params?.updateId && <CategoryForm updateId={params?.updateId} type={"product"} buttonName="Update" />}
                </CardBody>
              ) 
              }
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CategoryUpdate;
