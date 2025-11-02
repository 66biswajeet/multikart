import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import request from "../axiosUtils";
import { selfData } from "../axiosUtils/API";
import ConvertPermissionArr from "../customFunctions/ConvertPermissionArr";
import useCustomQuery from "./useCustomQuery";

const usePermissionCheck = (permissionTypeArr, keyToSearch) => {
  const [ansData, setAnsData] = useState([]);
  const path = usePathname();
  const moduleToSearch = keyToSearch ? keyToSearch : path.split("/")[1];
  const { data, isLoading, refetch } = useCustomQuery([selfData], () => request({ url: selfData }), {
    enabled: false,
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    if (!isLoading) {
      refetch();
    }
  }, []);
  
  useEffect(() => {
    if (data) {
      const securePaths = ConvertPermissionArr(data?.data?.permission);
      setAnsData(permissionTypeArr.map((permissionType) => Boolean(securePaths?.find((permission) => moduleToSearch == permission.name)?.permissionsArr.find((permission) => permission.type == permissionType))));
    }
  }, [data, moduleToSearch]);

  return ansData;
};

export default usePermissionCheck;
