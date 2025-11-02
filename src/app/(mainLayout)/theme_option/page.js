'use client'

import ThemeOptionForm from "@/components/themeOption";
import { ThemeOptions } from "@/utils/axiosUtils/API";
import useCreate from "@/utils/hooks/useCreate";

const ThemeOption = () => {
    const { mutate, isLoading } = useCreate(ThemeOptions, false, '/theme_option');
    return <ThemeOptionForm mutate={mutate} loading={isLoading} title={"ThemeOption"} />;
}

export default ThemeOption