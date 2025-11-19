import { Form, Formik } from "formik";
import { useEffect, useState } from "react"; // Removed unused 'useContext'
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
// import AccountContext from '../../helper/accountContext'; // Removed unused import
import { AddressAPI } from "../../utils/axiosUtils/API";
import useCreate from "../../utils/hooks/useCreate";
import useCustomQuery from "../../utils/hooks/useCustomQuery";
import request from "../../utils/axiosUtils";
import { useRouter } from "next/navigation";
import SimpleInputField from "../inputFields/SimpleInputField";
import SearchableSelectInput from "../inputFields/SearchableSelectInput";
import CheckBoxField from "../inputFields/CheckBoxField";
import {
  YupObject,
  nameSchema,
} from "../../utils/validation/ValidationSchemas";
import Btn from "../../elements/buttons/Btn";

const AddressTab = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);

  // Fetch addresses
  const { data: addressesData, refetch } = useCustomQuery(
    ["addresses"], // Query key
    () => request({ url: AddressAPI }, router), // API call
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (addressesData?.data?.data) {
      setAddresses(addressesData.data.data);
    }
  }, [addressesData]);

  const { mutate: createAddress, isLoading: isCreating } = useCreate(
    AddressAPI, // API endpoint
    false,
    false,
    false,
    () => {
      // onSuccess
      refetch();
      setModal(false);
    }
  );

  const { mutate: updateAddress, isLoading: isUpdating } = useCreate(
    editingAddress ? `${AddressAPI}/${editingAddress.id}` : AddressAPI, // Dynamic API endpoint
    false,
    false,
    false,
    () => {
      // onSuccess
      refetch();
      setModal(false);
      setEditingAddress(null);
    }
  );

  const handleDelete = async (addressId) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await request(
          {
            url: `${AddressAPI}/${addressId}`,
            method: "delete",
          },
          router
        );
        refetch();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setModal(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setModal(true);
  };

  const initialValues = editingAddress
    ? {
        label: editingAddress.label || "Home",
        street: editingAddress.street || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        country: editingAddress.country || "",
        zip: editingAddress.zip || "",
        phone: editingAddress.phone || "",
        is_default: editingAddress.is_default || false,
      }
    : {
        label: "Home",
        street: "",
        city: "",
        state: "",
        country: "",
        zip: "",
        phone: "",
        is_default: false,
      };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h5>My Addresses</h5>
        <Button color="primary" onClick={handleAddNew}>
          + Add New Address
        </Button>
      </div>

      <div className="row">
        {addresses.map((address) => (
          <div key={address.id} className="col-md-6 mb-3">
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <span>
                  {address.label}
                  {address.is_default && (
                    <span className="badge bg-success ms-2">Default</span>
                  )}
                </span>
                <div>
                  <Button
                    size="sm"
                    color="info"
                    onClick={() => handleEdit(address)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state}
                </p>
                <p>
                  {address.country} - {address.zip}
                </p>
                {address.phone && <p>Phone: {address.phone}</p>}
              </CardBody>
            </Card>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-5">
          <p>No addresses found. Add your first address!</p>
        </div>
      )}

      <Modal
        isOpen={modal}
        toggle={() => {
          setModal(false);
          setEditingAddress(null);
        }}
      >
        <ModalHeader
          toggle={() => {
            setModal(false);
            setEditingAddress(null);
          }}
        >
          {editingAddress ? "Edit Address" : "Add New Address"}
        </ModalHeader>
        <ModalBody>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={YupObject({
              street: nameSchema,
              city: nameSchema,
              state: nameSchema,
              country: nameSchema,
              zip: nameSchema,
            })}
            onSubmit={(values) => {
              if (editingAddress) {
                values["_method"] = "put";
                updateAddress(values);
              } else {
                createAddress(values);
              }
            }}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <SearchableSelectInput
                  nameList={[
                    {
                      name: "label",
                      title: "Label",
                      inputprops: {
                        name: "label",
                        id: "label",
                        options: [
                          { id: "Home", name: "Home" },
                          { id: "Office", name: "Office" },
                          { id: "Other", name: "Other" },
                        ],
                      },
                    },
                  ]}
                />
                <SimpleInputField
                  nameList={[
                    {
                      name: "street",
                      title: "Street",
                      require: "true",
                      placeholder: "Enter Street",
                    },
                    {
                      name: "city",
                      title: "City",
                      require: "true",
                      placeholder: "Enter City",
                    },
                    {
                      name: "state",
                      title: "State",
                      require: "true",
                      placeholder: "Enter State",
                    },
                    {
                      name: "country",
                      title: "Country",
                      require: "true",
                      placeholder: "Enter Country",
                    },
                    {
                      name: "zip",
                      title: "ZIP Code",
                      require: "true",
                      placeholder: "Enter ZIP Code",
                    },
                    {
                      name: "phone",
                      title: "Phone (Optional)",
                      placeholder: "Enter Phone",
                    },
                  ]}
                />
                <CheckBoxField
                  name="is_default"
                  title="Set as Default Address"
                />
                <div className="mt-3">
                  <Btn
                    type="submit"
                    title={editingAddress ? "Update Address" : "Add Address"}
                    loading={Number(isCreating || isUpdating)}
                    className="btn btn-theme me-2"
                  />
                  <Button
                    color="secondary"
                    onClick={() => {
                      setModal(false);
                      setEditingAddress(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AddressTab;
