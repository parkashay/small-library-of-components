import { NavigateBack } from "@/components/common/navigate-back";
import { PropsWithChildren } from "react";

export default function layout({ children }: PropsWithChildren) {
  return (
    <div>
      <NavigateBack href="/games" text="Back" classsName="w-fit" />
      {children}
    </div>
  );
}
