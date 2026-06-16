import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
};

export default function Checkbox({
    id,
    label,
    className,
    ...props
}: CheckboxProps) {
    return (
        <div className="flex items-center">
            <input
                id={id}
                type="checkbox"
                className={cn(
                    "h-4 w-4 cursor-pointer rounded border-gray-300 text-[#00B14F] focus:ring-[#00B14F]",
                    className
                )}
                {...props}
            />

            <label htmlFor={id} className="ml-2 text-sm text-gray-600">
                {label}
            </label>
        </div>
    );
}