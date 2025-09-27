import Header from "@/components/dashboard/header";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="px-12">
      <Header title="Kebaktian" />
      {/* <DataTableHeader
        columns={[
          { key: "1", label: "Name" },
          { key: "2", label: "email" },
        ]}
      /> */}
    </div>
  );
};

export default page;
