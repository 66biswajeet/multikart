import { Form, Formik } from "formik";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiUploadCloud2Line } from "react-icons/ri";
import { Row, TabContent, TabPane } from "reactstrap";
import ShowModal from "../../../../elements/alerts&Modals/Modal";
import Btn from "../../../../elements/buttons/Btn";
import { selectImageReducer } from "../../../../utils/allReducers";
import request from "../../../../utils/axiosUtils";
import { attachment, createAttachment } from "../../../../utils/axiosUtils/API";
import useCreate from "../../../../utils/hooks/useCreate";
import usePermissionCheck from "../../../../utils/hooks/usePermissionCheck";
import { YupObject, requiredSchema } from "../../../../utils/validation/ValidationSchemas";
import FileUploadBrowser from "../../../inputFields/FileUploadBrowser";
import TableBottom from "../../../table/TableBottom";
import AttachmentFilter from "../AttachmentFilter";
import ModalButton from "./ModalButton";
import ModalData from "./ModalData";
import ModalNav from "./ModalNav";
import { useRouter } from "next/navigation";
import useCustomQuery from "@/utils/hooks/useCustomQuery";

const AttachmentModal = (props) => {
    const { modal, setModal, setFieldValue, name, setSelectedImage, isAttachment, multiple, values, showImage, redirectToTabs, noAPICall ,selectedImage ,paramsProps, uploadOnly } = props
    const [create] = usePermissionCheck(["create"], "attachment");    
    const { t } = useTranslation( 'common');
    // Start with upload tab (2) if uploadOnly is true, otherwise start with select tab (1)
    const [tabNav, setTabNav] = useState(uploadOnly ? 2 : 1);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [paginate, setPaginate] = useState(50);
    const [sorting, setSorting] = useState("");
    const router = useRouter()
    const [state, dispatch] = useReducer(selectImageReducer, { selectedImage: [], isModalOpen: "", setBrowserImage: '' });
    const { data: attachmentsData, refetch } = useCustomQuery([attachment], () => request({ url: attachment, params: {  search, sort: sorting, paginate: paginate, page ,...paramsProps } },router), { enabled: false, refetchOnWindowFocus: false, select: (data) => data?.data });
    const { mutate, isLoading } = useCreate(createAttachment, false, !redirectToTabs && "/attachment", redirectToTabs ? "No" : false, (responseData) => {
        refetch();
        
        // If uploadOnly mode, set the uploaded images and close modal
        if (uploadOnly && responseData?.data) {
            const uploadedFiles = responseData.data;
            
            // Handle the uploaded file(s) and set them in the form
            if (multiple) {
                // For multiple files
                const existingImages = values?.[name.split('_id')[0]] || [];
                const newImages = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
                const updatedImages = [...existingImages, ...newImages];
                
                setFieldValue(name.split('_id')[0], updatedImages);
                setFieldValue(name, updatedImages.map(img => img.id || img._id));
                setSelectedImage(updatedImages);
            } else {
                // For single file
                const uploadedFile = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;
                setFieldValue(name.split('_id')[0], uploadedFile);
                setFieldValue(name, uploadedFile.id || uploadedFile._id);
                setSelectedImage([uploadedFile]);
            }
            
            // Close modal immediately
            setModal(false);
        } else {
            // Original behavior for non-uploadOnly mode
            !redirectToTabs && setModal(false);
            redirectToTabs && setTabNav(uploadOnly ? 2 : 1);
        }
    });
    useEffect(() => {
        modal && !noAPICall && refetch();
        isAttachment && setTabNav(2)
    }, [search, sorting, page, paginate, modal]);    
    useEffect(() => {
        dispatch({ type: "SELECTEDIMAGE", payload: selectedImage})
    }, [modal]);

    return (
        <ShowModal open={modal} setModal={setModal} modalAttr={{ className: "media-modal modal-dialog modal-dialog-centered modal-xl" }} close={true} title={uploadOnly ? "UploadMedia" : "InsertMedia"} noClass={true}
            buttons={tabNav === 1 && !uploadOnly && <ModalButton setModal={setModal} dispatch={dispatch} state={state} name={name} setSelectedImage={setSelectedImage} attachmentsData={attachmentsData?.data} setFieldValue={setFieldValue} tabNav={tabNav} multiple={multiple} mutate={mutate} isLoading={isLoading} values={values} showImage={showImage} />}>
            {/* Only show navigation tabs if not uploadOnly mode */}
            {!uploadOnly && <ModalNav tabNav={tabNav} setTabNav={setTabNav} isAttachment={isAttachment} />}
            <TabContent activeTab={tabNav}>
                {/* Only show select tab if not in uploadOnly mode */}
                {!isAttachment && !uploadOnly && <TabPane className={tabNav == 1 ? "fade active show" : ""} id="upload">
                    <AttachmentFilter setSearch={setSearch} setSorting={setSorting} />
                    {<div className="content-section select-file-section py-0 ratio2_3">
                        {<Row xxl={6} xl={5} lg={4} sm={3} xs={2} className="g-sm-3 g-2 py-0 media-library-sec ratio_square">
                            <ModalData isModal={true} attachmentsData={attachmentsData?.data} state={state} refetch={refetch} dispatch={dispatch} multiple={multiple} redirectToTabs={redirectToTabs} />
                        </Row>}
                        { attachmentsData?.data?.length > 0 && <TableBottom current_page={attachmentsData?.current_page} total={attachmentsData?.total} per_page={attachmentsData?.per_page} setPage={setPage} />}
                    </div>}
                </TabPane>}
                {create && <TabPane className={tabNav == 2 ? "fade active show" : ""} id="select">
                    {<div className="content-section drop-files-sec">
                        <div>
                            <RiUploadCloud2Line />
                            <Formik
                                initialValues={{ attachments: "" }}
                                validationSchema={YupObject({ attachments: requiredSchema })}
                                onSubmit={(values, { resetForm }) => {
                                    console.log("📤 Upload form submitted");
                                    console.log("📤 Values:", values);
                                    console.log("📤 Attachments:", values.attachments);
                                    
                                    let formData = new FormData();
                                    
                                    // Handle FileList or array of files
                                    if (values.attachments) {
                                        const files = values.attachments;
                                        
                                        // If it's a FileList or array-like object
                                        if (files.length) {
                                            // Use 'attachments' as the field name (not 'attachments[i]')
                                            Array.from(files).forEach((file) => {
                                                console.log("📎 Appending file:", file.name, file.type, file.size);
                                                formData.append('attachments', file);
                                            });
                                        }
                                    }
                                    
                                    // Log FormData contents
                                    console.log("📦 FormData entries:");
                                    for (let pair of formData.entries()) {
                                        console.log("  ", pair[0], ":", pair[1]);
                                    }
                                    
                                    // Call mutate to upload the files
                                    mutate(formData);
                                    
                                    // Reset form
                                    resetForm();
                                }}>
                                {({ values, setFieldValue, errors }) => (
                                    <Form className="theme-form theme-form-2 mega-form">
                                        <div>
                                            <div className="dflex-wgap justify-content-center ms-auto save-back-button">
                                                <h2>{t("Dropfilesherepaste")} <span>{t("or")}</span>
                                                    <FileUploadBrowser errors={errors} id="attachments" name="attachments" type="file" multiple={true} values={values} setFieldValue={setFieldValue} dispatch={dispatch} accept="*/*" />
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            {values?.attachments?.length > 0 &&
                                                <a href="#javascript" onClick={() => setFieldValue('attachments', "")}>{t("Clear")}</a>
                                            }
                                            <Btn type="submit" className="ms-auto" title={uploadOnly ? "Upload" : "Insert Media"} loading={Number(isLoading)} />
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>}
                </TabPane>}
            </TabContent>
        </ShowModal>
    );
};
export default AttachmentModal;