"use client";
import Question from "@/components/Question";
import Parent from "@/components/delayed-response/Parent";
import React from "react";

const page = () => {
  return (
    <div>
      <i>
        This question was asked in the frontend interview of Victoria&aos;s Secret
        and Co.
      </i>{" "}
      <br />
      <Question>
        Input a message in the parent component. After clicking the button, the
        message must be transferred to the child component where each word is
        displayed with a second of delay than the previous one.
      </Question>
      <Parent /> {/* Parent Component */}
    </div>
  );
};

export default page;
