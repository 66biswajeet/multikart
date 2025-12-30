"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useCookies } from "react-cookie";
import AccountContext from ".";
import request from "../../utils/axiosUtils";
import { selfData } from "../../utils/axiosUtils/API";
import useCustomQuery from "@/utils/hooks/useCustomQuery";

const AccountProvider = (props) => {
  const [cookies] = useCookies(["uat"]);
  const [role, setRole] = useState("");
  const [accountData, setAccountData] = useState(null);
  const [accountContextData, setAccountContextData] = useState({
    name: "",
    image: {},
  });

  // 1. A persistent lock that does NOT trigger re-renders
  const hasFetched = useRef(false);

  const { data, isSuccess, isFetching } = useCustomQuery(
    ["self", cookies.uat],
    () => request({ url: selfData }),
    {
      // 2. Only enable if we have a token AND we haven't already fetched
      enabled: !!cookies.uat && !hasFetched.current,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: false,
      select: (res) => res?.data,
    }
  );

  useEffect(() => {
    if (isSuccess && data) {
      // 3. Lock the query so it doesn't re-run even if the component re-renders
      hasFetched.current = true;

      const dataString = JSON.stringify(data);
      if (dataString !== JSON.stringify(accountData)) {
        localStorage.setItem("role", JSON.stringify(data?.role));
        setRole(data?.role?.name);
        setAccountData(data);
      }
    }
  }, [data, isSuccess, accountData]);

  // 4. Memoize value to prevent child components from re-rendering unnecessarily
  const contextValue = useMemo(
    () => ({
      accountData,
      setAccountData,
      accountContextData,
      setAccountContextData,
      role,
      setRole,
      isAccountLoading: isFetching,
    }),
    [accountData, accountContextData, role, isFetching]
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {props.children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
