import { useNavigate } from "react-router";
import { Eye, EyeOff, MailQuestionMark } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from "react";
import { message, Modal } from "antd";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../api";
import { AxiosError } from "axios";

const loginSchema = z.object({
    email: z.email().min(1, "Email is required").max(255, "Email must be at most 255 characters"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must be at most 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    code: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const defaultValues: LoginFormData = {
    email: '',
    password: '',
    code: '',
};

function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (!isModalOpen) return;
        setTimer(30);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isModalOpen]);

    const { mutateAsync: login, isPending } = useMutation({
        mutationFn: async (body: { email: string; password: string }) => {
            const { data } = await api.post('/accounts/login', body);
            return data;
        },
        onError: (err) => {
            const error = err as AxiosError<{ title?: string }>;
            if (error.status === 409) {
                setIsModalOpen(true)
            }
            else {
                message.error(error.response?.data?.title || "Code error");

            }
        },
        onSuccess: (data) => {
            localStorage.setItem("token", data.accessToken);
            message.success('Login successful');
            navigate('/products');
        },
    });

    const { mutateAsync: sendCode, isPending: isPendingCode } = useMutation({
        mutationFn: async (body: { email: string; code: string }) => {
            const { data } = await api.post(
                `/Accounts/verify-email`,
                body
            ); return data;
        },
        onError: (err) => {
            const error = err as AxiosError<{ title?: string }>;
            message.error(error.response?.data?.title || "Code error");
        },
        onSuccess: () => {
            message.success('Verified!');
        },
    });

    const { handleSubmit, control, getValues, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues,
    });

    const onSubmit: SubmitHandler<LoginFormData> = async (values) => {
        try {
            await login({ email: values.email, password: values.password });
        } catch {
            // ntihing
        }
    };

    const onSubmitCode: SubmitHandler<LoginFormData> = async (values) => {
        try {
            await sendCode({
                email: values.email,
                code: values.code ?? '',
            });
            onSubmit(values)
        } catch {
            // nthing
        }
    };

    return (
        <div className="p-6">
            <section className="bg-linear-to-r from-white to-blue-50 border rounded-2xl m-auto md:w-100 mt-20 flex flex-col items-center py-16">
                <h1 className="text-3xl font-bold mb-6">Login</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="isabey">
                        <label className="block font-medium mb-1">Email*</label>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <input {...field} autoFocus placeholder="Enter email" type="email" className="editinput" />
                            )}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1 max-w-48">{errors.email.message}</p>}
                    </div>

                    <div className="isabey">
                        <label className="block font-medium mb-1">Password*</label>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <div className="relative">
                                    <input
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        className="editinput"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            )}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1 max-w-48">{errors.password.message}</p>}
                    </div>

                    <button
                        type="button"
                        disabled={isPending}
                        onClick={handleSubmit(onSubmit)}
                        className="cursor-pointer w-full bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm rounded-md py-2"
                    >
                        {isPending ? "Please wait..." : "Continue"}
                    </button>

                    <a onClick={() => navigate("/register")} className="cursor-pointer text-blue-600 flex justify-center gap-3">
                        Don't have an account?
                    </a>
                    <Modal
                        closable={false}
                        width={300}
                        style={{ top: 130 }}
                        open={isModalOpen}
                        footer={
                            timer > 0
                                ? <p className="text-center text-gray-400 text-sm">Resend code in {timer}s</p>
                                : <button
                                    onClick={() => {
                                        const { email, password } = getValues();
                                        login({ email, password });
                                        setTimer(30);
                                    }}
                                    className="flex text-blue-700 m-auto cursor-pointer hover:underline duration-200"
                                >
                                    Resend code
                                </button>
                        }
                    >
                        <div className="my-4">
                            <div className="flex flex-col justify-center items-center">
                                <div className="bg-amber-300 p-4 rounded-full"><MailQuestionMark /></div>
                                <h1 className="my-4 text-lg font-medium">Check your mailbox</h1>
                            </div>

                            <Controller
                                name="code"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        autoFocus
                                        placeholder="Enter code"
                                        minLength={6}
                                        maxLength={6}
                                        className="editinput tracking-widest text-[16px] text-center"
                                    />
                                )}
                            />
                            {errors.code && <p className="text-red-500 text-sm mt-1 max-w-48">{errors.code.message}</p>}
                        </div>

                        <button
                            type="button"
                            disabled={isPendingCode || isPending}
                            onClick={handleSubmit(onSubmitCode)}
                            className="cursor-pointer hover:shadow-xl duration-200 w-full bg-black disabled:bg-gray-400 text-white font-medium text-sm rounded-md py-2"
                        >
                            {isPendingCode || isPending ? "Please wait..." : "Complete"}
                        </button>
                    </Modal>
                </form>


            </section>
        </div>
    );
}

export default Login;