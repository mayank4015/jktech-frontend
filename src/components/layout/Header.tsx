"use client";

import { useEffect, useState } from "react";
import { HeaderClient } from "./HeaderClient";
import { getCurrentUser } from "@/app/actions";
import { User } from "@/types";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  // Fetch user data once on component mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    fetchUser();
  }, []);

  return <HeaderClient user={user} onMenuClick={onMenuClick} />;
}
