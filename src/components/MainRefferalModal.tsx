/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";
import RefferalModal from "./RefferalModal";

export const MainRefferalModal = () => {
  // Getting Pathname
  let pathname: unknown;

  if (typeof window !== "undefined") {
    pathname = window.location.origin + window.location.pathname;
  }

  // console.log("pathname", pathname);

  // State to manage the visibility of the referral modal
  const [refferalModal, setRefferalModal] = useState(false);

  // State to store data fetched for the referral modal
  const [refferalModalData, setRefferalModalData] = useState();

  // State to store referral ID
  const [referralID, setReferralID] = useState(null);

  // Get referral parameters from URL
  // Get referral parameters from URL
  let urlParams;

  if (typeof window !== "undefined") {
    urlParams = new URLSearchParams(window.location.search);
  }

  const referrd_referral = urlParams?.get("referrd_referral") || null;
  const referrd_uuid = urlParams?.get("referrd_uuid") || null;
  const payment_success = urlParams?.get("payment_success") || null;
  const social_platform = urlParams?.get("platform") || null;

  // Log referral parameters for debugging
  // console.log("referrd_referral", referrd_referral);
  // console.log("referrd_uuid", referrd_uuid);
  // console.log("payment_success", payment_success);
  // console.log("social_platform", social_platform);

  //   Import BASE_URL
  const BASE_URL = "https://api.referrd.com.au";
  // console.log(BASE_URL);

  // Function to fetch referral ID based on referral code
  async function getReferralIdData() {
    try {
      const response = await fetch(
        `${BASE_URL}/items/referrals?filter[slug][_eq]=${referrd_referral}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer ynix-80V9FtYIOgVNP5wkTk0gkqcp-Wh",
          },
        }
      );

      const referralResult = await response.json();
      const referralData = referralResult?.data[0];
      setReferralID(referralData.id);
      // console.log(referralData.id);
      // console.log(referralID);
      return referralData.id;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  // Function to get public IP address
  async function getPublicIpAddress() {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching public IP address:", error);
      return null;
    }
  }

  // Function to send event data to the API
  async function rfrd(
    action: string,
    value: { event_type: any; campaign: any; user?: any; social_type?: any }
  ) {
    let payload;

    // Get IP Address
    const ipAddress = await getPublicIpAddress();
    var ipAdd = ipAddress || null;

    const RefferalIDD = await getReferralIdData();
    var REFID = RefferalIDD || null;

    // Prepare payload based on action and event type
    if (action === "track" && value.event_type === "pageview") {
      payload = {
        browser: navigator.userAgent || null,
        ip_address: ipAdd,
        location: null,
        page_title: document.title || null,
        campaign: value.campaign.id || null,
        referral: REFID,
        risk: null,
        transaction_id: null,
        transaction_value: null,
        type: value.event_type || "pageview",
        social_type: value.social_type || null,
        url: location.href || null,
        uuid: null,
        // user: value.campaign.user_created || null,
        user: null,
      };
    } else if (action === "track" && value.event_type === "conversion") {
      payload = {
        browser: navigator.userAgent || null,
        ip_address: ipAdd,
        location: null,
        page_title: document.title || null,
        campaign: value.campaign.id || null,
        referral: referralID || null,
        risk: null,
        transaction_id: null,
        transaction_value: null,
        type: value.event_type || "conversion",
        social_type: value.social_type || null,
        url: location.href || null,
        uuid: referrd_uuid || null,
        user: value.user.id || null,
      };
    }

    // console.log(payload);

    // Send payload to the API
    try {
      const response = await fetch(`${BASE_URL}/items/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Event Data Sent!");
      } else {
        console.log("Error While Sending Event Data!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Function to fetch referral modal data from the API
  const getRefferalModaldata = async () => {
    try {
      const response = await fetch(
        // `https://api.referrd.agpro.co.in/items/campaigns?filter[url][_eq]=`,
        `${BASE_URL}/items/campaigns?filter={"_and":[{"url":{"_eq":"${pathname}"}},{"status":{"_eq":"active"}},{"date_start":{"_lt":"$NOW"}},{"date_close":{"_gt":"$NOW"}}]}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer ynix-80V9FtYIOgVNP5wkTk0gkqcp-Wh",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const data = result?.data[0];
        if (data) {
          setRefferalModalData(data);
          setRefferalModal(true); // Set modal visibility to true
          rfrd("track", {
            event_type: "pageview",
            campaign: data,
            social_type: social_platform
          });
        }
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // Fetch data only if pathname exists
    if (pathname) {
      if (
        payment_success !== undefined &&
        payment_success?.toString() === "true"
      ) {
        getRefferalModaldata();
      }
    }

    // Fetch referral ID data if referral code exists
    if (referrd_referral) {
      getReferralIdData();
    }
  }, [pathname, referrd_referral, referrd_uuid, payment_success]);

  return (
    <>
      {/* Render the RefferalModal component only if refferalModal state is true */}
      {refferalModal ? (
        // <div className="w-full md:h-[100vh] flex items-center justify-center">
        <RefferalModal
          refferalModal={refferalModal}
          setRefferalModal={setRefferalModal}
          refferalModalData={refferalModalData}
          rfrd={rfrd}
          referrd_referral={referrd_referral}
          referrd_uuid={referrd_uuid}
        />
      ) : // </div>
      null}
    </>
  );
};
