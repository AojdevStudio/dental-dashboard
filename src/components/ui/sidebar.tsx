"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Blocks,
  Calendar,
  ChevronsUpDown,
  ClipboardList,
  FileSpreadsheet,
  Layout,
  LayoutDashboard,
  LineChart,
  LogOut,
  PieChart,
  Plus,
  Settings,
  UserCircle,
  UserCog,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  return (
    <motion.div
      className={cn("sidebar fixed left-0 z-40 h-full shrink-0 border-r fixed")}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className="relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-all"
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0  border-b p-2">
              <div className=" mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2  px-2"
                    >
                      <Avatar className="rounded size-4">
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <motion.li variants={variants} className="flex w-fit items-center gap-2">
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium  ">{"Organization"}</p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild className="flex items-center gap-2">
                      <Link href="/settings/members">
                        <UserCog className="h-4 w-4" /> Manage members
                      </Link>
                    </DropdownMenuItem>{" "}
                    <DropdownMenuItem asChild className="flex items-center gap-2">
                      <Link href="/settings/integrations">
                        <Blocks className="h-4 w-4" /> Integrations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/select-org" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create or join an organization
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className=" flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("dashboard") &&
                          !pathname?.includes("/dashboard/") &&
                          "bg-muted text-blue-600"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Overview</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/dashboard/clinics"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/dashboard/clinics") && "bg-muted text-blue-600"
                      )}
                    >
                      <Layout className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <p className="ml-2 text-sm font-medium">Clinics</p>
                          </div>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      href="/dashboard/providers"
                      className={cn(
                        "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/dashboard/providers") && "bg-muted text-blue-600"
                      )}
                    >
                      <Users className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="ml-2 flex items-center gap-2">
                            <p className="text-sm font-medium">Providers</p>
                          </div>
                        )}
                      </motion.li>
                    </Link>

                    <Separator className="w-full" />

                    <Link
                      href="/dashboard/metrics"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/dashboard/metrics") && "bg-muted text-blue-600"
                      )}
                    >
                      <PieChart className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Financial</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/dashboard/patients"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/dashboard/patients") && "bg-muted text-blue-600"
                      )}
                    >
                      <UserCircle className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Patients</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/dashboard/appointments"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/dashboard/appointments") && "bg-muted text-blue-600"
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Appointments</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/dashboard/treatments"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/dashboard/treatments") && "bg-muted text-blue-600"
                      )}
                    >
                      <ClipboardList className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Treatment Plans</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      href="/dashboard/calls"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/dashboard/calls") && "bg-muted text-blue-600"
                      )}
                    >
                      <Activity className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Call Reporting</p>}
                      </motion.li>
                    </Link>

                    <Separator className="w-full" />

                    <Link
                      href="/google/connect"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/google/connect") && "bg-muted text-blue-600"
                      )}
                    >
                      <FileSpreadsheet className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Google Sheets</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/reports"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/reports") && "bg-muted text-blue-600"
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Reports</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/goals"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/goals") && "bg-muted text-blue-600"
                      )}
                    >
                      <LineChart className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-2 text-sm font-medium">Goals</p>}
                      </motion.li>
                    </Link>
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                <Link
                  href="/settings"
                  className="mt-auto flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary"
                >
                  <Settings className="h-4 w-4 shrink-0" />{" "}
                  <motion.li variants={variants}>
                    {!isCollapsed && <p className="ml-2 text-sm font-medium"> Settings</p>}
                  </motion.li>
                </Link>

                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5  transition hover:bg-muted hover:text-primary">
                        <Avatar className="size-4">
                          <AvatarFallback>D</AvatarFallback>
                        </Avatar>
                        <motion.li variants={variants} className="flex w-full items-center gap-2">
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">Account</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>DM</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">{"Dental Manager"}</span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {"manager@dentalpractice.com"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="flex items-center gap-2">
                        <Link href="/settings/profile">
                          <UserCircle className="h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
