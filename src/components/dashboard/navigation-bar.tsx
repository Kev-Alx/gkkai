"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Note: Adjust this import path to your project structure
import { capitalize } from "@/lib/utils";

const NavigationBar = () => {
  const pathname = usePathname();
  // Split the path and remove the initial empty string from the leading "/"
  const segments = pathname.split("/").filter((segment) => segment);

  return (
    <div className="py-4 px-12 sticky top-0 bg-background">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Base Breadcrumb Item */}
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage className="text-sm">Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {/* Dynamically generated segments */}
          {segments.slice(1).map((segment, index) => {
            // console.log(segment);
            // console.log(segments.slice(1, index + 1));
            const href = "/dashboard/" + segments.slice(1, index + 2).join("/");
            const isLast = index === segments.length - 2;

            return (
              <React.Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    // The last segment is the current page, so it's not a link
                    <BreadcrumbPage className="text-sm">
                      {capitalize(segment)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {capitalize(segment)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default NavigationBar;
