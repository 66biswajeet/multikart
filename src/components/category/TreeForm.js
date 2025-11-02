import React, { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react";
import request from "../../utils/axiosUtils";
import { Category } from "../../utils/axiosUtils/API";
import useDelete from "../../utils/hooks/useDelete";
import SearchCategory from "./widgets/SearchCategory";
import Loader from "../commonComponent/Loader";
import CategoryContext from "../../helper/categoryContext";
import { useRouter } from "next/navigation";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const TreeForm = forwardRef(({ type, isLoading: loading }, ref) => {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { setCategoryState } = useContext(CategoryContext);
  const router = useRouter();
  
  // Get Category Data
  const { data, refetch, isLoading } = useCustomQuery(
    ["category", search, type], 
    () => request({ 
      url: 'category', 
      params: { 
        search: search, 
        type: type,
        page: 1,
        limit: 1000, // Get all categories for tree display
        include_subcategories: true, // Include subcategories for tree view
        parent_id: 'null' // Only get root categories, subcategories will be nested
      } 
    }, router), 
    { 
      enabled: false, 
      refetchOnWindowFocus: false, 
      select: (data) => {
        const categories = data?.data?.data || data?.data || [];
        console.log('TreeForm data:', categories);
        return categories;
      }
    }
  );

  // Category Delete function
  const deleteMutate = async (categoryId) => {
    setDeleteLoading(true);
    try {
      console.log('Deleting category:', categoryId);
      
      const response = await request({
        url: `category/${categoryId}`,
        method: 'DELETE'
      }, router);
      
      console.log('Delete response:', response);
      
      if (response?.success || response?.status === 200) {
        ToastNotification("success", "Category deleted successfully");
        refetch();
      } else {
        throw new Error(response?.message || "Delete failed");
      }
    } catch (error) {
      console.error('Category delete error:', error);
      ToastNotification("error", error?.response?.data?.message || error?.message || "Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  };
  useImperativeHandle(ref, () => ({
    call() {
      refetch();
    }
  }));
  // Refetching data while create, delete and update
  useEffect(() => {
    refetch();
  }, [search])

  useEffect(() => {
    if (data) {
      setCategoryState((prev) => [...data])
    }
  }, [data, isLoading])

  if (isLoading) return <Loader />
  return (
    <SearchCategory mutate={deleteMutate} deleteLoading={deleteLoading} setSearch={setSearch} data={data} active={active} setActive={setActive} type={type} />
  );
});

export default TreeForm;
