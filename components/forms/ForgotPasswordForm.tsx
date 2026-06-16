"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
    forgotPasswordApi,
    resendPasswordResetCodeApi,
    verifyPasswordResetCodeApi,
    changePasswordApi,
} from "@/services/authService";
import EmployerLogo from "../icons/EmployerLogo";
import LogoIcon from "../icons/LogoIcon";

type Step = "email" | "verification" | "password";

interface ForgotPasswordFormProps {
    userType: "candidate" | "employer";
}

export default function ForgotPasswordForm({ userType }: ForgotPasswordFormProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [errors, setErrors] = useState({
        email: "",
        code: "",
        password: "",
        confirmPassword: "",
    });

    // Step 1: Send verification code
    const handleSendCode = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = {
            email: "",
            code: "",
            password: "",
            confirmPassword: "",
        };

        if (!email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (newErrors.email) {
            setErrors(newErrors);
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        setLoading(true);
        try {
            await forgotPasswordApi(email);
            setStep("verification");
            setCountdown(60);
            toast.success("Mã xác thực đã được gửi tới email của bạn");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Gửi mã thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Resend code
    const handleResendCode = async () => {
        setResendLoading(true);
        try {
            await resendPasswordResetCodeApi(email);
            setCountdown(60);
            toast.success("Mã xác thực đã được gửi lại");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Gửi lại mã thất bại");
        } finally {
            setResendLoading(false);
        }
    };

    // Step 2: Verify code
    const handleVerifyCode = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = {
            email: "",
            code: "",
            password: "",
            confirmPassword: "",
        };

        if (!code.trim()) {
            newErrors.code = "Mã xác thực không được để trống";
        } else if (code.length !== 6) {
            newErrors.code = "Mã xác thực phải có 6 chữ số";
        }

        if (newErrors.code) {
            setErrors(newErrors);
            toast.error("Vui lòng kiểm tra lại mã xác thực");
            return;
        }

        setLoading(true);
        try {
            const response = await verifyPasswordResetCodeApi(email, code);
            setResetToken(response.data);
            setStep("password");
            toast.success("Mã xác thực hợp lệ");
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

    // Step 3: Change password
    const handleChangePassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = {
            email: "",
            code: "",
            password: "",
            confirmPassword: "",
        };

        let hasError = false;

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
            await changePasswordApi(resetToken, password);
            toast.success("Đổi mật khẩu thành công");
            setTimeout(() => {
                router.push(`/${userType}/login`);
            }, 1500);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === "verification") {
            setStep("email");
            setCode("");
        } else if (step === "password") {
            setStep("verification");
            setPassword("");
            setConfirmPassword("");
        }
        setErrors({
            email: "",
            code: "",
            password: "",
            confirmPassword: "",
        });
    };

    const loginPath =
        userType === "candidate" ? "/candidate/login" : "/employer/login";

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
                        {step === "email" && (
                            <>
                                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                    Quên mật khẩu?
                                </h2>
                                <p className="mt-2 text-lg text-slate-500 font-light">
                                    Nhập email của bạn để nhận mã xác thực
                                </p>
                            </>
                        )}
                        {step === "verification" && (
                            <>
                                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                    Xác thực email
                                </h2>
                                <p className="mt-2 text-lg text-slate-500 font-light">
                                    Nhập mã xác thực được gửi đến {email}
                                </p>
                            </>
                        )}
                        {step === "password" && (
                            <>
                                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                    Đặt mật khẩu mới
                                </h2>
                                <p className="mt-2 text-lg text-slate-500 font-light">
                                    Nhập mật khẩu mới của bạn
                                </p>
                            </>
                        )}
                    </div>

                    {/* Step 1: Email */}
                    {step === "email" && (
                        <form onSubmit={handleSendCode} className="space-y-6">
                            <Input
                                id="email"
                                label="EMAIL"
                                placeholder="nguoidung@example.com"
                                type="email"
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

                            <Button 
                                type="submit" 
                                isLoading={loading}
                                variant={userType === "candidate" ? "primary" : "secondary"}
                            >
                                Gửi mã xác thực
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Verification */}
                    {step === "verification" && (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <Input
                                id="code"
                                label="MÃ XÁC THỰC"
                                placeholder="000000"
                                maxLength={6}
                                value={code}
                                error={errors.code}
                                variant={userType === "candidate" ? "primary" : "secondary"}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setCode(value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        code: "",
                                    }));
                                }}
                            />

                            <Button 
                                type="submit" 
                                isLoading={loading}
                                variant={userType === "candidate" ? "primary" : "secondary"}
                            >
                                Xác thực mã
                            </Button>

                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-sm text-slate-500 font-medium">
                                        Gửi lại mã sau {countdown}s
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={resendLoading}
                                        className={cn(
                                            "text-sm font-medium hover:underline disabled:opacity-50 border-none bg-transparent cursor-pointer",
                                            userType === "candidate" ? "text-[#00B14F]" : "text-[#0F172A]"
                                        )}
                                    >
                                        Gửi lại mã
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Step 3: Password */}
                    {step === "password" && (
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <Input
                                id="password"
                                label="MẬT KHẨU MỚI"
                                placeholder="••••••••"
                                type="password"
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

                            <Input
                                id="confirmPassword"
                                label="XÁC NHẬN MẬT KHẨU"
                                placeholder="••••••••"
                                type="password"
                                value={confirmPassword}
                                error={errors.confirmPassword}
                                variant={userType === "candidate" ? "primary" : "secondary"}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        confirmPassword: "",
                                    }));
                                }}
                            />

                            <Button 
                                type="submit" 
                                isLoading={loading}
                                variant={userType === "candidate" ? "primary" : "secondary"}
                            >
                                Đặt mật khẩu mới
                            </Button>
                        </form>
                    )}

                    {/* Navigation */}
                    <div className="mt-8">
                        {step !== "email" && (
                            <button
                                onClick={handleBack}
                                className={cn(
                                    "mb-4 flex items-center gap-2 text-sm font-medium hover:underline border-none bg-transparent cursor-pointer",
                                    userType === "candidate" ? "text-[#00B14F]" : "text-[#0F172A]"
                                )}
                            >
                                <ChevronLeft size={16} />
                                Quay lại
                            </button>
                        )}

                        <div className="text-center">
                            <p className="text-sm text-slate-550 font-medium">
                                Nhớ mật khẩu?{" "}
                                <Link 
                                    href={loginPath} 
                                    className={cn(
                                        "font-bold hover:underline",
                                        userType === "candidate" ? "text-[#00B14F]" : "text-[#0F172A]"
                                    )}
                                >
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    "hidden md:flex md:w-1/2 md:items-center md:justify-center",
                    userType === "candidate"
                        ? "bg-gradient-to-br from-[#00B14F] to-[#00873D]"
                        : "bg-gradient-to-br from-[#0F172A] to-[#1E293B]"
                )}
            >
                <div className="text-center text-white p-8">
                    <h3 className="mb-4 text-3xl font-extrabold tracking-tight">Đà Nẵng Jobs</h3>
                    <p className="text-lg opacity-90 font-light">Cơ hội việc làm tại thành phố Đà Nẵng đáng sống</p>
                </div>
            </div>
        </div>
    );
}
