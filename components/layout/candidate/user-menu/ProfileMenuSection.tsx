import { ChevronDown } from "lucide-react";
import ProfileMenuItem from "./ProfileMenuItem";

interface Props {
    title: string;
    items?: {
        label: string;
        href: string;
    }[];
}

export default function ProfileMenuSection({ title, items }: Props) {
    return (
        <div>
            <div className="flex items-center justify-between cursor-pointer group">
                <h3 className="font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                    {title}
                </h3>

                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
            </div>

            {items && (
                <div className="mt-3 ml-4 space-y-2">
                    {items.map((item) => (
                        <ProfileMenuItem
                            key={item.label}
                            label={item.label}
                            href={item.href}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}