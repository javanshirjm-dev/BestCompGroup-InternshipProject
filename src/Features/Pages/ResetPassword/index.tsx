import { useNavigate, useSearchParams } from "react-router";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";
import { Eye, EyeOff, FaceSlightlyFrowning } from "lucide-react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../api";
import { AxiosError } from "axios";

const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must be at most 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
const defaultValues: ResetPasswordFormData = { newPassword: "", confirmPassword: "" };


const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [showPassword, setShowPassword] = useState(false);

    const { mutateAsync: sendresetpassword, isPending } = useMutation({
        mutationFn: async (body: { newPassword: string, confirmPassword: string, token: string }) => {
            const { data } = await api.post('/accounts/reset-password', body)
            return data;
        },
        onSuccess: () => {
            message.success("Password reset — please log in");
            navigate("/auth/login");
        },
        onError: (err) => {
            const error = err as AxiosError<{ title?: string }>;
            message.error(error.response?.data?.title || "Reset failed");
        }
    })

    const { handleSubmit, control, formState: { errors } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues,
    });

    const onSubmit: SubmitHandler<ResetPasswordFormData> = async (deyer) => {
        try {
            await sendresetpassword({
                newPassword: deyer.newPassword,
                confirmPassword: deyer.confirmPassword,
                token: token ?? '',
            });
        } catch {
            //nthuigbn
        }
    }

    if (!token) {
        return <div className="flex flex-col min-h-screen justify-center items-center my-auto">
            <FaceSlightlyFrowning />
            <p className="text-gray-500 my-2">Invalid or expired reset link</p>
            <a onClick={() => navigate("/auth/login")} className="cursor-pointer text-sm hover:underline  text-blue-700 ">
                Back to login?
            </a>
        </div>;
    }

    return (
        <section className="bg-linear-to-r from-white to-blue-50 border rounded-2xl m-auto md:w-100 mt-26 flex flex-col items-center py-16">
            <h1 className="text-3xl font-bold mb-6">Reset</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="tam-input">
                    <label className=" font-medium mb-1">New Password*</label>
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <div className="relative w-60">
                                <input {...field}
                                    autoFocus
                                    className="editinput"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                />
                                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        )}
                    />
                    {errors.newPassword && <p className="text-red-500 text-sm mt-1 max-w-48">{errors.newPassword.message}</p>}
                </div>

                <div className="tam-input">
                    <label className=" font-medium mb-1">Confirm Password*</label>
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <div className="relative ">
                                <input {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    className="editinput"
                                />
                                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        )}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 max-w-48">{errors.confirmPassword.message}</p>}
                </div>

                <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSubmit(onSubmit)}
                    className="cursor-pointer w-full bg-blue-700 disabled:bg-blue-400 text-white hover:shadow-lg duration-200 font-medium text-sm rounded-md py-2"
                >
                    {isPending ? "Finalizing..." : "Complete"}
                </button>
                <a onClick={() => navigate("/auth/login")} className="cursor-pointer text-blue-700 flex justify-center ">
                    Back to login
                </a>
            </form>
        </section >
    )
}

export default ResetPassword