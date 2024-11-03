"use client";
import { useState, useEffect } from "react";
import { SidebarOpenIcon, SidebarCloseIcon } from "./SvgIcons";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logout from "../logout";

export default function Sidebar() {
  const { data: session } = useSession();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) {
        setIsSidebarVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const email = session?.user?.email;
  const emailWithoutDomain = email?.substring(0, email.indexOf("@"));

  return (
    <div>
      <div
        className={`fixed top-0 bg-gray2 w-[250px] h-screen flex flex-col gap-5 items-center z-10 transform transition-transform duration-300 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <img src="/snapstyle-logo.png" alt="Snapstyle Logo" />
        {!!session && (
          <Link
            className={`rounded-lg w-[200px] h-[30px] flex flex-col items-center justify-center ${
              pathname === "/account"
                ? "text-black bg-yellow"
                : "hover:text-black hover:bg-yellow2 active:bg-yellow3"
            }`}
            href="/account"
          >
            <div>{emailWithoutDomain}</div>
          </Link>
        )}
        {!!session && <Logout />}
        {!session && (
          <Link
            className={`rounded-lg w-[200px] h-[30px] flex flex-col items-center justify-center ${
              pathname === "/login"
                ? "text-black bg-yellow"
                : "hover:text-black hover:bg-yellow2 active:bg-yellow3"
            }`}
            href="/login"
          >
            Login
          </Link>
        )}
      </div>
      <button
        onClick={toggleSidebar}
        className="fixed bottom-0 ml-5 mb-5 size-7 flex items-center justify-center rounded-lg bg-gray hover:bg-gray2 active:bg-gray z-20"
      >
        {isSidebarVisible ? <SidebarOpenIcon /> : <SidebarCloseIcon />}
      </button>
    </div>
  );
}
