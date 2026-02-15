"use client";
import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { RiImageLine, RiPaletteLine, RiLayoutLine } from "react-icons/ri";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import Loader from "@/components/commonComponent/Loader";
import { Formik, Form } from "formik";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import SimpleInputField from "@/components/inputFields/SimpleInputField";
import SimpleFileUploadField from "@/components/inputFields/SimpleFileUploadField";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { useRouter } from "next/navigation";

const StoreCustomizationForm = ({ title }) => {
  const [activeTab, setActiveTab] = useState("carousel");
  const router = useRouter();

  // Fetch existing customization data
  const {
    data: customizationData,
    isLoading,
    refetch,
  } = useCustomQuery(
    ["storeCustomization"],
    () => request({ url: "/store-customization" }, router),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      select: (res) => res?.data?.data || {},
    },
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="page-title">
        <Row>
          <Col sm={6}>
            <h3>{title}</h3>
          </Col>
        </Row>
      </div>

      <Formik
        enableReinitialize
        initialValues={{
          carousel_image_1:
            customizationData?.carousel_images?.[0]?.image || "",
          carousel_image_1_link:
            customizationData?.carousel_images?.[0]?.link || "",
          carousel_image_2:
            customizationData?.carousel_images?.[1]?.image || "",
          carousel_image_2_link:
            customizationData?.carousel_images?.[1]?.link || "",
          carousel_image_3:
            customizationData?.carousel_images?.[2]?.image || "",
          carousel_image_3_link:
            customizationData?.carousel_images?.[2]?.link || "",
          carousel_image_4:
            customizationData?.carousel_images?.[3]?.image || "",
          carousel_image_4_link:
            customizationData?.carousel_images?.[3]?.link || "",
          carousel_image_5:
            customizationData?.carousel_images?.[4]?.image || "",
          carousel_image_5_link:
            customizationData?.carousel_images?.[4]?.link || "",
          site_logo: customizationData?.site_logo || "",
          site_logo_dark: customizationData?.site_logo_dark || "",
          favicon: customizationData?.favicon || "",
          hero_title: customizationData?.hero_title || "",
          hero_subtitle: customizationData?.hero_subtitle || "",
          banner_image_1: customizationData?.banners?.[0]?.image || "",
          banner_image_1_link: customizationData?.banners?.[0]?.link || "",
          banner_image_2: customizationData?.banners?.[1]?.image || "",
          banner_image_2_link: customizationData?.banners?.[1]?.link || "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const formData = new FormData();

            // Add carousel images
            for (let i = 1; i <= 5; i++) {
              const imageField = `carousel_image_${i}`;
              if (values[imageField]) {
                if (values[imageField] instanceof File) {
                  // New file uploaded
                  formData.append(imageField, values[imageField]);
                } else if (typeof values[imageField] === "string") {
                  // Existing image URL
                  formData.append(imageField, values[imageField]);
                }
              }
              if (values[`${imageField}_link`]) {
                formData.append(
                  `${imageField}_link`,
                  values[`${imageField}_link`],
                );
              }
            }

            // Add logos
            if (values.site_logo) {
              formData.append("site_logo", values.site_logo);
            }
            if (values.site_logo_dark) {
              formData.append("site_logo_dark", values.site_logo_dark);
            }
            if (values.favicon) {
              formData.append("favicon", values.favicon);
            }

            // Add text content
            if (values.hero_title)
              formData.append("hero_title", values.hero_title);
            if (values.hero_subtitle)
              formData.append("hero_subtitle", values.hero_subtitle);

            // Add banners
            for (let i = 1; i <= 2; i++) {
              const imageField = `banner_image_${i}`;
              if (values[imageField]) {
                if (values[imageField] instanceof File) {
                  formData.append(imageField, values[imageField]);
                } else if (typeof values[imageField] === "string") {
                  formData.append(imageField, values[imageField]);
                }
              }
              if (values[`${imageField}_link`]) {
                formData.append(
                  `${imageField}_link`,
                  values[`${imageField}_link`],
                );
              }
            }

            const response = await request(
              {
                url: "/store-customization",
                method: "POST",
                data: formData,
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
              router,
            );

            if (response.data.success) {
              ToastNotification(
                "success",
                "Store customization saved successfully!",
              );
              refetch();
            } else {
              ToastNotification(
                "error",
                response.data.message || "Failed to save customization",
              );
            }
          } catch (error) {
            console.error("Save error:", error);
            ToastNotification(
              "error",
              error?.response?.data?.message || "Failed to save customization",
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <Card>
              <CardBody>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={activeTab === "carousel" ? "active" : ""}
                      onClick={() => setActiveTab("carousel")}
                      style={{ cursor: "pointer" }}
                    >
                      <RiLayoutLine className="me-2" />
                      Carousel Images
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "logos" ? "active" : ""}
                      onClick={() => setActiveTab("logos")}
                      style={{ cursor: "pointer" }}
                    >
                      <RiImageLine className="me-2" />
                      Logos & Icons
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "banners" ? "active" : ""}
                      onClick={() => setActiveTab("banners")}
                      style={{ cursor: "pointer" }}
                    >
                      <RiPaletteLine className="me-2" />
                      Banners & Content
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab} className="mt-4">
                  {/* Carousel Tab */}
                  <TabPane tabId="carousel">
                    <h5 className="mb-3">
                      Home Page Carousel Images (1920 x 325)
                    </h5>
                    <p className="text-muted mb-4">
                      Upload up to 5 carousel images for the homepage slider
                    </p>

                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="mb-4 p-3 border rounded">
                        <h6>Carousel Image {num}</h6>
                        <Row>
                          <Col md={6}>
                            <SimpleFileUploadField
                              name={`carousel_image_${num}`}
                              title={`Image ${num} (1920x325 recommended)`}
                              values={values}
                              setFieldValue={setFieldValue}
                              errors={errors}
                            />
                          </Col>
                          <Col md={6}>
                            <SimpleInputField
                              nameList={[
                                {
                                  name: `carousel_image_${num}_link`,
                                  placeholder: "Enter link URL (optional)",
                                  title: "Link URL",
                                  label: "Link URL",
                                },
                              ]}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </TabPane>

                  {/* Logos Tab */}
                  <TabPane tabId="logos">
                    <h5 className="mb-3">Site Logos & Icons</h5>
                    <Row>
                      <Col md={4}>
                        <SimpleFileUploadField
                          name="site_logo"
                          title="Site Logo (Light)"
                          values={values}
                          setFieldValue={setFieldValue}
                          errors={errors}
                        />
                      </Col>
                      <Col md={4}>
                        <SimpleFileUploadField
                          name="site_logo_dark"
                          title="Site Logo (Dark)"
                          values={values}
                          setFieldValue={setFieldValue}
                          errors={errors}
                        />
                      </Col>
                      <Col md={4}>
                        <SimpleFileUploadField
                          name="favicon"
                          title="Favicon (32x32)"
                          values={values}
                          setFieldValue={setFieldValue}
                          errors={errors}
                        />
                      </Col>
                    </Row>
                  </TabPane>

                  {/* Banners Tab */}
                  <TabPane tabId="banners">
                    <h5 className="mb-3">Additional Banners & Content</h5>

                    <Row className="mb-4">
                      <Col md={6}>
                        <SimpleInputField
                          nameList={[
                            {
                              name: "hero_title",
                              placeholder: "Enter hero section title",
                              title: "Hero Title",
                              label: "Hero Title",
                            },
                          ]}
                        />
                      </Col>
                      <Col md={6}>
                        <SimpleInputField
                          nameList={[
                            {
                              name: "hero_subtitle",
                              placeholder: "Enter hero section subtitle",
                              title: "Hero Subtitle",
                              label: "Hero Subtitle",
                            },
                          ]}
                        />
                      </Col>
                    </Row>

                    <div className="mb-4 p-3 border rounded">
                      <h6>Banner Image 1</h6>
                      <Row>
                        <Col md={6}>
                          <SimpleFileUploadField
                            name="banner_image_1"
                            title="Banner Image 1"
                            values={values}
                            setFieldValue={setFieldValue}
                            errors={errors}
                          />
                        </Col>
                        <Col md={6}>
                          <SimpleInputField
                            nameList={[
                              {
                                name: "banner_image_1_link",
                                placeholder: "Enter banner link URL",
                                title: "Link URL",
                                label: "Link URL",
                              },
                            ]}
                          />
                        </Col>
                      </Row>
                    </div>

                    <div className="mb-4 p-3 border rounded">
                      <h6>Banner Image 2</h6>
                      <Row>
                        <Col md={6}>
                          <SimpleFileUploadField
                            name="banner_image_2"
                            title="Banner Image 2"
                            values={values}
                            setFieldValue={setFieldValue}
                            errors={errors}
                          />
                        </Col>
                        <Col md={6}>
                          <SimpleInputField
                            nameList={[
                              {
                                name: "banner_image_2_link",
                                placeholder: "Enter banner link URL",
                                title: "Link URL",
                                label: "Link URL",
                              },
                            ]}
                          />
                        </Col>
                      </Row>
                    </div>
                  </TabPane>
                </TabContent>

                <div className="mt-4">
                  <Btn
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Btn>
                </div>
              </CardBody>
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default StoreCustomizationForm;
