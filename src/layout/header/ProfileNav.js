"use client";
import useOutsideDropdown from "@/utils/hooks/customHooks/useOutsideDropdown";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  RiArrowDownSLine,
  RiLogoutBoxLine,
  RiQuestionLine,
  RiUserLine,
  RiShieldUserLine,
  RiStore2Line,
} from "react-icons/ri";
import { Media } from "reactstrap";
import Avatar from "../../components/commonComponent/Avatar";
import ShowModal from "../../elements/alerts&Modals/Modal";
import Btn from "../../elements/buttons/Btn";
import AccountContext from "../../helper/accountContext";
import { logout, isAdmin, getAuthUser } from "@/utils/auth";

const ProfileNav = () => {
  const { ref, isComponentVisible, setIsComponentVisible } =
    useOutsideDropdown(false);
  const [profileModal, setProfileModal] = useState(false);
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);
  const router = useRouter();
  const { accountData, accountContextData } = useContext(AccountContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  const isStateData =
    (accountContextData.image &&
      Object?.keys(accountContextData.image).length > 0) ||
    accountContextData.image == "";

  useEffect(() => {
    const user = getAuthUser();
    setCurrentUser(user);
    setUserIsAdmin(isAdmin());
  }, []);

  const handleLogout = () => {
    logout();
  };

  // --- REQUIREMENT: GET FIRST NAME ONLY ---
  // We extract the name from available sources and take only the first word [cite: 166, 295]
  const fullName =
    currentUser?.name || accountContextData.name || accountData?.name;
  const firstName = fullName ? fullName.split(" ")[0] : t("Guest");

  return (
    <>
      <li className="profile-nav onhover-dropdown p-0 me-0">
        <Media
          className="profile-media"
          onClick={() => {
            setIsComponentVisible((prev) => !prev),
              setProfileModal(!profileModal);
          }}
        >
          <Avatar
            data={
              isStateData
                ? accountContextData.image
                : accountData?.profile_image
            }
            name={accountData}
            customClass={"rounded-circle"}
          />
          <Media body className="profile-media-body">
            {" "}
            {/* Changed class to avoid potential 'hide' rules */}
            <div className="media-body">
              <span className="f-w-600 d-block">
                {t("Hello")}, {firstName}
              </span>
              <p className="mb-0 font-roboto">
                {userIsAdmin
                  ? "Admin"
                  : accountData?.role?.name || t("Account")}
                <i className="middle ri-arrow-down-s-line"></i>
              </p>
            </div>
          </Media>
        </Media>
        <ul
          ref={ref}
          className={`profile-dropdown onhover-show-div ${
            profileModal ? "active" : ""
          }`}
        >
          <li>
            <Link href={"/account"}>
              <RiUserLine />
              <span>{t("MyAccount")}</span>
            </Link>
          </li>
          {userIsAdmin && (
            <li>
              <Link href={"/user"}>
                <RiShieldUserLine />
                <span>Manage Users</span>
              </Link>
            </li>
          )}

          {/* Vendor Dashboard Link */}
          {accountData?.store &&
            accountData.store.vendor_status === "Approved" && (
              <li>
                <Link href="/vendor/dashboard">
                  <RiStore2Line />
                  <span>Vendor Dashboard</span>
                </Link>
              </li>
            )}

          <li>
            <a onClick={() => setModal(true)}>
              <RiLogoutBoxLine />
              <span>{t("Logout")}</span>
            </a>
          </li>
        </ul>
      </li>
      <ShowModal
        open={modal}
        close={false}
        buttons={
          <>
            <Btn
              title="No"
              onClick={() => setModal(false)}
              className="btn-md btn-outline fw-bold"
            />
            <Btn
              title="Yes"
              onClick={() => handleLogout()}
              className="btn-theme btn-md fw-bold"
            />
          </>
        }
      >
        <div className="remove-box">
          <div className="remove-icon">
            <RiQuestionLine className="icon-box wo-bg" />
          </div>
          <h5 className="modal-title">{t("Confirmation")}</h5>
          <p>{t("Areyousureyouwanttoproceed?")} </p>
        </div>
      </ShowModal>
    </>
  );
};

export default ProfileNav;
