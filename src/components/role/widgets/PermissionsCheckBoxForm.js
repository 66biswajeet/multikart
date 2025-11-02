import Loader from "@/components/commonComponent/Loader";
import request from "@/utils/axiosUtils";
import { useState } from "react";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import useCustomQuery from "@/utils/hooks/useCustomQuery";


const PermissionTable = ({ values, errors, touched, setFieldValue }) => {

  const { t } = useTranslation('common');
  const [checked, setChecked] = useState();
  const router = useRouter();
  const { data, isLoading } = useCustomQuery(["permissions"], () => request({ url: "permissions" }, router), {
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      if (!data?.data?.grouped) return [];
      
      // Convert grouped permissions to the expected format
      return Object.keys(data.data.grouped).map((category) => {
        return {
          name: category,
          module_permissions: data.data.grouped[category].map((permission) => {
            return { 
              permission_id: Number(permission.id), 
              name: permission.name.split('.')[1] || permission.name // Extract action from permission name
            };
          }),
        };
      });
    },
  });
  const handleAllCheckUncheck = (e, permissionArray) => {
    touched.permissions = true;
    setChecked(!checked);
    e.target.checked
      ? values.permissions.push(...permissionArray.filter((permission) => !values.permissions.includes(permission)))
      : permissionArray.map((permission) => {
        values.permissions.splice(values.permissions.indexOf(permission), 1);
      });
  };

  const handleCheckUncheck = (e, id, obj) => {
    touched.permissions = true;
    setChecked(!checked);
    if (e.target.checked) {
      const getIndexId = obj?.module_permissions?.find((elem) => elem.name == "index")
      let removeDup = [id, getIndexId.permission_id]
      !values.permissions.includes(id) && values.permissions.push(...[...new Set(removeDup)])
    } else {
      values.permissions.splice(values.permissions.indexOf(id), 1)
    }
  };

  const handleCheckOnIndex = (permissionTitles) => {
    touched.permissions = true;
    setChecked(!checked);
    let mapArray = permissionTitles?.module_permissions.map((elem) => elem.permission_id)
    let newArr = values?.permissions?.filter((elem) => !mapArray.includes(elem))
    setFieldValue('permissions', [...new Set(newArr)])
  }
  if (isLoading) {
    return <Loader />
  }
  return (
    <>
      <div className="mb-3 d-flex">
        <h4 className="form-label-title">{t("Permissions")}<span className="theme-color ms-2 required-dot">*</span></h4>
        {touched.permissions && !values.permissions.length && errors["permissions"] && <div className="mt-0 ms-4  text-danger">{errors["permissions"] && t(`Permissionisrequired`)}</div>}
      </div>
      <div className="theme-form theme-form-2 mega-form">
        <Row className="roles-form">
          {data?.map((permissionTitles, i) => (
            <Col xs="12" key={i}>
              <ul>
                <li>{permissionTitles.name.includes('_') ? permissionTitles.name.replace('_', ' ') : permissionTitles.name}:</li>
                <li>
                  <FormGroup switch>
                    <Input className="checkbox_animated" id={permissionTitles.name} name="permissions" type="switch"
                      checked={permissionTitles.module_permissions.every((data) => values.permissions?.includes(data.permission_id))} onChange={(e) => handleAllCheckUncheck(e, permissionTitles.module_permissions.map((permission) => permission.permission_id))} />
                    <Label className="form-check-label m-0" htmlFor={permissionTitles.name}>{t("All")}</Label>
                  </FormGroup>
                </li>
                {permissionTitles.module_permissions.map((permissionDetails, i) => (
                  <li key={i}>
                    <FormGroup switch>
                      <Input className="checkbox_animated" id={"role" + permissionDetails.permission_id} type="switch" name="permissions" checked={values.permissions?.includes(permissionDetails.permission_id) && true} onChange={(e) => (permissionDetails.name == 'index') && (values.permissions.includes(permissionDetails.permission_id)) ? handleCheckOnIndex(permissionTitles) : handleCheckUncheck(e, permissionDetails.permission_id, permissionTitles)} />
                      <Label className="form-check-label m-0" htmlFor={"role" + permissionDetails.permission_id}>
                        {permissionDetails.name}
                      </Label>
                    </FormGroup>
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default PermissionTable;
