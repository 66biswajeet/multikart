"use client"
import React, { useState } from 'react'
import { Col } from 'reactstrap';
import { ReviewAPI } from '@/utils/axiosUtils/API';
import AllReviewsTable  from '@/components/reviews';

const Reviews = () => {
    const [isCheck, setIsCheck] = useState([]);
    return (
        <Col sm="12">
            <AllReviewsTable url={ReviewAPI} moduleName="Reviews" onlyTitle={true} isCheck={isCheck} setIsCheck={setIsCheck} />
        </Col>
    )
}

export default Reviews