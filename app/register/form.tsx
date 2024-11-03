"use client";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Form() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!firstName) {
      toast.error("First name cannot be empty");
      return;
    }

    if (!lastName) {
      toast.error("Last name cannot be empty");
      return;
    }

    if (!email) {
      toast.error("Email cannot be empty");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    if (!password) {
      toast.error("Password cannot be empty");
      return;
    }

    const passwordStrengthRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.message === "First name cannot be empty") {
      toast.error("First name cannot be empty");
    } else if (data.message === "Last name cannot be empty") {
      toast.error("Last name cannot be empty");
    } else if (data.message === "Email cannot be empty") {
      toast.error("Email cannot be empty");
    } else if (data.message === "Password cannot be empty") {
      toast.error("Password cannot be empty");
    } else if (data.message === "Email already exists") {
      toast.error("Email already exists");
    } else if (data.message === "Success") {
      router.push("/login");
    } else {
      toast.error("Client side error.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ToastContainer position="top-center" />
      <div className="w-screen sm:w-[500px] h-[500px] px-5 pt-5">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full h-full items-center justify-center gap-5 rounded-2xl bg-gray2"
        >
          <input
            name="firstName"
            className="border bg-gray border-white text-white placeholder-white w-[300px] pl-2"
            type="text"
            placeholder="First Name"
          />
          <input
            name="lastName"
            className="border bg-gray border-white text-white placeholder-white w-[300px] pl-2"
            type="text"
            placeholder="Last Name"
          />
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
          <input
            name="confirmPassword"
            className="border bg-gray border-white text-white placeholder-white w-[300px] pl-2"
            type="password"
            placeholder="Confirm Password"
          />
          <button
            className="rounded-lg w-[100px] h-[30px] flex items-center justify-center text-black bg-yellow hover:bg-yellow2 active:bg-yellow3"
            type="submit"
          >
            Register
          </button>
          <div>Already have an account?</div>
          <Link
            className="rounded-lg w-[100px] h-[30px] flex items-center justify-center text-black bg-yellow hover:bg-yellow2 active:bg-yellow3"
            href="/login"
          >
            Login
          </Link>
        </form>
      </div>
    </div>
  );
}
