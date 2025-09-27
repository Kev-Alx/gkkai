import { AppSidebar } from "@/components/app-sidebar";
import NavigationBar from "@/components/dashboard/navigation-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger className="fixed top-1.5 left-1.5 z-30 border rounded-sm" />
      <SidebarInset className="overflow-x-hidden">
        <NavigationBar />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
