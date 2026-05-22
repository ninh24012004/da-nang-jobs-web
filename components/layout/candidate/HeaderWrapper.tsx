"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CandidateHeader from "@/components/layout/candidate/CandidateHeader";

export default function HeaderWrapper() {
    const pathname = usePathname();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{
        fullName: string;
        avatar?: string;
    } | null>(null);

    const hideHeaderPaths = [
        "/candidate/login",
        "/candidate/register",
        "/candidate/forgot-password",
        "/employer/login",
        "/employer/register",
        "/employer/forgot-password",
    ];

    useEffect(() => {
        const localToken = localStorage.getItem("accessToken");
        const sessionToken = sessionStorage.getItem("accessToken");

        const localUser = localStorage.getItem("user");
        const sessionUser = sessionStorage.getItem("user");

        const token = localToken || sessionToken;
        const userData = localUser || sessionUser;

        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [pathname]);

    const shouldHideHeader = hideHeaderPaths.some((path) =>
        pathname.startsWith(path)
    );

    if (shouldHideHeader) {
        return null;
    }

    return <CandidateHeader isAuthenticated={isAuthenticated} user={user || undefined} />;
}