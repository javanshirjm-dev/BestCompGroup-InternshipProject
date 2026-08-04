import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';

const userValues = {
    email: '',
    password: '',

}

function Login() {
    const navigate = useNavigate();
    const { mutate: addUser } = useMutation({
        mutationFn: async (body: {
            email: string;
            password: string;

        }) => {
            const res = await fetch(
                `https://shoppingwepapi-ercpgggcdxffbbat.polandcentral-01.azurewebsites.net/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
            );

            if (!res.ok) throw new Error('Xəta baş verdi');
            return res.json();
        },
    });
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<typeof userValues>();
    console.log('errors:', errors);

    const onSubmit = async (values: typeof userValues) => {
        const { ...userdata } = values;

        await addUser({
            ...userdata,
        });

        navigate(`/products`);
    };

    return (
        <div className="p-6">
            <a onClick={() => navigate("/products")} className="w-42 cursor-pointer font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
            <section className="bg-linear-to-r from-white to-blue-50 border rounded-2xl m-auto w-100 mt-20 flex flex-col items-center py-16">
                <h1 className="text-3xl font-bold mb-6">Login</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>


                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        className="cursor-pointer w-full bg-blue-700 text-white font-medium text-sm rounded-md py-2"
                    >
                        Continue
                    </button>
                    <a onClick={() => navigate("/register")} className="cursor-pointer text-blue-600 flex justify-center gap-3">
                        Don't have an account?
                    </a>
                </form>
            </section>
        </div>
    );
}

export default Login;