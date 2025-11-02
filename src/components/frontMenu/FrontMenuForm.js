import MenuContext from "@/helper/menuContext";
import { useRouter } from "next/navigation";
import { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react";
import request from "../../utils/axiosUtils";
import { Menu } from "../../utils/axiosUtils/API";
import useDelete from "../../utils/hooks/useDelete";
import Loader from "../commonComponent/Loader";
import SearchCategory from "./widgets/SearchCategory";
import useCustomQuery from "@/utils/hooks/useCustomQuery";

const FrontMenuForm = forwardRef((ref) => {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState([]);
  const { setMenuState } = useContext(MenuContext);
  const router = useRouter();

  // Get Menu Data
  const { data, refetch, isLoading } = useCustomQuery([Menu], () => request({ url: Menu, params: { search: search } }, router), { enabled: false, refetchOnWindowFocus: false, select: (data) => data.data?.data });

  // Category Delete
  const { mutate: deleteMutate, isLoading: deleteLoading } = useDelete(Menu, false, (resData) => {
    if (resData?.status == 200 || resData?.status == 201) {
      refetch();
    }
  });
  useImperativeHandle(ref, () => ({
    call() {
      refetch();
    },
  }));
  // Refetching data while create, delete and update
  useEffect(() => {
    refetch();
  }, [search]);

  useEffect(() => {
    if (data) {
      setMenuState((prev) => [...data]);
    }
  }, [data, isLoading]);

  if (isLoading) return <Loader />;
  return <SearchCategory mutate={deleteMutate} deleteLoading={deleteLoading} setSearch={setSearch} data={data} active={active} setActive={setActive} />;
});

export default FrontMenuForm;
