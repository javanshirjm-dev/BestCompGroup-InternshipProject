import { useSearchParams } from "react-router";

export type ParamValue =
    | string
    | number
    | boolean
    | (string | number)[]
    | null
    | undefined;

const useAppSearchParams = (arrayKeys: string[] = []) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const getArray = (key: string): string[] => {
        return searchParams.getAll(key);
    };

    const params: Record<string, any> = {};

    searchParams.forEach((value, key) => {
        if (arrayKeys.includes(key)) {
            if (!params[key]) {
                params[key] = [];
            }

            params[key].push(value);
            return;
        }

        // Parse booleans
        if (value === "true") {
            params[key] = true;
        } else if (value === "false") {
            params[key] = false;
        } else {
            params[key] = value;
        }
    });

    // Make sure declared array params always exist
    arrayKeys.forEach((key) => {
        if (!params[key]) {
            params[key] = [];
        }
    });

    const setParams = (
        keyOrPatch: string | Record<string, ParamValue>,
        value?: ParamValue,
        isToggle = false
    ) => {
        const next = new URLSearchParams(searchParams);

        const patch: Record<string, ParamValue> =
            typeof keyOrPatch === "string"
                ? { [keyOrPatch]: value }
                : keyOrPatch;

        Object.entries(patch).forEach(([key, val]) => {
            // Remove old value(s)
            next.delete(key);

            if (isToggle && typeof keyOrPatch === "string") {
                const current = searchParams.getAll(key);
                const valueString = String(val);

                const updated = current.includes(valueString)
                    ? current.filter((item) => item !== valueString)
                    : [...current, valueString];

                updated.forEach((item) => {
                    next.append(key, item);
                });

                return;
            }

            if (
                val === null ||
                val === undefined ||
                val === "" ||
                val === false
            ) {
                return;
            }

            if (Array.isArray(val)) {
                val.forEach((item) => {
                    next.append(key, String(item));
                });
            } else {
                next.set(key, String(val));
            }
        });

        setSearchParams(next);
    };

    const toggleParam = (
        key: string,
        value: string | number
    ) => {
        const current = searchParams.getAll(key);
        const valueString = String(value);

        const next = new URLSearchParams(searchParams);

        next.delete(key);

        const updated = current.includes(valueString)
            ? current.filter((item) => item !== valueString)
            : [...current, valueString];

        updated.forEach((item) => {
            next.append(key, item);
        });

        setSearchParams(next);
    };

    const clearParams = () => {
        setSearchParams({});
    };

    return {
        params,
        getArray,
        setParams,
        toggleParam,
        clearParams,
    };
};

export default useAppSearchParams;