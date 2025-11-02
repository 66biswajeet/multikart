import { Form, Formik } from 'formik';
import { useTranslation } from "react-i18next";
import Btn from '../../elements/buttons/Btn';
import { updateProfilePassword } from '../../utils/axiosUtils/API';
import useCreate from '../../utils/hooks/useCreate';
import { YupObject, nameSchema, passwordConfirmationSchema, passwordSchema } from '../../utils/validation/ValidationSchemas';
import SimpleInputField from '../inputFields/SimpleInputField';

const ProfilePasswordTab = () => {
    
    const { t } = useTranslation( 'common');
    const { mutate, isLoading } = useCreate(updateProfilePassword, false, "/account");
    return (
        <Formik
            enableReinitialize
            initialValues={{
                current_password: "",
                password: "",
                password_confirmation: ""
            }}
            validationSchema={YupObject({
                current_password: nameSchema,
                password: passwordSchema,
                password_confirmation: passwordConfirmationSchema
            })}
            onSubmit={(values) => {
                // Put your logic here
                 values = { }
            }}>
            {({ values, setFieldValue }) => (
                <Form className="theme-form theme-form-2 mega-form">
                    <SimpleInputField nameList={[{ name: 'current_password', title: 'Current Password', placeholder: t('EnterCurrentPassword'), require: "true",type:'password' }, { name: 'password', title: 'Password', require: "true", placeholder: t("EnterNewPassword"),type:'password' }, { name: 'password_confirmation', title: 'Confirm Password', require: "true", placeholder: t("EnterConfirmPassword"),type:'password' }]} />
                    <Btn className="btn btn-theme ms-auto mt-4" type="submit" title="Save" loading={Number(isLoading)} />
                </Form>
            )}
        </Formik>
    )
}

export default ProfilePasswordTab