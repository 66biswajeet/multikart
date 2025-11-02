import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import AccountContext from '.'
import request from '../../utils/axiosUtils';
import { selfData } from '../../utils/axiosUtils/API';
import useCustomQuery from '@/utils/hooks/useCustomQuery';

const AccountProvider = (props) => {
    const [cookies] = useCookies(["uat"]);
    const [role, setRole] = useState('')
    const { data, isLoading } = useCustomQuery([selfData], () => request({ url: selfData }), {
        refetchOnWindowFocus: false, select: (res) => { return res?.data }
    });
    const [accountData, setAccountData] = useState()
    const [accountContextData, setAccountContextData] = useState({
        name: "",
        image: {}
    })

    useEffect(() => {
        if (data) {
            localStorage.setItem("role", JSON.stringify(data?.role))
            setRole(data?.role?.name)
        }
        setAccountData(data)
    }, [isLoading, cookies.uat])

    return (
        <AccountContext.Provider value={{ ...props, accountData, setAccountData, accountContextData, setAccountContextData, role, setRole }}>
            {props.children}
        </AccountContext.Provider>
    )
}
export default AccountProvider