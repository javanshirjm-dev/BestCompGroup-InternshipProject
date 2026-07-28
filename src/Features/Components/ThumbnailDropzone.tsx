import { useState, useOptimistic, useTransition, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { Progress } from "antd";
import axios from "axios";
import type { ProductImage } from "../../Types/Global";

// ─── Constants ──────────────────────────────────────────────

const BASE_URL = "https://shoppingwepapi-ercpgggcdxffbbat.polandcentral-01.azurewebsites.net/api/ProductImages";
const MAX_IMAGES = 10;

// ─── Types ──────────────────────────────────────────────────

type Status = "ready" | "uploading" | "deleting";

interface ImageEntry {
    tempId: string;  // stable client key
    id?: number;     // set after server confirms
    url: string;
    isMain: boolean;
    status: Status;
}

type Action =
    | { type: "ADD"; entries: ImageEntry[] }
    | { type: "REMOVE"; tempId: string }
    | { type: "SET_MAIN"; tempId: string }
    | { type: "MARK_DELETING"; tempId: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function reduce(state: ImageEntry[], action: Action): ImageEntry[] {
    switch (action.type) {
        case "ADD":
            return [...state, ...action.entries];
        case "REMOVE":
            return state.filter((img) => img.tempId !== action.tempId);
        case "SET_MAIN":
            return state.map((img) => ({ ...img, isMain: img.tempId === action.tempId }));
        case "MARK_DELETING":
            return state.map((img) =>
                img.tempId === action.tempId ? { ...img, status: "deleting" as const } : img
            );
    }
}

function ensureMain(images: ImageEntry[]): ImageEntry[] {
    if (!images.length || images.some((img) => img.isMain)) return images;
    return images.map((img, i) => ({ ...img, isMain: i === 0 }));
}

// ─── Component ───────────────────────────────────────────────────────────────

const ThumbnailDropzone = ({
    value = [],
    onChange,
}: {
    value?: ProductImage[];
    onChange: (images: ProductImage[]) => void;
}) => {
    const [images, setImages] = useState<ImageEntry[]>(() =>
        value.map((img, i) => ({
            tempId: `init-${i}`,
            id: (img as any).id,
            url: (img as any).url ?? "",
            isMain: (img as any).isMain ?? i === 0,
            status: "ready" as const,
        }))
    );

    // Upload progress lives outside optimistic state — updates too frequently
    const [progressMap, setProgressMap] = useState<Record<string, number>>({});

    // Optimistic view: shows uncommitted ADD / REMOVE / SET_MAIN instantly
    const [optimistic, dispatch] = useOptimistic(images, reduce);
    const [, startTransition] = useTransition();

    // Keep parent in sync whenever committed state changes
    useEffect(() => {
        onChange(
            images
                .filter((img) => img.status === "ready")
                .map(({ id, url, isMain }) => ({ id, url, isMain } as ProductImage))
        );
    }, [images]);

    // ── Upload ────────────────────────────────────────────────────────────────

    const uploadImage = async (file: File, tempId: string): Promise<number> => {
        const formData = new FormData();
        formData.append("Image", file);

        const { data } = await axios.post(`${BASE_URL}/add-one`, formData, {
            onUploadProgress: (e) => {
                if (!e.total) return;
                setProgressMap((prev) => ({
                    ...prev,
                    [tempId]: Math.round((e.loaded * 100) / e.total!),
                }));
            },
        });

        return data.id as number;
    };

    const handleDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const slots = MAX_IMAGES - images.length;
            if (slots <= 0) return;

            const files = acceptedFiles.slice(0, slots);
            const entries: ImageEntry[] = files.map((file, i) => ({
                tempId: `upload-${Date.now()}-${i}`,
                url: URL.createObjectURL(file),
                isMain: images.length === 0 && i === 0,
                status: "uploading" as const,
            }));

            // Show images immediately, upload in background, then commit
            startTransition(async () => {
                dispatch({ type: "ADD", entries });

                const results = await Promise.allSettled(
                    entries.map((entry, i) => uploadImage(files[i], entry.tempId))
                );

                setImages((prev) => {
                    const next = [...prev];
                    entries.forEach((entry, i) => {
                        const result = results[i];
                        if (result.status === "fulfilled") {
                            next.push({ ...entry, id: result.value, status: "ready" });
                        }
                        // Failed uploads are silently dropped
                    });
                    return ensureMain(next);
                });

                setProgressMap((prev) => {
                    const next = { ...prev };
                    entries.forEach((e) => delete next[e.tempId]);
                    return next;
                });
            });
        },
        [images.length]
    );

    // ── Delete ────────────────────────────────────────────────────────────────

    const handleDelete = useCallback(
        async (tempId: string) => {
            const image = images.find((img) => img.tempId === tempId);
            if (!image || image.status !== "ready") return;

            // Remove from UI immediately, confirm with server, revert on failure
            startTransition(async () => {
                dispatch({ type: "REMOVE", tempId });

                try {
                    if (image.id) {
                        const res = await fetch(`${BASE_URL}/${image.id}`, { method: "DELETE" });
                        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
                    }
                    setImages((prev) => {
                        const next = prev.filter((img) => img.tempId !== tempId);
                        return image.isMain ? ensureMain(next) : next;
                    });
                } catch {
                    setImages((prev) => [...prev]); // triggers reconciliation → image reappears
                }
            });
        },
        [images]
    );

    // ── Set main ──────────────────────────────────────────────────────────────

    const handleSetMain = useCallback((tempId: string) => {
        startTransition(() => {
            dispatch({ type: "SET_MAIN", tempId });
        });
        setImages((prev) => prev.map((img) => ({ ...img, isMain: img.tempId === tempId })));
    }, []);

    // ── Dropzone config ───────────────────────────────────────────────────────

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/jpeg": [], "image/png": [] },
        multiple: true,
        disabled: optimistic.length >= MAX_IMAGES,
        onDrop: handleDrop,
    });

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div>
            <div
                {...getRootProps({
                    className:
                        "w-full text-gray-500 cursor-pointer border border-dashed border-gray-300 hover:border-gray-600 duration-200 rounded-md p-5",
                })}
            >
                <input {...getInputProps()} />
                <p>
                    {optimistic.length >= MAX_IMAGES
                        ? "Can't add more than 10 images"
                        : "Drag 'n' drop some files here, or click to select files"}
                </p>
                <em>(JPEG/PNG only)</em>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {optimistic.map((image) => {
                    const busy = image.status !== "ready";
                    const pct = image.status === "uploading"
                        ? (progressMap[image.tempId] ?? 0)
                        : 100;

                    return (
                        <div key={image.tempId} className="relative group">
                            <img
                                src={image.url}
                                alt=""
                                className={`h-20 w-20 rounded-md object-cover border ${busy ? "opacity-50" : ""}`}
                            />

                            {busy && (
                                <span className="absolute inset-0 flex items-center justify-center text-xs text-white bg-black/40 rounded-md">
                                    <Progress type="dashboard" percent={pct} size={20} />
                                </span>
                            )}

                            {!busy && (
                                <>
                                    <input
                                        type="radio"
                                        name="main-image"
                                        checked={image.isMain}
                                        onChange={() => handleSetMain(image.tempId)}
                                        className="absolute bottom-1 left-1 h-5 w-5 accent-blue-600 cursor-pointer"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(image.tempId)}
                                        className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 text-red-500 opacity-0 group-hover:opacity-100 duration-150"
                                        title="Remove"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ThumbnailDropzone;