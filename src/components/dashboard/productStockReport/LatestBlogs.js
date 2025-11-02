import { useEffect } from "react";
import { Form } from "reactstrap";
import { checkPermission } from "@/components/common/CheckPermissionList";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import request from "../../../utils/axiosUtils";
import { blog } from "../../../utils/axiosUtils/API";
import TopSellingProduct from "../recentOrders/TopSellingProduct";

const LatestBlogs = () => {
  const router = useRouter();
  const { data, isLoading, refetch } = useCustomQuery([blog], () => request({ url: blog, params: { status: 1, paginate: 2 } }, router), {
    refetchOnWindowFocus: false,
    enabled: false,
    select: (data) => data?.data?.data,
  });
  useEffect(() => {
    refetch();
  }, []);
  return (
    <div>
      {checkPermission("product.index") && (
        <Formik initialValues={{ filter_by: "" }}>
          {({ values, setFieldValue }) => (
            <Form>
              <TopSellingProduct values={values} setFieldValue={setFieldValue} />
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default LatestBlogs;
