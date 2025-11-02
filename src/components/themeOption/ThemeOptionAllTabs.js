import { Col, TabContent, TabPane } from 'reactstrap'
import GeneralTab from './GeneralTab'
import HeaderTab from './HeaderTab'
import FooterTab from './FooterTab'
import CollectionProduct from './CollectionProduct'
import ProductLayout from './ProductLayout'
import SellerTab from './SellerTab'
import BlogTab from './BlogTab'
import ContactPageTab from './ContactPageTab'
import ErrorPage from './ErrorPage'
import SeoTab from './SeoTab'
import { Category } from '../../utils/axiosUtils/API'
import request from '../../utils/axiosUtils'
import Loader from '../commonComponent/Loader'
import AboutUsTab from './aboutUs'
import PopupTab from './popup'
import { useRouter } from 'next/navigation'
import useCustomQuery from '@/utils/hooks/useCustomQuery'

const ThemeOptionAllTabs = ({ activeTab, values, setFieldValue, errors, touched }) => {
    const router = useRouter();
    const { data: categoryData, isLoading } = useCustomQuery([Category], () => request({ url: Category, params: { status: 1 } },router), { refetchOnWindowFocus: false, select: (data) => data.data.data });
    if (isLoading) return <Loader />;
    return (
        <Col xl="7" lg="8">
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1"><GeneralTab values={values} setFieldValue={setFieldValue} errors={errors} /></TabPane>
                <TabPane tabId="2"><HeaderTab values={values} setFieldValue={setFieldValue} categoryData={categoryData} /></TabPane>
                <TabPane tabId="3"><FooterTab values={values} setFieldValue={setFieldValue} errors={errors} categoryData={categoryData} /></TabPane>
                <TabPane tabId="4"><CollectionProduct values={values} setFieldValue={setFieldValue} /></TabPane>
                <TabPane tabId="5"><ProductLayout values={values} setFieldValue={setFieldValue} errors={errors} /></TabPane>
                <TabPane tabId="6"><BlogTab values={values} setFieldValue={setFieldValue} /></TabPane>
                <TabPane tabId="7"><SellerTab values={values} setFieldValue={setFieldValue} errors={errors} touched={touched} /></TabPane>
                <TabPane tabId="8"><AboutUsTab values={values} setFieldValue={setFieldValue} /></TabPane>
                <TabPane tabId="9"><ContactPageTab values={values} setFieldValue={setFieldValue} /></TabPane>
                <TabPane tabId="10"><ErrorPage values={values} /></TabPane>
                <TabPane tabId="11"><PopupTab values={values} /></TabPane>
                <TabPane tabId="12"><SeoTab values={values} setFieldValue={setFieldValue} errors={errors} /></TabPane>
            </TabContent>
        </Col>
    )
}

export default ThemeOptionAllTabs