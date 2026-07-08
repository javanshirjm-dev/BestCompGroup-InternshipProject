import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

function useDebounce<T extends string>(value: T, delay: number = 300): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            setSearchParams(prev => {
                if (value.length > 0) {
                    prev.set('search', value);
                    prev.delete('page');
                } else {
                    prev.delete('search');
                }
                return prev;
            })
        }, delay);

        return () => clearTimeout(timeoutRef.current);
    }, [value, delay]);

    return (searchParams.get('search') as T) ?? '';
}

export default useDebounce;