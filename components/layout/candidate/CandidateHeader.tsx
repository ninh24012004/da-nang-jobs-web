import React from "react";
import LogoIcon from "@/components/icons/LogoIcon";

import NavigationMenu from "./NavigationMenu";
import HeaderButton from "./HeaderButton";
import UserMenu from "./UserMenu";

interface HeaderProps {
    isAuthenticated: boolean;
    user?: {
        fullName: string;
        avatar?: string;
    };
}

export const CandidateHeader: React.FC<HeaderProps> = ({
    isAuthenticated,
    user,
}) => {
    return (
        <header className="sticky top-0 z-30 w-full h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
            <div className="flex items-center min-w-0">
                <LogoIcon />
                <NavigationMenu />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {!isAuthenticated ? (
                    <>
                        <HeaderButton variant="outline" href="/candidate/register">
                            Đăng ký
                        </HeaderButton>

                        <HeaderButton variant="solid" href="/candidate/login">
                            Đăng nhập
                        </HeaderButton>

                        <HeaderButton variant="gray" href="/employer/login">
                            Đăng tuyển & tìm hồ sơ
                        </HeaderButton>
                    </>
                ) : (
                    <UserMenu user={user} />
                )}
            </div>
        </header>
    );
};

export default CandidateHeader;