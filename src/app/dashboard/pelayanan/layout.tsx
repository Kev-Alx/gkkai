import { Settings } from "lucide-react";

import { CalendarProvider } from "@/components/dashboard/calendar/calendar-context";

import { ChangeBadgeVariantInput } from "@/components/dashboard/calendar/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/components/dashboard/calendar/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/components/dashboard/calendar/change-working-hours-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { getEvents, getUsers } from "@/components/dashboard/calendar/requests";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [events, users] = await Promise.all([getEvents(), getUsers()]);

  return (
    <CalendarProvider users={users} events={events}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
        {children}

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="flex-none gap-2 py-0 hover:no-underline">
              <div className="flex items-center gap-2">
                <Settings className="size-4" />
                <p className="text-base font-semibold">Calendar settings</p>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="mt-4 flex flex-col gap-6">
                <ChangeBadgeVariantInput />
                <ChangeVisibleHoursInput />
                <ChangeWorkingHoursInput />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </CalendarProvider>
  );
}
