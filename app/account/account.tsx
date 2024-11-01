"use client";
import { useEffect, useState } from "react";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  subscription_plan: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccountDetails() {
      try {
        const response = await fetch("/api/account");
        if (response.ok) {
          const data: User = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch account details");
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching account details:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAccountDetails();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>No account details found.</p>;

  return (
    <div>
      <h1>Account Details</h1>
      <p>
        <strong>First Name:</strong> {user.first_name}
      </p>
      <p>
        <strong>Last Name:</strong> {user.last_name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Subscription Plan:</strong> {user.subscription_plan}
      </p>
    </div>
  );
}
