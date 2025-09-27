import { ClientContainer } from "@/components/dashboard/calendar/calendar-client-container";
import Header from "@/components/dashboard/header";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="px-12">
      <Header title="Pelayanan" />
      <ClientContainer view="month" />
    </div>
  );
};

export default page;
