"use client";
import TitleWithDropDown from "@/components/common/TitleWithDropDown";
import CategoryForm from "@/components/category/CategoryForm";
import TreeForm from "@/components/category/TreeForm";
import { Category } from "@/utils/axiosUtils/API";
import useCreate from "@/utils/hooks/useCreate";
import usePermissionCheck from "@/utils/hooks/usePermissionCheck";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Col, Row } from "reactstrap";

const UpdateBlogCategory = () => {
  const params = useParams();
  const updateId = params?.updateId;
  const TableTitle = dynamic(() => import("@/components/table/TableTitle"), { ssr: false });
  const [edit] = usePermissionCheck(["edit"], "category");
  const { t } = useTranslation("common");
  const { mutate, isLoading } = useCreate(`${Category}/${updateId}`, false, "/blog/category", false);
  return (
    <>
      <Row>
        <Col xl="4">
          <Card>
            <CardBody>
              <TitleWithDropDown pathName="/blog/category" moduleName="Category" />
              <TreeForm type={"post"} isLoading={isLoading} />
            </CardBody>
          </Card>
        </Col>
        <Col xl="8">
          <Card>
            {edit ? (
              <CardBody>
                {updateId && (
                  <>
                    <TableTitle moduleName="Edit Category" onlyTitle={true} />
                    <CategoryForm mutate={mutate} updateId={updateId} loading={isLoading} type={"post"} buttonName="Update" />
                  </>
                )}
              </CardBody>
            ) : (
              <h1>{t("NoPermission")}</h1>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};
export default UpdateBlogCategory;
