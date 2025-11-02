'use client'
import React, { useState } from 'react'
import { Col } from 'reactstrap'
import { PagesAPI } from '@/utils/axiosUtils/API';
import AllPagesTable from '@/components/pages';

const Pages = () => {
    const [isCheck, setIsCheck] = useState([]);
    return (
        <Col sm="12">
            <AllPagesTable url={PagesAPI} moduleName="Page" isCheck={isCheck} setIsCheck={setIsCheck} />
        </Col>
    )
}

export default Pages