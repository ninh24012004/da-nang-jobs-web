"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import GoogleIcon from "@/components/icons/GoogleIcon";
import LogoIcon from "@/components/icons/LogoIcon";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import Checkbox from "@/components/ui/Checkbox";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import EmployerLogo from "../icons/EmployerLogo";

type UserType = "candidate" | "employer";

interface LoginFormProps {
    userType: UserType;
}

const loginConfig = {
    candidate: {
        role: "CANDIDATE" as UserRole,
        title: "Chào mừng trở lại",
        description: "Tiếp tục hành trình sự nghiệp tại Đà Nẵng",
        emailLabel: "EMAIL",
        emailPlaceholder: "nguoidung@example.com",
        forgotPasswordHref: "/candidate/forgot-password",
        registerHref: "/candidate/register",
        registerText: "Chưa có tài khoản?",
        backgroundImage: "/images/background/candidate-login-bg.png",
        backgroundTitle: "Kết nối",
        backgroundHighlight: "tiềm năng.",
        backgroundDescription:
            "Khám phá hàng ngàn cơ hội việc làm tại các doanh nghiệp hàng đầu Đà Nẵng. Xây dựng tương lai vững chắc nơi thành phố đáng sống.",
        stats: [
            { value: "5000+", label: "Việc làm mới" },
            { value: "1200+", label: "Doanh nghiệp" },
        ],
    },
    employer: {
        role: "EMPLOYER" as UserRole,
        title: "Đăng nhập nhà tuyển dụng",
        description: "Quản lý tuyển dụng và tìm kiếm nhân tài tại Đà Nẵng",
        emailLabel: "EMAIL DOANH NGHIỆP",
        emailPlaceholder: "company@example.com",
        forgotPasswordHref: "/employer/forgot-password",
        registerHref: "/employer/register",
        registerText: "Chưa có tài khoản doanh nghiệp?",
        backgroundImage: "/images/background/employer-login-bg.png",
        backgroundTitle: "Tuyển dụng",
        backgroundHighlight: "hiệu quả.",
        backgroundDescription:
            "Kết nối với hàng ngàn ứng viên chất lượng và phát triển đội ngũ mạnh mẽ cho doanh nghiệp của bạn.",
        stats: [
            { value: "10K+", label: "Ứng viên" },
            { value: "500+", label: "Doanh nghiệp" },
        ],
    },
};

export default function LoginForm({ userType }: LoginFormProps) {
    const router = useRouter();
    const config = loginConfig[userType];

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const { login, logout, loading } = useAuth();

    useEffect(() => {
        const userStr =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);

            if (user.roleName === "ADMIN") {
                router.push("/admin/dashboard");
                return;
            }

            if (userType === "candidate") {
                if (user.roleName === "CANDIDATE") {
                    router.push("/candidate");
                    return;
                }

                logout("/candidate/login");

                toast.info(
                    "Vui lòng đăng nhập bằng tài khoản ứng viên"
                );

                return;
            }

            if (userType === "employer") {
                if (user.roleName === "EMPLOYER") {
                    router.push("/employer");
                    return;
                }

                logout("/employer/login");

                toast.info(
                    "Vui lòng đăng nhập bằng tài khoản nhà tuyển dụng"
                );

                return;
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }, [userType, logout]);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const newErrors = {
            email: "",
            password: "",
        };

        let hasError = false;

        if (!email.trim()) {
            newErrors.email = "Email không được để trống";
            hasError = true;
        }

        if (!password.trim()) {
            newErrors.password = "Mật khẩu không được để trống";
            hasError = true;
        } else if (password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            toast.error("Vui lòng kiểm tra lại thông tin đăng nhập");
            return;
        }

        const result = await login(
            { email, password },
            remember,
            config.role
        );

        if (result.success) {
            toast.success(result.message || "Đăng nhập thành công");
        } else {
            toast.error(result.message || "Đăng nhập thất bại");
        }
    };

    return (
        <div className="flex h-screen w-full bg-white font-sans text-[#1a1a1a]">
            <div className="flex w-full flex-col justify-center sm:px-12 md:w-1/2 md:px-16 lg:px-24">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-4">
                        {userType === "candidate" ? <LogoIcon /> : <EmployerLogo />}
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#0d1b2a] md:text-3xl">
                            {config.title}
                        </h2>

                        <p className="mt-2 text-lg text-gray-500">
                            {config.description}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            id="email"
                            label={config.emailLabel}
                            placeholder={config.emailPlaceholder}
                            type="email"
                            autoComplete="email"
                            value={email}
                            error={errors.email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    email: "",
                                }));
                            }}
                        />

                        <Input
                            id="password"
                            label="MẬT KHẨU"
                            placeholder="********"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            error={errors.password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    password: "",
                                }));
                            }}
                        />

                        <div className="flex items-center justify-between">
                            <Checkbox
                                id="remember"
                                label="Ghi nhớ đăng nhập"
                                checked={remember}
                                onChange={(e) =>
                                    setRemember(e.target.checked)
                                }
                            />

                            <Link
                                href={config.forgotPasswordHref}
                                className="text-sm font-medium text-[#006b7a] hover:underline"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Button type="submit" isLoading={loading}>
                            Đăng nhập
                        </Button>
                    </form>

                    <Divider text="Hoặc đăng nhập bằng" />

                    <Button
                        type="button"
                        variant="outline"
                        className="flex items-center justify-center gap-3 py-2.5 text-sm cursor-pointer w-full"
                    >
                        <GoogleIcon />
                        Google
                    </Button>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-gray-500">
                            {config.registerText}{" "}
                            <Link
                                href={config.registerHref}
                                className="font-bold text-[#006b7a] hover:underline"
                            >
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative hidden w-1/2 md:block">
                <Image
                    src={config.backgroundImage}
                    alt="Login background"
                    fill
                    sizes="50vw"
                    className="object-cover"
                    priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white lg:p-16">
                    <div className="mb-8 max-w-xl">
                        <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                            {config.backgroundTitle}{" "}
                            <span className="text-[#4fd1ed]">
                                {config.backgroundHighlight}
                            </span>
                        </h2>

                        <p className="text-lg leading-relaxed text-gray-200">
                            {config.backgroundDescription}
                        </p>
                    </div>

                    <div className="flex gap-8 border-t border-white/20 pt-8 lg:gap-12">
                        {config.stats.map((item) => (
                            <div key={item.label}>
                                <p className="text-2xl font-bold lg:text-3xl">
                                    {item.value}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}