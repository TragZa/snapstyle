"use client";
import { signOut } from "next-auth/react";

export default function Logout() {
  return (
    <button
      className="rounded-lg w-[200px] h-[30px] flex flex-col items-center justify-center hover:text-black hover:bg-yellow2 active:bg-yellow3"
      onClick={() => {
        signOut();
      }}
    >
      Logout
    </button>
  );
}
