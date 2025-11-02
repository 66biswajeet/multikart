import React, { useEffect } from 'react'
import { AllCurrencyData } from '../../data/AllCurrencyData'
import SimpleInputField from '../inputFields/SimpleInputField'

const CurrencySymbol = ({ values, setFieldValue }) => {
    useEffect(() => {
        setFieldValue("symbol", values['code'] ? AllCurrencyData.find((el) => el.currency_code == values['code'])?.currency_symbol : '')
    }, [values['code']])
    return (
        <SimpleInputField nameList={[{ name: "symbol", title: "Symbol", disabled: true, require: "true" }]} />
    )
}

export default CurrencySymbol