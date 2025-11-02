"use client"
import React, { useState } from 'react'
import { Col } from 'reactstrap';
import { Subscribe } from '@/utils/axiosUtils/API';
import AllSubscriptionTable  from '@/components/subscriptions';

const Subscription = () => {
    const [isCheck, setIsCheck] = useState([]);
    return (
        <Col sm="12">
            <AllSubscriptionTable  url={Subscribe} moduleName="Subscription" onlyTitle={true} isCheck={isCheck} setIsCheck={setIsCheck} />
        </Col>
    )
}

export default Subscription