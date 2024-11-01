"use client";
import { signIn } from "next-auth/react";
import { FormEvent } from "react";
import Link from "next/link";

export default function Form() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (!response?.error) {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-screen sm:w-[500px] h-[400px] px-5 pt-5">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full h-full items-center justify-center gap-5 rounded-2xl bg-gray2"
        >
          <input
            name="email"
            className="border bg-gray border-white text-white placeholder-white w-[300px] pl-2"
            type="email"
            placeholder="Email"
          />
          <input
            name="password"
            className="border bg-gray border-white text-white placeholder-white w-[300px] pl-2"
            type="password"
            placeholder="Password"
          />
          <button
            className="rounded-lg w-[100px] h-[30px] flex items-center justify-center text-black bg-yellow hover:bg-yellow2 active:bg-yellow3"
            type="submit"
          >
            Login
          </button>
          <div>Don't have an account?</div>
          <Link
            className="rounded-lg w-[100px] h-[30px] flex items-center justify-center text-black bg-yellow hover:bg-yellow2 active:bg-yellow3"
            href="/register"
          >
            Register
          </Link>
        </form>
      </div>
    </div>
  );
}
