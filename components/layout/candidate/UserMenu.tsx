import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import NotificationIcon from "./NotificationIcon";
import ProfileDropdown from "./user-menu/ProfileDropdown";

interface Props {
    user?: {
        fullName: string;
        avatar?: string;
        email?: string;
    };
}

export default function UserMenu({ user }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center gap-3">
            <NotificationIcon />

            <div
                className="relative"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <div className="relative cursor-pointer group flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 group-hover:border-green-500 transition-colors">
                        <Image
                            src={
                                user?.avatar ||
                                "/images/background/avatar-default.png"
                            }
                            alt={user?.fullName || "User"}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-green-500 transition-colors">
                        <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-green-600 transition-colors" />
                    </div>
                </div>

                {open && (
                    <div className="absolute right-0 top-full pt-3 z-50">
                        <ProfileDropdown user={user} />
                    </div>
                )}
            </div>

            <div className="hidden xl:flex flex-col items-start ml-6">
                <span className="text-xs text-gray-500">
                    Bạn là nhà tuyển dụng?
                </span>

                <button className="text-green-600 hover:underline text-sm font-semibold cursor-pointer">
                    Đăng tuyển ngay
                </button>
            </div>
        </div>
    );
}