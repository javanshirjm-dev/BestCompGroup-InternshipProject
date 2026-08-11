import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import message from "antd/es/message";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import api from "../../../api";
import { Modal } from 'antd';
import { MailQuestionMark } from "lucide-react";

const registerSchema = z.object({
    name: z.string().min(1, "Name is required").max(255, { message: "Name must be at most 255 characters" }),
    surname: z.string().min(1, "Surname is required").max(255, { message: "Surname must be at most 255 characters" }),
    email: z.email().min(1, "Email is required").max(255, { message: "Email must be at most 255 characters" }),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must be at most 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    Code: z.string()
});
type RegisterFormData = z.infer<typeof registerSchema>;

const userValues = {
    name: '',
    surname: '',
    email: '',
    password: '',
    Code: ''

}


function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };


    const { mutateAsync: addUser, isPending: isPendingUser, isSuccess: isSuccessUser } = useMutation({
        mutationFn: async (body: {
            name: string;
            surname: string;
            email: string;
            password: string;
            Code: string;

        }) => {
            const res = await api.post(`/accounts/register`, body);
            return res;
        },

        onError: (err) => {
            message.error(err.message || 'Couldnt register');
        },
        onSuccess: () => {
            showModal()
        },
    });

    const { mutateAsync: addCode, isPending: isPendingCode } = useMutation({
        mutationFn: async (body: {
            email: string;
            Code: string;
        }) => {
            const { data } = await api.post(
                `/Accounts/verify-email`,
                body
            );

            return data;

        },

        onError: (err) => {
            message.error(err.message || 'code error');
        },
        onSuccess: () => {
            message.success('Verification successful');
            navigate("/login");

        },
    });

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<typeof userValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: userValues
    });

    const onSubmit: SubmitHandler<RegisterFormData> = async (values: typeof userValues) => {
        try {
            await addUser({
                ...values,

            });

        } catch {
            //for example nothing
        }
    };
    const onSubmitLast: SubmitHandler<RegisterFormData> = async (values) => {
        try {
            await addCode({
                email: values.email,
                Code: values.Code,
            });
        } catch {
            // handle error
        }
    };

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

    return (
        <div className="p-6">
            <section className="bg-linear-to-r from-white to-blue-50 border rounded-2xl m-auto md:w-100 mt-10 flex flex-col items-center py-16">
                <h1 className="text-3xl font-bold mb-6">Register</h1>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={isSuccessUser ? handleSubmit(onSubmitLast) : handleSubmit(onSubmit)}
                >
                    <div className="isabey">
                        <label className="block font-medium mb-1">Name*</label>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: "Name is required" }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    placeholder="Enter name"
                                    className="editinput"
                                />
                            )}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1 max-w-48">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="isabey">
                        <label className="block font-medium mb-1">Surname*</label>
                        <Controller
                            name="surname"
                            control={control}
                            rules={{ required: "Surname is required" }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    placeholder="Enter surname"
                                    className="editinput"
                                />
                            )}
                        />
                        {errors.surname && (
                            <p className="text-red-500 text-sm mt-1 max-w-48">{errors.surname.message}</p>
                        )}
                    </div>
                    <div className="isabey">
                        <label className="block font-medium mb-1">Email*</label>
                        <Controller
                            name="email"
                            control={control}
                            rules={{ required: "Email adress is required" }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    placeholder="Enter email"
                                    type="email"
                                    className="editinput"
                                />
                            )}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1 max-w-48">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="isabey">
                        <label className="block font-medium mb-1">Password*</label>
                        <Controller
                            name="password"
                            control={control}
                            rules={{ required: "Password is required" }}
                            render={({ field }) => (
                                <div className="relative">
                                    <input
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        className="editinput pr-10"
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
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1 max-w-48">{errors.password.message}</p>
                        )}
                    </div>


                    <Modal
                        closable={false}
                        width={300}
                        style={{ top: 130 }}
                        open={isModalOpen}
                        footer={[
                            timer > 0
                                ? <p className="text-center text-gray-400 text-sm">Resend code in {timer}s</p>
                                : <button
                                    onClick={() => {
                                        handleSubmit(onSubmit)();
                                        setTimer(30);
                                    }}
                                    className="flex text-blue-700 m-auto cursor-pointer hover:underline duration-200"
                                >
                                    Resend code
                                </button>
                        ]}
                    >
                        <div className="my-4">
                            <div className="flex flex-col justify-center items-center">
                                <div className="bg-amber-300 p-4 rounded-full"><MailQuestionMark /></div>
                                <h1 className="my-4 text-lg font-medium">Check your mailbox</h1>
                            </div>

                            <Controller
                                name="Code"
                                control={control}
                                rules={{ required: "Code is required" }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        placeholder="Enter code"
                                        minLength={6}
                                        maxLength={6}
                                        className="editinput tracking-widest text-[16px] text-center"
                                    />
                                )}
                            />
                            {errors.Code && (
                                <p className="text-red-500 text-sm mt-1 max-w-48">{errors.Code.message}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={isPendingCode}
                            onClick={handleSubmit(onSubmitLast)}
                            className="cursor-pointer hover:shadow-xl duration-200 w-full bg-black  disabled:bg-gray-400 text-white font-medium text-sm rounded-md py-2"
                        >
                            {isPendingCode ? "Please wait..." : "Complete"}

                        </button>
                    </Modal>

                    <button
                        type="button"
                        disabled={isPendingUser}
                        onClick={handleSubmit(onSubmit)}
                        className="cursor-pointer w-full bg-blue-700  disabled:bg-blue-400 text-white font-medium text-sm rounded-md py-2"
                    >
                        {isPendingUser ? "Please wait..." : "Continue"}

                    </button>


                    <a onClick={() => navigate("/login")} className="cursor-pointer text-blue-600 flex justify-center gap-3">
                        Already have an account?
                    </a>
                </form>
            </section>
        </div >
    );
}

export default Register;