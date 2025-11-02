import { AllCountryCode } from "../../../data/AllCountryCode";
import SearchableSelectInput from "../../inputFields/SearchableSelectInput";
import CheckBoxField from "../../inputFields/CheckBoxField";
import SimpleInputField from "../../inputFields/SimpleInputField";
import { useTranslation } from "react-i18next";

const CreateUser = ({ updateId, fixedRole, rolesData }) => {
  const { t } = useTranslation("common");
  return (
    <>
      <SimpleInputField
        nameList={[
          { name: "name", placeholder: t("EnterFullName"), require: "true" },
          {
            type: "email",
            name: "email",
            placeholder: t("EnterEmailAddress"),
            require: "true",
          },
        ]}
      />
      <div className="country-input mb-4">
        <SimpleInputField
          nameList={[
            {
              name: "phone",
              type: "number",
              placeholder: t("EnterPhoneNumber"),
              require: "true",
            },
          ]}
        />
        <SearchableSelectInput
          nameList={[
            {
              name: "country_code",
              notitle: "true",
              inputprops: {
                name: "country_code",
                id: "country_code",
                options: AllCountryCode,
              },
            },
          ]}
        />
      </div>
      <div>
        {!updateId && (
          <>
            <SimpleInputField
              nameList={[
                { name: "password", type: "password", placeholder: t("EnterPassword"), require: "true" },
                { name: "password_confirmation", title: "ConfirmPassword", type: "password", placeholder: t("EnterConfirmPassword"), require: "true" },
              ]}
            />
          </>
        )}
      </div>

      {!fixedRole && (
        <>
          <SearchableSelectInput
            nameList={[
              {
                name: "role",
                require: "true",
                title: "Role",
                getValuesKey: "_id",
                inputprops: {
                  name: "role",
                  id: "role",
                  options: rolesData || [],
                  defaultOption: "Select state",
                  initialTittle:"Select Role"
                },
              },
            ]}
          />
          <CheckBoxField name="status" />
        </>
      )}
    </>
  );
};

export default CreateUser;
