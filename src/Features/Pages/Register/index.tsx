import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import message from "antd/es/message";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
    verificationcode: z.string()
});
type RegisterFormData = z.infer<typeof registerSchema>;

const userValues = {
    name: '',
    surname: '',
    email: '',
    password: '',
    verificationcode: ''

}


function Register() {
    const navigate = useNavigate();

    const { mutateAsync: addUser, isPending: isPendingUser, isSuccess: isSuccessUser } = useMutation({
        mutationFn: async (body: {
            name: string;
            surname: string;
            email: string;
            password: string;
            verificationcode: string;

        }) => {
            const res = await fetch(
                `https://shoppingwepapi-ercpgggcdxffbbat.polandcentral-01.azurewebsites.net/api/Accounts/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
            );

            if (!res.ok) {
                const eror = await res.json();
                throw new Error(eror.title || `Failed to register user: Status ${res.status}`);
            }
            return res.json();

        },

        onError: (err) => {
            message.error(err.message || 'Couldnt register');
        },
        onSuccess: () => {
            message.info('Check your email adress');
        },
    });

    const { mutateAsync: addCode, isPending: isPendingCode } = useMutation({
        mutationFn: async (body: {
            name: string;
            surname: string;
            email: string;
            password: string;
            verificationcode: string;

        }) => {
            const res = await fetch(
                `https://shoppingwepapi-ercpgggcdxffbbat.polandcentral-01.azurewebsites.net/api/Accounts/code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
            );

            if (!res.ok) {
                const eror = await res.json();
                throw new Error(eror.title || `Failed to register user: Status ${res.status}`);
            }
            return res.json();

        },

        onError: (err) => {
            message.error(err.message || 'code error');
        },
        onSuccess: () => {
            message.info('Verification successful');
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
    const onSubmitLast: SubmitHandler<RegisterFormData> = async (verificationcode) => {
        try {
            await addCode({
                ...verificationcode,
            });
            navigate("/products")
        } catch {
            //for codesending
        }
    };

    return (
        <div className="p-6">
            <a onClick={() => navigate("/products")} className="w-42 cursor-pointer font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
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
                                <input
                                    {...field}
                                    type="password"
                                    placeholder="Enter password"
                                    className="editinput"
                                />
                            )}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1 max-w-48">{errors.password.message}</p>
                        )}
                    </div>

                    {isSuccessUser &&
                        <div>
                            <label className="block font-medium mb-1">Verification code*</label>
                            <Controller
                                name="verificationcode"
                                control={control}
                                rules={{ required: "Code is required" }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        placeholder="Your 6 digit code"
                                        className="editinput"
                                    />
                                )}
                            />
                            {errors.verificationcode && (
                                <p className="text-red-500 text-sm mt-1 max-w-48">{errors.verificationcode.message}</p>
                            )}
                        </div>
                    }

                    {!isSuccessUser ?
                        <button
                            type="button"
                            disabled={isPendingUser}
                            onClick={handleSubmit(onSubmit)}
                            className="cursor-pointer w-full bg-blue-700 text-white font-medium text-sm rounded-md py-2"
                        >
                            {isPendingUser ? "Please wait..." : "Continue"}

                        </button> :
                        <button
                            type="button"
                            disabled={isPendingCode}
                            onClick={handleSubmit(onSubmitLast)}
                            className="cursor-pointer w-full bg-black text-white font-medium text-sm rounded-md py-2"
                        >
                            {isPendingCode ? "Please wait..." : "Complete"}

                        </button>
                    }
                    <a onClick={() => navigate("/login")} className="cursor-pointer text-blue-600 flex justify-center gap-3">
                        Already have an account?
                    </a>
                </form>
            </section>
        </div>
    );
}

export default Register;