import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

type Props = {
  title: string;
  createLink?: string;
};

const Header = ({ createLink, title }: Props) => {
  return (
    <div className="flex w-full items-center gap-4 justify-between">
      <h1 className="text-2xl font-medium">{title}</h1>
      {createLink && (
        <Button
          size={"sm"}
          className="rounded-sm"
          variant={"secondary"}
          asChild
        >
          <Link href={createLink}>Create new</Link>
        </Button>
      )}
    </div>
  );
};

export default Header;
