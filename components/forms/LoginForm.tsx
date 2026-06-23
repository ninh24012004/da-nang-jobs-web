"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

declare global {
    interface Window {
        google?: any;
        google_callback_ref?: any;
        google_initialized?: boolean;
    }
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
            "Kết nối với hàng ngàn ứng viên chất lượng và phát triển đội ngũ mạnh mẽ cho doanh nghiệp của bạn."
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

    const rememberRef = useRef(remember);
    const googleRenderedRef = useRef(false);
    const roleRef = useRef(config.role);

    const { login, googleLogin, logout, loading } = useAuth();

    useEffect(() => {
        rememberRef.current = remember;
    }, [remember]);

    useEffect(() => {
        roleRef.current = config.role;
    }, [config.role]);

    useEffect(() => {
        const handleGoogleCredentialResponse = async (response: any) => {
            const credentialToken = response.credential;

            const result = await googleLogin(
                credentialToken,
                rememberRef.current,
                roleRef.current
            );

            if (result.success) {
                toast.success("Đăng nhập bằng Google thành công");
            } else {
                toast.error(result.message || "Đăng nhập bằng Google thất bại");
            }
        };

        window.google_callback_ref = handleGoogleCredentialResponse;

        const checkGoogleScript = setInterval(() => {
            if (!window.google?.accounts?.id) return;

            clearInterval(checkGoogleScript);

            if (!window.google_initialized) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: (response: any) => {
                        window.google_callback_ref?.(response);
                    },
                    use_fedcm_for_prompt: false,
                });

                window.google_initialized = true;
            }

            const googleButton =
                document.getElementById("google-login-button");

            if (googleButton && !googleRenderedRef.current) {
                googleButton.innerHTML = "";

                window.google.accounts.id.renderButton(googleButton, {
                    theme: "outline",
                    size: "large",
                    width: 400,
                    text: "signin_with",
                    shape: "rectangular",
                });

                googleRenderedRef.current = true;
            }
        }, 500);

        return () => {
            clearInterval(checkGoogleScript);
        };
    }, [googleLogin]);

    useEffect(() => {
        const userStr =
            localStorage.getItem("user") || sessionStorage.getItem("user");

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
                toast.info("Vui lòng đăng nhập bằng tài khoản ứng viên");
                return;
            }

            if (userType === "employer") {
                if (user.roleName === "EMPLOYER") {
                    router.push("/employer/dashboard");
                    return;
                }

                logout("/employer/login");
                toast.info("Vui lòng đăng nhập bằng tài khoản nhà tuyển dụng");
                return;
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }, [userType, logout, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

        const result = await login({ email, password }, remember, config.role);

        if (result.success) {
            toast.success(result.message || "Đăng nhập thành công");
        } else {
            toast.error(result.message || "Đăng nhập thất bại");
        }
    };

    return (
        <div className="flex h-screen w-full bg-white font-sans text-slate-800">
            <div className="flex w-full flex-col justify-center sm:px-12 md:w-1/2 md:px-16 lg:px-24">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-4">
                        {userType === "candidate" ? (
                            <Link href="/candidate">
                                <LogoIcon />
                            </Link>
                        ) : (
                            <Link href="/employer">
                                <EmployerLogo />
                            </Link>
                        )}
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                            {config.title}
                        </h2>

                        <p className="mt-2 text-lg text-slate-500 font-light">
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
                            variant={userType === "candidate" ? "primary" : "secondary"}
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
                            variant={userType === "candidate" ? "primary" : "secondary"}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    password: "",
                                }));
                            }}
                        />

                        <div className="flex items-center justify-between select-none">
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
                                className={cn(
                                    "text-sm font-medium hover:underline",
                                    userType === "candidate" ? "text-[#00B14F]" : "text-[#0F172A]"
                                )}
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            isLoading={loading}
                            variant={userType === "candidate" ? "primary" : "secondary"}
                        >
                            Đăng nhập
                        </Button>
                    </form>

                    <Divider text="Hoặc đăng nhập bằng" />

                    <div
                        id="google-login-button"
                        className="flex w-full justify-center"
                    />

                    <div className="mt-10 text-center space-y-2">
                        <p className="text-sm text-slate-500">
                            {config.registerText}{" "}
                            <Link
                                href={config.registerHref}
                                className={cn(
                                    "font-bold hover:underline",
                                    userType === "candidate" ? "text-[#00B14F]" : "text-[#0F172A]"
                                )}
                            >
                                Đăng ký ngay
                            </Link>
                        </p>
                        <p className="text-sm text-slate-500">
                            {userType === "candidate" ? (
                                <>
                                    Bạn là nhà tuyển dụng?{" "}
                                    <Link
                                        href="/employer/login"
                                        className="font-bold hover:underline text-[#00B14F]"
                                    >
                                        Đăng nhập tại đây
                                    </Link>
                                </>
                            ) : (
                                <>
                                    Bạn là người tìm việc?{" "}
                                    <Link
                                        href="/candidate/login"
                                        className="font-bold hover:underline text-[#0F172A]"
                                    >
                                        Đăng nhập tại đây
                                    </Link>
                                </>
                            )}
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

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white lg:p-16">
                    <div className="mb-8 max-w-xl">
                        <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                            {config.backgroundTitle}{" "}
                            <span className="text-[#00B14F]">
                                {config.backgroundHighlight}
                            </span>
                        </h2>

                        <p className="text-lg leading-relaxed text-slate-200 font-light">
                            {config.backgroundDescription}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}