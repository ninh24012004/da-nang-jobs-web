import Image from "next/image";

import ProfileMenuSection from "./ProfileMenuSection";
import useAuth from "@/hooks/useAuth";

interface Props {
    user?: {
        fullName?: string;
        avatar?: string;
        email?: string;
    };
}

export default function ProfileDropdown({
    user,
}: Props) {
    const { logout } = useAuth();

    return (
        <div
            className="w-[380px] max-h-[80vh] overflow-y-auto overflow-x-hidden hide-scrollbar bg-white rounded-2xl shadow-2xl border border-gray-100"
        >
            {/* HEADER */}
            <div className="flex gap-4 p-5 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                    <Image
                        src={
                            user?.avatar ||
                            "/images/background/avatar-default.png"
                        }
                        alt="avatar"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                    />
                </div>

                <div>
                    <h3 className="font-bold text-lg text-gray-800">
                        {user?.fullName}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                        Tài khoản đã xác thực
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-5 space-y-6">

                <ProfileMenuSection
                    title="Quản lý tìm việc"
                    items={[
                        {
                            label: "Việc làm đã ứng tuyển",
                            href: "/applied-jobs"
                        },
                        {
                            label: "Việc làm phù hợp với bạn",
                            href: "/recommended-jobs"
                        },
                        {
                            label: "Cài đặt gợi ý việc làm",
                            href: "/job-preferences"
                        }
                    ]}
                />

                <ProfileMenuSection
                    title="Quản lý CV"
                    items={[
                        {
                            label: "CV của tôi",
                            href: "/my-cv"
                        }
                    ]}
                />

                <button
                    className="w-full h-11 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium cursor-pointer"
                    onClick={() => logout("/candidate/login")}
                >
                    Đăng xuất
                </button>

            </div>
        </div>
    );
}