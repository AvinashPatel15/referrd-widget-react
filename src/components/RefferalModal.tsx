/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Toast from "./Toast";

interface ReferralModalProps {
  refferalModal: any;
  setRefferalModal: any;
  refferalModalData: any;
  rfrd: Function;
  referrd_referral: any;
  referrd_uuid: any;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "default";
}

const RefferalModal: React.FC<ReferralModalProps> = ({
  refferalModal,
  setRefferalModal,
  refferalModalData,
  rfrd = () => {},
  referrd_referral,
  referrd_uuid,
}) => {
  // State to manage toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State to manage the step of the modal (registration form or referral link sharing)
  const [modalStep, setModalStep] = useState(1);

  // State to manage form data for user registration
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "db5ccca4-f6dd-4217-8df4-0bb237f1a543",
    mobile: "",
    is_signup: false,
    role: "2f9b699f-fbe3-48b8-8cf6-6726f9a32a55",
  });

  // Ref for the input element to copy the referral link
  const inputRef = useRef<HTMLInputElement>(null);

  // State to manage referral slug and form errors
  const [refferalSlug, setRefferalSlug] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // Background and text colors based on referral modal data
  const ModalBGColor = refferalModalData?.primary_color;
  const TextColor = refferalModalData?.secondary_color;

  //   Import BASE_URL
  const BASE_URL = "https://api.referrd.com.au";

  const ReferralURL = "https://referrd.link/to";

  const Message = "Use my referral link ";

  const showToastWithMessage = (
    message: string,
    type: "success" | "error" | "warning" | "default"
  ) => {
    const newToast: Toast = {
      id: Date.now(),
      message,
      type,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    setTimeout(() => {
      hideToast(newToast.id);
    }, 2000); // Auto hide after 2 seconds
  };

  const hideToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        hideToast(toast.id);
      }, 2000); // Auto hide after 2 seconds

      return () => clearTimeout(timer);
    });
  }, [toasts]);

  // Function to copy text to clipboard
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(inputRef.current?.value || "");
      console.log("Link Copied!");
      showToastWithMessage("Link copied!", "success");
    } catch (err) {
      console.error("Copy failed:", err);
      showToastWithMessage("Copy failed", "error");
    }
  };

  // Function to handle input changes in the registration form
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      setFormData({
        ...formData,
        [name]: "+" + value.split("+")[value.split("+").length - 1],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Function to validate the registration form
  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!formData.first_name) {
      newErrors.first_name = "First name is required";
      valid = false;
    }

    if (!formData.last_name) {
      newErrors.last_name = "Last name is required";
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
      valid = false;
    }

    if (formData.mobile.length !== 13) {
      newErrors.mobile = "Mobile number length should be 13 number";
      valid = false;
    }

    if (!isChecked) {
      newErrors.checkbox = "Please accept the terms and conditions";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Function to handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToastWithMessage("Please fill all inputs!", "warning");
      return;
    }

    // User Create API

    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      const reffferalID = refferalModalData?.id;
      console.log("iddd", reffferalID);

      if (response.ok) {
        console.log("Registration successful!");
        showToastWithMessage("Registration successful!", "success");
        if (referrd_referral && referrd_uuid) {
          rfrd("track", {
            event_type: "conversion",
            user: data.data,
            campaign: refferalModalData,
          });
        }
        // Refferal Create API
        try {
          const referralResponse = await fetch(`${BASE_URL}/items/referrals`, {
            method: "POST",
            headers: {
              Authorization: "Bearer ynix-80V9FtYIOgVNP5wkTk0gkqcp-Wh",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              campaign: reffferalID,
              user: data.data.id,
            }),
          });

          const referralData = await referralResponse.json();

          if (referralResponse.ok) {
            console.log("Referral created successfully!");
            showToastWithMessage("Referral created successfully!", "success");

            setRefferalSlug(referralData.data.slug);
            setModalStep(2);
          } else {
            console.error("Failed to create referral!");
            showToastWithMessage("Failed to create referral!", "error");
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        if (response.status === 400) {
          showToastWithMessage("Already signed up!", "warning");
        } else {
          showToastWithMessage("Registration failed!", "error");
        }
        console.error("Registration failed!");
      }

      console.log(formData);
      console.log(response);
    } catch (error) {
      console.log("Error occurred while sending the request", error);
      showToastWithMessage("Something went wrong!", "error");
    }
  };

  return (
    <>
      {/* <div
        className={`${
          refferalModal ? "flex" : "none"
        } justify-center items-center h-full w-full bg-black bg-opacity-70 fixed inset-0 z-[100]`}
      > */}

      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: `${refferalModal ? "flex" : "none"}`,
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        }}
      >
        {/* Toast */}
        <div
          style={{
            position: "fixed",
            top: "5px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "100",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} message={toast.message} type={toast.type} />
          ))}
        </div>
        {/* Modal */}
        {/* <div className="flex flex-col gap-2 w-[95%] md:w-[70%] xl:w-[40%]"> */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            width: "45%",
            // "@media (min-width: 768px)": { width: "70%" },
            // "@media (min-width: 1280px)": { width: "40%" },
          }}
        >
          {/* Close Button */}
          {/* <div className="w-full flex justify-end"> */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {/* <RefferalModalCloseButton setRefferalModal={setRefferalModal} /> */}
            <button
              onClick={() => setRefferalModal(false)}
              // className="bg-[white] p-[2px] rounded-sm"
              style={{
                borderRadius: "0.125rem",
                background: "white",
                padding: "2px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}

          <div
            style={{
              backgroundColor: `${
                refferalModalData.primary_color ? `${ModalBGColor}` : "white"
              }`,
              borderRadius: "0.125rem",
              width: "100%",
              height: "380px",
            }}
            // className={`w-full rounded-sm h-[600px] md:h-[350px]`}
          >
            {/* modal body div 1 */}
            {/* <div className="w-full h-full flex flex-col md:flex-row"> */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                height: "100%",
              }}
            >
              {/* Modal Image */}
              {/* <div className="h-[30%] md:h-full w-full md:w-[50%]"> */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                {/* <div className="h-full relative"> */}
                <div style={{ height: "100%", position: "relative" }}>
                  <img
                    src={
                      refferalModalData?.campaign_image
                        ? `${BASE_URL}/assets/${refferalModalData.campaign_image}`
                        : `https://wallpapercave.com/dwp1x/wp8572585.jpg`
                    }
                    width="100%"
                    // className="h-full object-cover object-center brightness-50"
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                      height: "100%",
                      filter: "brightness(0.6)",
                    }}
                  />
                  {/* <h1 className="absolute left-2 top-[20%] text-white text-4xl"> */}
                  <h1
                    style={{
                      position: "absolute",
                      left: "0.5rem",
                      fontSize: "25px",
                      color: "#ffffff",
                      top: "20%",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {refferalModalData?.campaign_widget_text
                      ? refferalModalData?.campaign_widget_text
                      : "$2 Per Refferal"}
                  </h1>
                </div>
              </div>

              {/* Form Div */}
              {/* <div className="p-4 h-[70%] md:h-full w-full md:w-[50%] flex justify-center items-center"> */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "1rem",
                }}
              >
                {modalStep === 1 && (
                  <form
                    // className={`${
                    //   modalStep === 1 ? "flex" : "none"
                    // } flex-col w-full gap-[10px]`}
                    style={{
                      display: `${modalStep === 1 ? "flex" : "none"}`,
                      flexDirection: "column",
                      width: "100%",
                      gap: "10px",
                    }}
                    onSubmit={handleSubmit}
                  >
                    {/* Name */}
                    {/* <div className="flex gap-2 w-full"> */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.5rem",
                        width: "100%",
                      }}
                    >
                      {/* <div className="w-[50%]"> */}
                      <div style={{ width: "50%" }}>
                        <label
                          htmlFor="first_name"
                          // className="block text-sm font-medium leading-6 text-gray-900"
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            lineHeight: "1.25rem",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          First Name
                        </label>
                        <div>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            // className={`block w-full rounded-md border-1 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset  placeholder:text-gray-400 sm:text-sm sm:leading-6 ${
                            //   errors.first_name
                            //     ? "ring-red-500"
                            //     : "ring-gray-300"
                            // }`}
                            style={{
                              padding: "0.375rem",
                              borderRadius: "0.375rem",
                              width: "100%",
                              color: "#111827",
                              borderWidth: "1px",
                              borderColor: `${
                                errors.first_name ? "#EF4444" : "#D1D5DB"
                              }`,
                            }}
                            placeholder="Avinash"
                          />
                          {errors.first_name && (
                            // <span className="text-red-500 text-[13px]">
                            <span
                              style={{ color: "#EF4444", fontSize: "13px" }}
                            >
                              {errors.first_name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ width: "50%" }}>
                        <label
                          htmlFor="last_name"
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            lineHeight: "1.25rem",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                          // className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Last Name
                        </label>
                        <div>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            // className={`block w-full rounded-md border-1 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset  placeholder:text-gray-400 sm:text-sm sm:leading-6 ${
                            //   errors.last_name
                            //     ? "ring-red-500"
                            //     : "ring-gray-300"
                            // }`}
                            style={{
                              padding: "0.375rem",
                              borderRadius: "0.375rem",
                              width: "100%",
                              color: "#111827",
                              borderWidth: "1px",
                              borderColor: `${
                                errors.last_name ? "#EF4444" : "#D1D5DB"
                              }`,
                            }}
                            placeholder="Patel"
                          />
                          {errors.last_name && (
                            // <span className="text-red-500 text-[13px]">
                            <span
                              style={{ color: "#EF4444", fontSize: "13px" }}
                            >
                              {errors.last_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        // className="block text-sm font-medium leading-6 text-gray-900"
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          lineHeight: "1.25rem",
                          fontWeight: 500,
                          color: "#111827",
                        }}
                      >
                        Email
                      </label>
                      <div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          // className={`block w-full rounded-md border-1 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset  placeholder:text-gray-400 sm:text-sm sm:leading-6 ${
                          //   errors.email ? "ring-red-500" : "ring-gray-300"
                          // }`}
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.375rem",
                            width: "100%",
                            color: "#111827",
                            borderWidth: "1px",
                            borderColor: `${
                              errors.email ? "#EF4444" : "#D1D5DB"
                            }`,
                          }}
                          placeholder="avinashpatel@gmail.com"
                        />
                        {errors.email && (
                          // <span className="text-red-500 text-[13px]">
                          <span style={{ color: "#EF4444", fontSize: "13px" }}>
                            {errors.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label
                        htmlFor="mobile"
                        // className="block text-sm font-medium leading-6 text-gray-900"
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          lineHeight: "1.25rem",
                          fontWeight: 500,
                          color: "#111827",
                        }}
                      >
                        Mobile Number
                      </label>
                      <div>
                        <input
                          type="text"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          minLength={13}
                          maxLength={13}
                          // className={`block w-full rounded-md border-1 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset  placeholder:text-gray-400 sm:text-sm sm:leading-6 ${
                          //   errors.mobile ? "ring-red-500" : "ring-gray-300"
                          // }`}
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.375rem",
                            width: "100%",
                            color: "#111827",
                            borderWidth: "1px",
                            borderColor: `${
                              errors.mobile ? "#EF4444" : "#D1D5DB"
                            }`,
                          }}
                          placeholder="1234567890"
                        />
                        {errors.mobile && (
                          // <span className="text-red-500 text-[13px]">
                          <span style={{ color: "#EF4444", fontSize: "13px" }}>
                            {errors.mobile}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Terms And Condition */}
                    {/* <div className="relative flex items-start"> */}
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* <div className="flex h-6 items-center"> */}
                      <div
                        style={{
                          height: "1.5rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <input
                          aria-describedby="terms-conditions"
                          name="comments"
                          type="checkbox"
                          // className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                          style={{
                            borderRadius: "0.25rem",
                            borderColor: "#D1D5DB",
                            width: "1rem",
                            height: "1rem",
                            cursor: "pointer",
                          }}
                          checked={isChecked}
                          onChange={() => setIsChecked(!isChecked)}
                        />
                      </div>
                      {/* <div className="ml-1 text-sm leading-6"> */}
                      <div
                        style={{
                          marginLeft: "0.25rem",
                          fontSize: "0.875rem",
                          lineHeight: "1.25rem",
                        }}
                      >
                        <label htmlFor="comments" style={{ color: "#4B5563" }}>
                          I agree to the{" "}
                          <a
                            target="_blank"
                            href="https://www.referrd.com.au/privacy-policy"
                          >
                            <span
                              style={{
                                color: `${
                                  refferalModalData.secondary_color
                                    ? `${TextColor}`
                                    : "black"
                                }`,
                              }}
                              id="terms-conditions"
                              className={`font-medium`}
                            >
                              Terms and Conditions.
                            </span>
                          </a>
                        </label>
                        {errors.checkbox && (
                          // <p className="text-red-500 text-[13px]">
                          <p style={{ color: "#EF4444", fontSize: "13px" }}>
                            {errors.checkbox}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        style={{
                          backgroundColor: `${
                            refferalModalData.secondary_color
                              ? `${TextColor}`
                              : "black"
                          }`,
                          paddingTop: "0.25rem",
                          paddingBottom: "0.25rem",
                          paddingLeft: "1rem",
                          paddingRight: "1rem",
                          borderRadius: "0.125rem",
                          borderWidth: "1px",
                          color: "#ffffff",
                        }}
                        type="submit"
                        // className={`px-4 py-1 border rounded-sm text-white`}
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                )}

                {modalStep === 2 && (
                  <div
                    // className={`flex flex-col w-full h-full justify-center items-center p-1`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      {/* <h1 className="text-2xl">Referral Link</h1> */}
                      <h1 style={{ fontSize: "1.5rem", lineHeight: "2rem" }}>
                        Referral Link
                      </h1>

                      <div style={{ position: "relative" }}>
                        <input
                          defaultValue={`${ReferralURL}/${refferalSlug}`}
                          ref={inputRef}
                          // className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
                          style={{
                            display: "block",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            borderWidth: "1px",
                            borderColor: "#D1D5DB",
                            width: "100%",
                            fontSize: "0.875rem",
                            lineHeight: "1.25rem",
                            color: "#111827",
                            backgroundColor: "#F9FAFB",
                          }}
                          readOnly
                        />
                        <button
                          onClick={copyText}
                          // className="text-white absolute right-2.5 bottom-2.5 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1"
                          style={{
                            position: "absolute",
                            right: "0.625rem",
                            bottom: "0.625rem",
                            paddingTop: "0.25rem",
                            paddingBottom: "0.25rem",
                            paddingLeft: "1rem",
                            paddingRight: "1rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                            lineHeight: "1.25rem",
                            fontWeight: 500,
                            color: "#ffffff",
                            backgroundColor: "#047857",
                            transition: "background-color 0.3s ease", // Add a smooth transition
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div style={{ width: "100%" }}>
                      {/* <h1 className="text-2xl mt-5">Share</h1> */}
                      <h1
                        style={{
                          marginTop: "1.25rem",
                          fontSize: "1.5rem",
                          lineHeight: "2rem",
                        }}
                      >
                        Share
                      </h1>
                      {/* <div className="w-full flex flex-col justify-between items-center"> */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        {/* <div className="w-full flex items-center justify-between"> */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          {/* Facebook */}
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${ReferralURL}/${refferalSlug}%26platform=facebook`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#3b5998",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 50 50"
                                fill="none"
                                stroke="white"
                                stroke-width="2"
                              >
                                <path d="M 25 3 C 12.861562 3 3 12.861562 3 25 C 3 36.019135 11.127533 45.138355 21.712891 46.728516 L 22.861328 46.902344 L 22.861328 29.566406 L 17.664062 29.566406 L 17.664062 26.046875 L 22.861328 26.046875 L 22.861328 21.373047 C 22.861328 18.494965 23.551973 16.599417 24.695312 15.410156 C 25.838652 14.220896 27.528004 13.621094 29.878906 13.621094 C 31.758714 13.621094 32.490022 13.734993 33.185547 13.820312 L 33.185547 16.701172 L 30.738281 16.701172 C 29.349697 16.701172 28.210449 17.475903 27.619141 18.507812 C 27.027832 19.539724 26.84375 20.771816 26.84375 22.027344 L 26.84375 26.044922 L 32.966797 26.044922 L 32.421875 29.564453 L 26.84375 29.564453 L 26.84375 46.929688 L 27.978516 46.775391 C 38.71434 45.319366 47 36.126845 47 25 C 47 12.861562 37.138438 3 25 3 z M 25 5 C 36.057562 5 45 13.942438 45 25 C 45 34.729791 38.035799 42.731796 28.84375 44.533203 L 28.84375 31.564453 L 34.136719 31.564453 L 35.298828 24.044922 L 28.84375 24.044922 L 28.84375 22.027344 C 28.84375 20.989871 29.033574 20.060293 29.353516 19.501953 C 29.673457 18.943614 29.981865 18.701172 30.738281 18.701172 L 35.185547 18.701172 L 35.185547 12.009766 L 34.318359 11.892578 C 33.718567 11.811418 32.349197 11.621094 29.878906 11.621094 C 27.175808 11.621094 24.855567 12.357448 23.253906 14.023438 C 21.652246 15.689426 20.861328 18.170128 20.861328 21.373047 L 20.861328 24.046875 L 15.664062 24.046875 L 15.664062 31.566406 L 20.861328 31.566406 L 20.861328 44.470703 C 11.816995 42.554813 5 34.624447 5 25 C 5 13.942438 13.942438 5 25 5 z"></path>
                              </svg>
                            </div>
                          </a>

                          {/* Messenger */}
                          <a
                            href={`fb-messenger://share/?link=${`${ReferralURL}/${refferalSlug}%26platform=messenger`}`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#e5e7eb",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 50 50"
                                fill="none"
                                stroke="#3b5998"
                                stroke-width="2"
                              >
                                <path d="M 25 2 C 12.347656 2 2 11.597656 2 23.5 C 2 30.007813 5.132813 35.785156 10 39.71875 L 10 48.65625 L 11.46875 47.875 L 18.6875 44.125 C 20.703125 44.664063 22.800781 45 25 45 C 37.652344 45 48 35.402344 48 23.5 C 48 11.597656 37.652344 2 25 2 Z M 25 4 C 36.644531 4 46 12.757813 46 23.5 C 46 34.242188 36.644531 43 25 43 C 22.835938 43 20.742188 42.6875 18.78125 42.125 L 18.40625 42.03125 L 18.0625 42.21875 L 12 45.375 L 12 38.8125 L 11.625 38.53125 C 6.960938 34.941406 4 29.539063 4 23.5 C 4 12.757813 13.355469 4 25 4 Z M 22.71875 17.71875 L 10.6875 30.46875 L 21.5 24.40625 L 27.28125 30.59375 L 39.15625 17.71875 L 28.625 23.625 Z"></path>
                              </svg>
                            </div>
                          </a>

                          {/* Twitter */}
                          <a
                            href={`https://twitter.com/intent/tweet/?text=${Message}&url=${ReferralURL}/${refferalSlug}%26platform=twitter`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#55acee",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 50 50"
                                fill="white"
                                stroke="white"
                                stroke-width="2"
                              >
                                <path d="M 34.21875 5.46875 C 28.238281 5.46875 23.375 10.332031 23.375 16.3125 C 23.375 16.671875 23.464844 17.023438 23.5 17.375 C 16.105469 16.667969 9.566406 13.105469 5.125 7.65625 C 4.917969 7.394531 4.597656 7.253906 4.261719 7.277344 C 3.929688 7.300781 3.632813 7.492188 3.46875 7.78125 C 2.535156 9.386719 2 11.234375 2 13.21875 C 2 15.621094 2.859375 17.820313 4.1875 19.625 C 3.929688 19.511719 3.648438 19.449219 3.40625 19.3125 C 3.097656 19.148438 2.726563 19.15625 2.425781 19.335938 C 2.125 19.515625 1.941406 19.839844 1.9375 20.1875 L 1.9375 20.3125 C 1.9375 23.996094 3.84375 27.195313 6.65625 29.15625 C 6.625 29.152344 6.59375 29.164063 6.5625 29.15625 C 6.21875 29.097656 5.871094 29.21875 5.640625 29.480469 C 5.410156 29.742188 5.335938 30.105469 5.4375 30.4375 C 6.554688 33.910156 9.40625 36.5625 12.9375 37.53125 C 10.125 39.203125 6.863281 40.1875 3.34375 40.1875 C 2.582031 40.1875 1.851563 40.148438 1.125 40.0625 C 0.65625 40 0.207031 40.273438 0.0507813 40.71875 C -0.109375 41.164063 0.0664063 41.660156 0.46875 41.90625 C 4.980469 44.800781 10.335938 46.5 16.09375 46.5 C 25.425781 46.5 32.746094 42.601563 37.65625 37.03125 C 42.566406 31.460938 45.125 24.226563 45.125 17.46875 C 45.125 17.183594 45.101563 16.90625 45.09375 16.625 C 46.925781 15.222656 48.5625 13.578125 49.84375 11.65625 C 50.097656 11.285156 50.070313 10.789063 49.777344 10.445313 C 49.488281 10.101563 49 9.996094 48.59375 10.1875 C 48.078125 10.417969 47.476563 10.441406 46.9375 10.625 C 47.648438 9.675781 48.257813 8.652344 48.625 7.5 C 48.75 7.105469 48.613281 6.671875 48.289063 6.414063 C 47.964844 6.160156 47.511719 6.128906 47.15625 6.34375 C 45.449219 7.355469 43.558594 8.066406 41.5625 8.5 C 39.625 6.6875 37.074219 5.46875 34.21875 5.46875 Z M 34.21875 7.46875 C 36.769531 7.46875 39.074219 8.558594 40.6875 10.28125 C 40.929688 10.53125 41.285156 10.636719 41.625 10.5625 C 42.929688 10.304688 44.167969 9.925781 45.375 9.4375 C 44.679688 10.375 43.820313 11.175781 42.8125 11.78125 C 42.355469 12.003906 42.140625 12.53125 42.308594 13.011719 C 42.472656 13.488281 42.972656 13.765625 43.46875 13.65625 C 44.46875 13.535156 45.359375 13.128906 46.3125 12.875 C 45.457031 13.800781 44.519531 14.636719 43.5 15.375 C 43.222656 15.578125 43.070313 15.90625 43.09375 16.25 C 43.109375 16.65625 43.125 17.058594 43.125 17.46875 C 43.125 23.71875 40.726563 30.503906 36.15625 35.6875 C 31.585938 40.871094 24.875 44.5 16.09375 44.5 C 12.105469 44.5 8.339844 43.617188 4.9375 42.0625 C 9.15625 41.738281 13.046875 40.246094 16.1875 37.78125 C 16.515625 37.519531 16.644531 37.082031 16.511719 36.683594 C 16.378906 36.285156 16.011719 36.011719 15.59375 36 C 12.296875 35.941406 9.535156 34.023438 8.0625 31.3125 C 8.117188 31.3125 8.164063 31.3125 8.21875 31.3125 C 9.207031 31.3125 10.183594 31.1875 11.09375 30.9375 C 11.53125 30.808594 11.832031 30.402344 11.816406 29.945313 C 11.800781 29.488281 11.476563 29.097656 11.03125 29 C 7.472656 28.28125 4.804688 25.382813 4.1875 21.78125 C 5.195313 22.128906 6.226563 22.402344 7.34375 22.4375 C 7.800781 22.464844 8.214844 22.179688 8.355469 21.746094 C 8.496094 21.3125 8.324219 20.835938 7.9375 20.59375 C 5.5625 19.003906 4 16.296875 4 13.21875 C 4 12.078125 4.296875 11.03125 4.6875 10.03125 C 9.6875 15.519531 16.6875 19.164063 24.59375 19.5625 C 24.90625 19.578125 25.210938 19.449219 25.414063 19.210938 C 25.617188 18.96875 25.695313 18.648438 25.625 18.34375 C 25.472656 17.695313 25.375 17.007813 25.375 16.3125 C 25.375 11.414063 29.320313 7.46875 34.21875 7.46875 Z"></path>
                              </svg>
                            </div>
                          </a>
                        </div>

                        {/* Whatsapp */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <a
                            href={`https://api.whatsapp.com/send?text=${Message}${ReferralURL}/${refferalSlug}%26platform=whatsapp`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#25d366",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 50 50"
                                fill="white"
                                stroke="white"
                                stroke-width="2"
                              >
                                <path d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 29.079097 3.1186875 32.88588 4.984375 36.208984 L 2.0371094 46.730469 A 1.0001 1.0001 0 0 0 3.2402344 47.970703 L 14.210938 45.251953 C 17.434629 46.972929 21.092591 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 21.278025 46 17.792121 45.029635 14.761719 43.333984 A 1.0001 1.0001 0 0 0 14.033203 43.236328 L 4.4257812 45.617188 L 7.0019531 36.425781 A 1.0001 1.0001 0 0 0 6.9023438 35.646484 C 5.0606869 32.523592 4 28.890107 4 25 C 4 13.390466 13.390466 4 25 4 z M 16.642578 13 C 16.001539 13 15.086045 13.23849 14.333984 14.048828 C 13.882268 14.535548 12 16.369511 12 19.59375 C 12 22.955271 14.331391 25.855848 14.613281 26.228516 L 14.615234 26.228516 L 14.615234 26.230469 C 14.588494 26.195329 14.973031 26.752191 15.486328 27.419922 C 15.999626 28.087653 16.717405 28.96464 17.619141 29.914062 C 19.422612 31.812909 21.958282 34.007419 25.105469 35.349609 C 26.554789 35.966779 27.698179 36.339417 28.564453 36.611328 C 30.169845 37.115426 31.632073 37.038799 32.730469 36.876953 C 33.55263 36.755876 34.456878 36.361114 35.351562 35.794922 C 36.246248 35.22873 37.12309 34.524722 37.509766 33.455078 C 37.786772 32.688244 37.927591 31.979598 37.978516 31.396484 C 38.003976 31.104927 38.007211 30.847602 37.988281 30.609375 C 37.969311 30.371148 37.989581 30.188664 37.767578 29.824219 C 37.302009 29.059804 36.774753 29.039853 36.224609 28.767578 C 35.918939 28.616297 35.048661 28.191329 34.175781 27.775391 C 33.303883 27.35992 32.54892 26.991953 32.083984 26.826172 C 31.790239 26.720488 31.431556 26.568352 30.914062 26.626953 C 30.396569 26.685553 29.88546 27.058933 29.587891 27.5 C 29.305837 27.918069 28.170387 29.258349 27.824219 29.652344 C 27.819619 29.649544 27.849659 29.663383 27.712891 29.595703 C 27.284761 29.383815 26.761157 29.203652 25.986328 28.794922 C 25.2115 28.386192 24.242255 27.782635 23.181641 26.847656 L 23.181641 26.845703 C 21.603029 25.455949 20.497272 23.711106 20.148438 23.125 C 20.171937 23.09704 20.145643 23.130901 20.195312 23.082031 L 20.197266 23.080078 C 20.553781 22.728924 20.869739 22.309521 21.136719 22.001953 C 21.515257 21.565866 21.68231 21.181437 21.863281 20.822266 C 22.223954 20.10644 22.02313 19.318742 21.814453 18.904297 L 21.814453 18.902344 C 21.828863 18.931014 21.701572 18.650157 21.564453 18.326172 C 21.426943 18.001263 21.251663 17.580039 21.064453 17.130859 C 20.690033 16.232501 20.272027 15.224912 20.023438 14.634766 L 20.023438 14.632812 C 19.730591 13.937684 19.334395 13.436908 18.816406 13.195312 C 18.298417 12.953717 17.840778 13.022402 17.822266 13.021484 L 17.820312 13.021484 C 17.450668 13.004432 17.045038 13 16.642578 13 z M 16.642578 15 C 17.028118 15 17.408214 15.004701 17.726562 15.019531 C 18.054056 15.035851 18.033687 15.037192 17.970703 15.007812 C 17.906713 14.977972 17.993533 14.968282 18.179688 15.410156 C 18.423098 15.98801 18.84317 16.999249 19.21875 17.900391 C 19.40654 18.350961 19.582292 18.773816 19.722656 19.105469 C 19.863021 19.437122 19.939077 19.622295 20.027344 19.798828 L 20.027344 19.800781 L 20.029297 19.802734 C 20.115837 19.973483 20.108185 19.864164 20.078125 19.923828 C 19.867096 20.342656 19.838461 20.445493 19.625 20.691406 C 19.29998 21.065838 18.968453 21.483404 18.792969 21.65625 C 18.639439 21.80707 18.36242 22.042032 18.189453 22.501953 C 18.016221 22.962578 18.097073 23.59457 18.375 24.066406 C 18.745032 24.6946 19.964406 26.679307 21.859375 28.347656 C 23.05276 29.399678 24.164563 30.095933 25.052734 30.564453 C 25.940906 31.032973 26.664301 31.306607 26.826172 31.386719 C 27.210549 31.576953 27.630655 31.72467 28.119141 31.666016 C 28.607627 31.607366 29.02878 31.310979 29.296875 31.007812 L 29.298828 31.005859 C 29.655629 30.601347 30.715848 29.390728 31.224609 28.644531 C 31.246169 28.652131 31.239109 28.646231 31.408203 28.707031 L 31.408203 28.708984 L 31.410156 28.708984 C 31.487356 28.736474 32.454286 29.169267 33.316406 29.580078 C 34.178526 29.990889 35.053561 30.417875 35.337891 30.558594 C 35.748225 30.761674 35.942113 30.893881 35.992188 30.894531 C 35.995572 30.982516 35.998992 31.07786 35.986328 31.222656 C 35.951258 31.624292 35.8439 32.180225 35.628906 32.775391 C 35.523582 33.066746 34.975018 33.667661 34.283203 34.105469 C 33.591388 34.543277 32.749338 34.852514 32.4375 34.898438 C 31.499896 35.036591 30.386672 35.087027 29.164062 34.703125 C 28.316336 34.437036 27.259305 34.092596 25.890625 33.509766 C 23.114812 32.325956 20.755591 30.311513 19.070312 28.537109 C 18.227674 27.649908 17.552562 26.824019 17.072266 26.199219 C 16.592866 25.575584 16.383528 25.251054 16.208984 25.021484 L 16.207031 25.019531 C 15.897202 24.609805 14 21.970851 14 19.59375 C 14 17.077989 15.168497 16.091436 15.800781 15.410156 C 16.132721 15.052495 16.495617 15 16.642578 15 z"></path>
                              </svg>
                            </div>
                          </a>

                          {/* Mail */}
                          <a
                            href={`mailto:?subject=${Message}&body=${`${ReferralURL}/${refferalSlug}%26platform=email`}`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#ea4335",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="lucide lucide-mail"
                              >
                                <rect
                                  width="20"
                                  height="16"
                                  x="2"
                                  y="4"
                                  rx="2"
                                />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                              </svg>
                            </div>
                          </a>

                          {/* Reddit */}
                          <a
                            href={`https://www.reddit.com/submit/?url=${`${ReferralURL}/${refferalSlug}%26platform=reddit`}&title=${Message}`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#5f99cf",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 50 50"
                                fill="white"
                                stroke="white"
                                stroke-width="2"
                              >
                                <path d="M 29 3 C 28.0625 3 27.164063 3.382813 26.5 4 C 25.835938 4.617188 25.363281 5.433594 25 6.40625 C 24.355469 8.140625 24.085938 10.394531 24.03125 13.03125 C 19.234375 13.179688 14.820313 14.421875 11.28125 16.46875 C 10.214844 15.46875 8.855469 14.96875 7.5 14.96875 C 6.089844 14.96875 4.675781 15.511719 3.59375 16.59375 C 1.425781 18.761719 1.425781 22.238281 3.59375 24.40625 L 3.84375 24.65625 C 3.3125 26.035156 3 27.488281 3 29 C 3 33.527344 5.566406 37.585938 9.5625 40.4375 C 13.558594 43.289063 19.007813 45 25 45 C 30.992188 45 36.441406 43.289063 40.4375 40.4375 C 44.433594 37.585938 47 33.527344 47 29 C 47 27.488281 46.6875 26.035156 46.15625 24.65625 L 46.40625 24.40625 C 48.574219 22.238281 48.574219 18.761719 46.40625 16.59375 C 45.324219 15.511719 43.910156 14.96875 42.5 14.96875 C 41.144531 14.96875 39.785156 15.46875 38.71875 16.46875 C 35.195313 14.433594 30.800781 13.191406 26.03125 13.03125 C 26.09375 10.546875 26.363281 8.46875 26.875 7.09375 C 27.164063 6.316406 27.527344 5.757813 27.875 5.4375 C 28.222656 5.117188 28.539063 5 29 5 C 29.460938 5 29.683594 5.125 30.03125 5.40625 C 30.378906 5.6875 30.785156 6.148438 31.3125 6.6875 C 32.253906 7.652344 33.695313 8.714844 36.09375 8.9375 C 36.539063 11.238281 38.574219 13 41 13 C 43.75 13 46 10.75 46 8 C 46 5.25 43.75 3 41 3 C 38.605469 3 36.574219 4.710938 36.09375 6.96875 C 34.3125 6.796875 33.527344 6.109375 32.75 5.3125 C 32.300781 4.851563 31.886719 4.3125 31.3125 3.84375 C 30.738281 3.375 29.9375 3 29 3 Z M 41 5 C 42.667969 5 44 6.332031 44 8 C 44 9.667969 42.667969 11 41 11 C 39.332031 11 38 9.667969 38 8 C 38 6.332031 39.332031 5 41 5 Z M 25 15 C 30.609375 15 35.675781 16.613281 39.28125 19.1875 C 42.886719 21.761719 45 25.226563 45 29 C 45 32.773438 42.886719 36.238281 39.28125 38.8125 C 35.675781 41.386719 30.609375 43 25 43 C 19.390625 43 14.324219 41.386719 10.71875 38.8125 C 7.113281 36.238281 5 32.773438 5 29 C 5 25.226563 7.113281 21.761719 10.71875 19.1875 C 14.324219 16.613281 19.390625 15 25 15 Z M 7.5 16.9375 C 8.203125 16.9375 8.914063 17.148438 9.53125 17.59375 C 7.527344 19.03125 5.886719 20.769531 4.75 22.71875 C 3.582031 21.296875 3.660156 19.339844 5 18 C 5.714844 17.285156 6.609375 16.9375 7.5 16.9375 Z M 42.5 16.9375 C 43.390625 16.9375 44.285156 17.285156 45 18 C 46.339844 19.339844 46.417969 21.296875 45.25 22.71875 C 44.113281 20.769531 42.472656 19.03125 40.46875 17.59375 C 41.085938 17.148438 41.796875 16.9375 42.5 16.9375 Z M 17 22 C 14.800781 22 13 23.800781 13 26 C 13 28.199219 14.800781 30 17 30 C 19.199219 30 21 28.199219 21 26 C 21 23.800781 19.199219 22 17 22 Z M 33 22 C 30.800781 22 29 23.800781 29 26 C 29 28.199219 30.800781 30 33 30 C 35.199219 30 37 28.199219 37 26 C 37 23.800781 35.199219 22 33 22 Z M 17 24 C 18.117188 24 19 24.882813 19 26 C 19 27.117188 18.117188 28 17 28 C 15.882813 28 15 27.117188 15 26 C 15 24.882813 15.882813 24 17 24 Z M 33 24 C 34.117188 24 35 24.882813 35 26 C 35 27.117188 34.117188 28 33 28 C 31.882813 28 31 27.117188 31 26 C 31 24.882813 31.882813 24 33 24 Z M 34.15625 33.84375 C 34.101563 33.851563 34.050781 33.859375 34 33.875 C 33.683594 33.9375 33.417969 34.144531 33.28125 34.4375 C 33.28125 34.4375 32.757813 35.164063 31.4375 36 C 30.117188 36.835938 28.058594 37.6875 25 37.6875 C 21.941406 37.6875 19.882813 36.835938 18.5625 36 C 17.242188 35.164063 16.71875 34.4375 16.71875 34.4375 C 16.492188 34.082031 16.066406 33.90625 15.65625 34 C 15.332031 34.082031 15.070313 34.316406 14.957031 34.632813 C 14.84375 34.945313 14.894531 35.292969 15.09375 35.5625 C 15.09375 35.5625 15.863281 36.671875 17.46875 37.6875 C 19.074219 38.703125 21.558594 39.6875 25 39.6875 C 28.441406 39.6875 30.925781 38.703125 32.53125 37.6875 C 34.136719 36.671875 34.90625 35.5625 34.90625 35.5625 C 35.207031 35.273438 35.296875 34.824219 35.128906 34.441406 C 34.960938 34.058594 34.574219 33.820313 34.15625 33.84375 Z"></path>
                              </svg>
                            </div>
                          </a>
                        </div>

                        {/* Pinterest */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <a
                            href={`https://in.pinterest.com/pin-builder/?description=${Message}&media=${`${ReferralURL}/${refferalSlug}%26platform=pinterest`}&method=button&url=${`${ReferralURL}/${refferalSlug}%26platform=pinterest`}`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#bd081c",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 50 50"
                                fill="white"
                                stroke="white"
                                stroke-width="2"
                              >
                                <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609825 4 46 13.390175 46 25 C 46 36.609825 36.609825 46 25 46 C 22.876355 46 20.82771 45.682142 18.896484 45.097656 C 19.75673 43.659418 20.867347 41.60359 21.308594 39.90625 C 21.570728 38.899887 22.648438 34.794922 22.648438 34.794922 C 23.348841 36.132057 25.395277 37.263672 27.574219 37.263672 C 34.058123 37.263672 38.732422 31.300682 38.732422 23.890625 C 38.732422 16.78653 32.935409 11.472656 25.476562 11.472656 C 16.196831 11.472656 11.271484 17.700825 11.271484 24.482422 C 11.271484 27.636307 12.94892 31.562193 15.634766 32.8125 C 16.041611 33.001865 16.260073 32.919834 16.353516 32.525391 C 16.425459 32.226044 16.788267 30.766792 16.951172 30.087891 C 17.003269 29.871239 16.978043 29.68405 16.802734 29.470703 C 15.913793 28.392399 15.201172 26.4118 15.201172 24.564453 C 15.201172 19.822048 18.791452 15.232422 24.908203 15.232422 C 30.18976 15.232422 33.888672 18.832872 33.888672 23.980469 C 33.888672 29.796219 30.95207 33.826172 27.130859 33.826172 C 25.020554 33.826172 23.440361 32.080359 23.947266 29.939453 C 24.555054 27.38426 25.728516 24.626944 25.728516 22.78125 C 25.728516 21.130713 24.842754 19.753906 23.007812 19.753906 C 20.850369 19.753906 19.117188 21.984457 19.117188 24.974609 C 19.117187 26.877359 19.761719 28.166016 19.761719 28.166016 C 19.761719 28.166016 17.630543 37.176514 17.240234 38.853516 C 16.849091 40.52931 16.953851 42.786365 17.115234 44.466797 C 9.421139 41.352465 4 33.819328 4 25 C 4 13.390175 13.390175 4 25 4 z"></path>
                              </svg>
                            </div>
                          </a>

                          {/* SMS */}
                          <a
                            href={`sms:?body=${`Use my referral link ${ReferralURL}/${refferalSlug}%26platform=sms`}`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                backgroundColor: "#e5e7eb",
                              }}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 512 512"
                                fill="currentColor"
                                aria-hidden="true"
                                className="w-5 h-5 text-purple-700"
                              >
                                <path d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3 0 0 0 0 0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM202.9 176.8c6.5-2.2 13.7 .1 17.9 5.6L256 229.3l35.2-46.9c4.1-5.5 11.3-7.8 17.9-5.6s10.9 8.3 10.9 15.2v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V240l-19.2 25.6c-3 4-7.8 6.4-12.8 6.4s-9.8-2.4-12.8-6.4L224 240v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-6.9 4.4-13 10.9-15.2zm173.1 38c0 .2 0 .4 0 .4c.1 .1 .6 .8 2.2 1.7c3.9 2.3 9.6 4.1 18.3 6.8l.6 .2c7.4 2.2 17.3 5.2 25.2 10.2c9.1 5.7 17.4 15.2 17.6 29.9c.2 15-7.6 26-17.8 32.3c-9.5 5.9-20.9 7.9-30.7 7.6c-12.2-.4-23.7-4.4-32.6-7.4l0 0 0 0c-1.4-.5-2.7-.9-4-1.4c-8.4-2.8-12.9-11.9-10.1-20.2s11.9-12.9 20.2-10.1c1.7 .6 3.3 1.1 4.9 1.6l0 0 0 0c9.1 3.1 15.6 5.3 22.6 5.5c5.3 .2 10-1 12.8-2.8c1.2-.8 1.8-1.5 2.1-2c.2-.4 .6-1.2 .6-2.7l0-.2c0-.7 0-1.4-2.7-3.1c-3.8-2.4-9.6-4.3-18-6.9l-1.2-.4c-7.2-2.2-16.7-5-24.3-9.6c-9-5.4-17.7-14.7-17.7-29.4c-.1-15.2 8.6-25.7 18.5-31.6c9.4-5.5 20.5-7.5 29.7-7.4c10 .2 19.7 2.3 27.9 4.4c8.5 2.3 13.6 11 11.3 19.6s-11 13.6-19.6 11.3c-7.3-1.9-14.1-3.3-20.1-3.4c-4.9-.1-9.8 1.1-12.9 2.9c-1.4 .8-2.1 1.6-2.4 2c-.2 .3-.4 .8-.4 1.9zm-272 0c0 .2 0 .4 0 .4c.1 .1 .6 .8 2.2 1.7c3.9 2.3 9.6 4.1 18.3 6.8l.6 .2c7.4 2.2 17.3 5.2 25.2 10.2c9.1 5.7 17.4 15.2 17.6 29.9c.2 15-7.6 26-17.8 32.3c-9.5 5.9-20.9 7.9-30.7 7.6c-12.3-.4-24.2-4.5-33.2-7.6l0 0 0 0c-1.3-.4-2.5-.8-3.6-1.2c-8.4-2.8-12.9-11.9-10.1-20.2s11.9-12.9 20.2-10.1c1.4 .5 2.8 .9 4.1 1.4l0 0 0 0c9.5 3.2 16.5 5.6 23.7 5.8c5.3 .2 10-1 12.8-2.8c1.2-.8 1.8-1.5 2.1-2c.2-.4 .6-1.2 .6-2.7l0-.2c0-.7 0-1.4-2.7-3.1c-3.8-2.4-9.6-4.3-18-6.9l-1.2-.4 0 0c-7.2-2.2-16.7-5-24.3-9.6C80.8 239 72.1 229.7 72 215c-.1-15.2 8.6-25.7 18.5-31.6c9.4-5.5 20.5-7.5 29.7-7.4c9.5 .1 22.2 2.1 31.1 4.4c8.5 2.3 13.6 11 11.3 19.6s-11 13.6-19.6 11.3c-6.6-1.8-16.8-3.3-23.3-3.4c-4.9-.1-9.8 1.1-12.9 2.9c-1.4 .8-2.1 1.6-2.4 2c-.2 .3-.4 .8-.4 1.9z"></path>
                              </svg>
                            </div>
                          </a>

                          {/* Linkedin */}
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${`${ReferralURL}/${refferalSlug}%26platform=linkedin`}`}
                            target="_blank"
                          >
                            <div
                              style={{
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#0077b5",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 50 50"
                                fill="white"
                                stroke="white"
                                stroke-width="2"
                              >
                                <path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 14 11.011719 C 12.904779 11.011719 11.919219 11.339079 11.189453 11.953125 C 10.459687 12.567171 10.011719 13.484511 10.011719 14.466797 C 10.011719 16.333977 11.631285 17.789609 13.691406 17.933594 A 0.98809878 0.98809878 0 0 0 13.695312 17.935547 A 0.98809878 0.98809878 0 0 0 14 17.988281 C 16.27301 17.988281 17.988281 16.396083 17.988281 14.466797 A 0.98809878 0.98809878 0 0 0 17.986328 14.414062 C 17.884577 12.513831 16.190443 11.011719 14 11.011719 z M 14 12.988281 C 15.392231 12.988281 15.94197 13.610038 16.001953 14.492188 C 15.989803 15.348434 15.460091 16.011719 14 16.011719 C 12.614594 16.011719 11.988281 15.302225 11.988281 14.466797 C 11.988281 14.049083 12.140703 13.734298 12.460938 13.464844 C 12.78117 13.19539 13.295221 12.988281 14 12.988281 z M 11 19 A 1.0001 1.0001 0 0 0 10 20 L 10 39 A 1.0001 1.0001 0 0 0 11 40 L 17 40 A 1.0001 1.0001 0 0 0 18 39 L 18 33.134766 L 18 20 A 1.0001 1.0001 0 0 0 17 19 L 11 19 z M 20 19 A 1.0001 1.0001 0 0 0 19 20 L 19 39 A 1.0001 1.0001 0 0 0 20 40 L 26 40 A 1.0001 1.0001 0 0 0 27 39 L 27 29 C 27 28.170333 27.226394 27.345035 27.625 26.804688 C 28.023606 26.264339 28.526466 25.940057 29.482422 25.957031 C 30.468166 25.973981 30.989999 26.311669 31.384766 26.841797 C 31.779532 27.371924 32 28.166667 32 29 L 32 39 A 1.0001 1.0001 0 0 0 33 40 L 39 40 A 1.0001 1.0001 0 0 0 40 39 L 40 28.261719 C 40 25.300181 39.122788 22.95433 37.619141 21.367188 C 36.115493 19.780044 34.024172 19 31.8125 19 C 29.710483 19 28.110853 19.704889 27 20.423828 L 27 20 A 1.0001 1.0001 0 0 0 26 19 L 20 19 z M 12 21 L 16 21 L 16 33.134766 L 16 38 L 12 38 L 12 21 z M 21 21 L 25 21 L 25 22.560547 A 1.0001 1.0001 0 0 0 26.798828 23.162109 C 26.798828 23.162109 28.369194 21 31.8125 21 C 33.565828 21 35.069366 21.582581 36.167969 22.742188 C 37.266572 23.901794 38 25.688257 38 28.261719 L 38 38 L 34 38 L 34 29 C 34 27.833333 33.720468 26.627107 32.990234 25.646484 C 32.260001 24.665862 31.031834 23.983076 29.517578 23.957031 C 27.995534 23.930001 26.747519 24.626988 26.015625 25.619141 C 25.283731 26.611293 25 27.829667 25 29 L 25 38 L 21 38 L 21 21 z"></path>
                              </svg>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefferalModal;
