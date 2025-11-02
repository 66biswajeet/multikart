'use client'
import SettingContext from "@/helper/settingContext";
import { updateSetting } from "@/utils/axiosUtils/API";
import useCreate from "@/utils/hooks/useCreate";
import dynamic from "next/dynamic";
import { useContext } from "react";

const Setting = () => {
  const SettingForm = dynamic(() => import("@/components/setting/SettingForm").then((mod) => mod.default), {
    // loading: () => <Loader />,
    ssr: false,
  });
  const { dispatch, setCurrencySymbol, setSettingObj } = useContext(SettingContext)
  const { mutate, isLoading } = useCreate(updateSetting, false, false, false, (resDta) => {
    if (resDta.status == 200 || resDta.status == 201) {
      resDta?.data?.values?.general['mode'] == "dark-only" ? document.body.classList.add("dark-only") : document.body.classList.remove("dark-only")
      resDta?.data?.values?.general['admin_site_language_direction'] == 'ltr' ? (document.documentElement.dir = "ltr") : (document.documentElement.dir = "rtl");
      setCurrencySymbol(resDta?.data?.values?.general?.default_currency?.symbol)
      setSettingObj(resDta?.data?.values)
      dispatch({
        type: 'SETTINGIMAGE',
        logo: resDta?.data?.values?.general['site_logo_image'] ? resDta?.data?.values?.general['site_logo_image'] : undefined,
        responsiveImage: resDta?.data?.values?.general['responsive_image']?.original_url ? resDta?.data?.values?.general['responsive_image']?.original_url : undefined,
        title: resDta?.data?.values["general"]['site_title'],
        tagline: resDta?.data?.values["general"]['site_tagline'],
        copyRight: resDta?.data?.values["general"]['copyright'],
        tinyLogo: resDta?.data?.values["general"]["tiny_logo_image"],
        lightLogo: resDta?.data?.values["general"]["light_logo_image"],
        darkLogo: resDta?.data?.values["general"]["dark_logo_image"],
        favicon: resDta?.data?.values["general"]["favicon_image"],
      })
    }
  });
  return <SettingForm mutate={mutate} loading={isLoading} title={"Settings"} />;
};

export default Setting;
