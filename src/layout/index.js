"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import ConvertPermissionArr from "../utils/customFunctions/ConvertPermissionArr";
import { replacePath } from "../utils/customFunctions/ReplacePath";
import Footer from "./footer";
import Header from "./header";
import Sidebar from "./sidebar";

const Layout = (props) => {
  const [mode, setMode] = useState(false);
  const [ltr, setLtr] = useState(true);
  const path = usePathname();
  let data1 = {};
  const ISSERVER = typeof window === "undefined";
  if (!ISSERVER)
    data1 =
      localStorage.getItem("account") &&
      JSON.parse(localStorage.getItem("account"));
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    mode
      ? document.body.classList.add("dark-only")
      : document.body.classList.remove("dark-only");
  }, [mode, ltr]);
  useEffect(() => {
    document.body.classList.add("version=1.0.0");
  }, []);

  useEffect(() => {
    const securePaths = mounted && ConvertPermissionArr(data1?.permissions);
    if (
      mounted &&
      !securePaths.find(
        (item) => item?.name == replacePath(path?.split("/")[1])
      )
    ) {
      // router.push("/403");
    }
  }, [data1]);
  return (
    <>
      <div className="page-wrapper compact-wrapper" id="pageWrapper">
        <Header
          setMode={setMode}
          mode={mode}
          setLtr={setLtr}
          settingData={"settingData"}
        />
        <div className="page-body-wrapper">
          <Sidebar />
          <div className="page-body">
            <Container fluid={true}>{props.children}</Container>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
