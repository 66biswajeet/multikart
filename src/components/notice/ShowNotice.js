import request from "@/utils/axiosUtils";
import { Notice } from "@/utils/axiosUtils/API";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { useRouter } from "next/navigation";
import { RiErrorWarningLine } from "react-icons/ri";

const ShowNotice = () => {
  const router = useRouter()
  const { data } = useCustomQuery([Notice], () => request({ url: Notice },router), {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (res) => res?.data?.data,
  });
  return (
    <>
      {data?.length && (
        <ul className="notification-setting notification-page">
          {data?.map((data, index) => (
            <li
              className={`notice-section ${
                data?.priority === "low" ? "warning" : ""
              }`}
              key={index}
            >
              <div className="notice-content">
                <div className="icon-box">
                  <RiErrorWarningLine />
                </div>
                <div className="notice-box">
                  <h3>{data?.title}</h3>
                  <p dangerouslySetInnerHTML={{ __html: data?.description }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ShowNotice;
