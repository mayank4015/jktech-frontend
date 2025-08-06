"use client";

import { useEffect, useState } from "react";
import { HeaderClient } from "./HeaderClient";
import { getCurrentUser } from "@/app/actions";
import { User } from "@/types";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Fetch user data once on component mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return <HeaderClient user={user} onMenuClick={onMenuClick} />;
}
