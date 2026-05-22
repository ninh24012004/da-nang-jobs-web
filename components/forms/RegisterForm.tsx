"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

import LogoIcon from "@/components/icons/LogoIcon";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
    candidateRegisterApi,
    employerRegisterApi,
    resendCodeApi,
    verifyCodeApi,
} from "@/services/authService";
import GoogleIcon from "../icons/GoogleIcon";
import Divider from "../ui/Divider";

interface RegisterFormProps {
    userType: "candidate" | "employer";
}

type Step = "register" | "verification";

const initialErrors = {
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: "",
    code: "",
};

export default function RegisterForm({ userType }: RegisterFormProps) {
    const [step, setStep] = useState<Step>("register");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [errors, setErrors] = useState(initialErrors);

    const loginPath =
        userType === "candidate" ? "/candidate/login" : "/employer/login";

    const title =
        userType === "candidate"
            ? "Tạo tài khoản ứng viên"
            : "Tạo tài khoản nhà tuyển dụng";

    const description =
        userType === "candidate"
            ? "Bắt đầu hành trình sự nghiệp tại Đà Nẵng"
            : "Đăng tuyển và tìm kiếm ứng viên phù hợp";

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = { ...initialErrors };
        let hasError = false;

        if (!fullName.trim()) {
            newErrors.fullName = "Họ tên không được để trống";
            hasError = true;
        } else if (fullName.trim().length < 2 || fullName.trim().length > 100) {
            newErrors.fullName = "Họ tên phải từ 2 đến 100 ký tự";
            hasError = true;
        }

        if (userType === "employer") {
            if (!companyName.trim()) {
                newErrors.companyName = "Tên công ty không được để trống";
                hasError = true;
            } else if (
                companyName.trim().length < 2 ||
                companyName.trim().length > 100
            ) {
                newErrors.companyName = "Tên công ty phải từ 2 đến 100 ký tự";
                hasError = true;
            }
        }

        if (!email.trim()) {
            newErrors.email = "Email không được để trống";
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = "Email không hợp lệ";
            hasError = true;
        }

        if (!password.trim()) {
            newErrors.password = "Mật khẩu không được để trống";
            hasError = true;
        } else if (password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
            hasError = true;
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
            hasError = true;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        setLoading(true);

        try {
            if (userType === "candidate") {
                await candidateRegisterApi(
                    email.trim(),
                    password,
                    fullName.trim()
                );
            } else {
                await employerRegisterApi(
                    email.trim(),
                    password,
                    fullName.trim(),
                    companyName.trim()
                );
            }

            setStep("verification");
            setCountdown(60);
            toast.success("Mã xác thực đã được gửi tới email của bạn");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0 || resendLoading) return;

        setResendLoading(true);

        try {
            await resendCodeApi(email.trim());
            setCountdown(60);
            toast.success("Mã xác thực đã được gửi lại");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Gửi lại mã thất bại");
        } finally {
            setResendLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = { ...initialErrors };

        if (!code.trim()) {
            newErrors.code = "Mã xác thực không được để trống";
        } else if (!/^\d{6}$/.test(code)) {
            newErrors.code = "Mã xác thực phải có 6 chữ số";
        }

        if (newErrors.code) {
            setErrors(newErrors);
            toast.error("Vui lòng kiểm tra lại mã xác thực");
            return;
        }

        setLoading(true);

        try {
            await verifyCodeApi(email.trim(), code);
            toast.success("Đăng ký tài khoản thành công");
            window.location.href = loginPath;
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Xác thực mã thất bại");
            setErrors({
                ...newErrors,
                code: "Mã xác thực không hợp lệ hoặc đã hết hạn",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep("register");
        setCode("");
        setErrors(initialErrors);
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-sans text-[#1a1a1a]">
            <div className="flex w-full flex-col justify-center px-6 sm:px-12 md:w-1/2 md:px-16 lg:px-24">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-4">
                        <LogoIcon />
                    </div>

                    <div className="mb-8">
                        {step === "register" && (
                            <>
                                <h2 className="text-2xl font-bold text-[#0d1b2a] md:text-3xl">
                                    {title}
                                </h2>
                                <p className="mt-2 text-lg text-gray-500">
                                    {description}
                                </p>
                            </>
                        )}

                        {step === "verification" && (
                            <>
                                <h2 className="text-2xl font-bold text-[#0d1b2a] md:text-3xl">
                                    Xác thực email
                                </h2>
                                <p className="mt-2 text-lg text-gray-500">
                                    Nhập mã xác thực được gửi đến {email}
                                </p>
                            </>
                        )}
                    </div>

                    {step === "register" && (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <Input
                                id="fullName"
                                label="HỌ TÊN"
                                placeholder="Nguyễn Văn A"
                                type="text"
                                value={fullName}
                                error={errors.fullName}
                                onChange={(e) => {
                                    setFullName(e.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        fullName: "",
                                    }));
                                }}
                            />

                            {userType === "employer" && (
                                <Input
                                    id="companyName"
                                    label="TÊN CÔNG TY"
                                    placeholder="Công ty ABC"
                                    type="text"
                                    value={companyName}
                                    error={errors.companyName}
                                    onChange={(e) => {
                                        setCompanyName(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            companyName: "",
                                        }));
                                    }}
                                />
                            )}

                            <Input
                                id="email"
                                label="EMAIL"
                                placeholder="nguoidung@example.com"
                                type="email"
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
                                placeholder="••••••••"
                                type="password"
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

                            <Input
                                id="confirmPassword"
                                label="XÁC NHẬN MẬT KHẨU"
                                placeholder="••••••••"
                                type="password"
                                value={confirmPassword}
                                error={errors.confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        confirmPassword: "",
                                    }));
                                }}
                            />

                            <Button type="submit" isLoading={loading}>
                                Đăng ký tài khoản
                            </Button>
                        </form>
                    )}

                    {step === "verification" && (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <Input
                                id="code"
                                label="MÃ XÁC THỰC"
                                placeholder="000000"
                                maxLength={6}
                                value={code}
                                error={errors.code}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setCode(value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        code: "",
                                    }));
                                }}
                            />

                            <Button type="submit" isLoading={loading}>
                                Xác thực mã
                            </Button>

                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Gửi lại mã sau {countdown}s
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={resendLoading}
                                        className="text-sm font-medium text-[#006b7a] hover:underline disabled:opacity-50"
                                    >
                                        {resendLoading ? "Đang gửi..." : "Gửi lại mã"}
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                    <div className="mt-8">
                        {step !== "register" && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="mb-4 flex items-center gap-2 text-sm font-medium text-[#006b7a] hover:underline"
                            >
                                <ChevronLeft size={16} />
                                Quay lại
                            </button>
                        )}

                        <Divider text="Hoặc đăng nhập bằng" />

                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center justify-center gap-3 py-2.5 text-sm font-medium text-[#1a1a1a] hover:bg-gray-100 w-full cursor-pointer"
                        >
                            <GoogleIcon />
                            Google
                        </Button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Đã có tài khoản?{" "}
                                <Link
                                    href={loginPath}
                                    className="font-medium text-[#006b7a] hover:underline"
                                >
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#006b7a] to-[#004d5a] md:flex md:w-1/2 md:items-center md:justify-center">
                <Image
                    src="/images/background/register-bg.png"
                    alt="Register Background"
                    fill
                    priority
                    className="object-cover object-center"
                />

                <div className="absolute inset-0 bg-black/30" />

                <div className="relative z-10 text-center text-white">
                    <h3 className="mb-4 text-3xl font-bold">Đà Nẵng Jobs</h3>
                    <p className="text-lg opacity-80">
                        Cơ hội việc làm tại Đà Nẵng
                    </p>
                </div>
            </div>
        </div>
    );
}