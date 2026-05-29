import { Bell } from "lucide-react";

interface NotificationIconProps {
    hasNotification?: boolean;
}

export default function NotificationIcon({
    hasNotification = false,
}: NotificationIconProps) {
    return (
        <button
            className="
                relative
                flex items-center justify-center
                w-10 h-10
                rounded-full
                border border-gray-200
                bg-white
                hover:border-green-500
                transition-colors
                cursor-pointer
            "
        >
            <Bell className="w-5 h-5 text-gray-500 hover:text-green-600 transition-colors" />

            {hasNotification && (
                <span
                    className="
                        absolute
                        top-2.5
                        right-2.5
                        w-2 h-2
                        rounded-full
                        bg-red-500
                        border border-white
                    "
                />
            )}
        </button>
    );
}