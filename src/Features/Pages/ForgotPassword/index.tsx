import { useMutation } from "@tanstack/react-query";
import api from "../../../api";
import { message } from "antd";
import { useNavigate } from "react-router";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

const forgetPasswordSchema = z.object({
    email: z.email().min(1, "Email is required").max(255, "Email must be at most 255 characters"),
})

type forgetFormData = z.infer<typeof forgetPasswordSchema>;

const defaultValues: forgetFormData = {
    email: '',
};

const ForgotPassword = () => {
    const navigate = useNavigate()



    const { handleSubmit, control, formState: { errors } } = useForm<forgetFormData>({
        resolver: zodResolver(forgetPasswordSchema),
        defaultValues,
    });

    const { mutateAsync: enteremail, isPending } = useMutation({
        mutationFn: async (body: { email: string }) => {
            const { data } = await api.post("/accounts/forget-password", body);
            return data;
        },
        onSuccess: () => {
            message.success("Check your email for a reset link");
        },
        onError: () => {
            message.error("Something went wrong");
        },
    });

    const onSubmit: SubmitHandler<forgetFormData> = async (values) => {
        try {
            await enteremail({ email: values.email })
        }
        catch {
        }
    }

    return (
        <section className="bg-linear-to-r from-white to-blue-50 border rounded-2xl m-auto md:w-100 mt-26 flex flex-col items-center py-16">
            <h1 className="text-3xl font-bold mb-6">Forget</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="tam-input">
                    <label className=" font-medium mb-1"> Your email*</label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <div className="relative w-60">
                                <input {...field}
                                    autoFocus
                                    className="editinput"
                                    type='email'
                                    placeholder="Enter email"
                                />
                            </div>
                        )}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1 max-w-48">{errors.email.message}</p>}
                </div>

                <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSubmit(onSubmit)}
                    className="cursor-pointer w-full bg-blue-700 disabled:bg-blue-400 text-white hover:shadow-lg duration-200 font-medium text-sm rounded-md py-2"
                >
                    {isPending ? "Loading..." : "Complete"}
                </button>
                <a onClick={() => navigate("/auth/login")} className="cursor-pointer  text-blue-700 flex justify-center ">
                    Already have an account?
                </a>
            </form>

        </section >
    );
};

export default ForgotPassword;