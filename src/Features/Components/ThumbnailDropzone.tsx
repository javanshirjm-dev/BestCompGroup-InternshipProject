import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { Progress } from "antd";
import axios from "axios";

import type { ProductImage } from "../../Types/Global";

const BASE_URL = "https://shoppingwepapi-ercpgggcdxffbbat.polandcentral-01.azurewebsites.net/api/ProductImages";
const MAX_IMAGES = 10;

interface ImageEntry {
    tempId: number;
    id?: number;
    url: string;
    isMain: boolean;
    percent: number; // 100 = ready, < 100 = uploading
}

function ensureMain(images: ImageEntry[]): ImageEntry[] {
    if (!images.length || images.some((img) => img.isMain)) return images;
    return images.map((img, i) => ({ ...img, isMain: i === 0 }));
}

function toEntries(value: ProductImage[] = []): ImageEntry[] {
    return value.map((img, i) => ({
        tempId: -(i + 1),
        id: img.id,
        url: img.url ?? "",
        isMain: img.isMain ?? i === 0,
        percent: 100,
    }));
}

const ThumbnailDropzone = ({
    value = [],
    onChange,
}: {
    value?: ProductImage[];
    onChange: (images: ProductImage[]) => void;
}) => {
    const [readyImages, setReadyImages] = useState<ImageEntry[]>(() => toEntries(value));
    const [pendingImages, setPendingImages] = useState<ImageEntry[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    const displayImages = [...readyImages, ...pendingImages];

    // Keep parent form in sync whenever the ready list changes
    useEffect(() => {
        onChange(readyImages.map(({ id, url, isMain }) => ({ id, url, isMain } as ProductImage)));
    }, [readyImages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/jpeg": [], "image/png": [] },
        multiple: true,
        disabled: displayImages.length >= MAX_IMAGES,
        onDrop: async (acceptedFiles, fileRejections) => {
            if (fileRejections.length > 0) {
                setErrorMessage(fileRejections[0].errors.map((err) => err.message).join("\n"));
                return;
            }
            setErrorMessage("");

            const slots = MAX_IMAGES - displayImages.length;
            const files = acceptedFiles.slice(0, slots);
            if (files.length === 0) return;

            const placeholders: ImageEntry[] = files.map((file, i) => ({
                tempId: Date.now() + Math.random(),
                url: URL.createObjectURL(file),
                isMain: displayImages.length === 0 && i === 0,
                percent: 0,
            }));
            setPendingImages((prev) => [...prev, ...placeholders]);

            const results = await Promise.allSettled(
                files.map(async (file, i) => {
                    const formData = new FormData();
                    formData.append("Image", file);

                    const { data } = await axios.post(`${BASE_URL}/add-one`, formData, {
                        onUploadProgress: (e) => {
                            if (!e.total) return;
                            const percent = Math.round((e.loaded * 100) / e.total);
                            setPendingImages((prev) =>
                                prev.map((img) =>
                                    img.tempId === placeholders[i].tempId ? { ...img, percent } : img
                                )
                            );
                        },
                    });

                    return data.id as number;
                })
            );

            const succeeded: ImageEntry[] = [];
            placeholders.forEach((placeholder, i) => {
                const result = results[i];
                if (result.status === "fulfilled") {
                    succeeded.push({ ...placeholder, id: result.value, percent: 100 });
                }
            });

            setPendingImages((prev) => prev.filter((img) => !placeholders.some((p) => p.tempId === img.tempId)));
            setReadyImages((prev) => ensureMain([...prev, ...succeeded]));
        },
    });

    const handleDelete = async (image: ImageEntry) => {
        if (image.id) {
            try {
                await axios.delete(`${BASE_URL}/${image.id}`);
            } catch {
                setErrorMessage("Failed to delete image, please try again.");
                return;
            }
        }
        setReadyImages((prev) => ensureMain(prev.filter((img) => img.tempId !== image.tempId)));
    };

    const handleSetMain = (tempId: number) => {
        setReadyImages((prev) => prev.map((img) => ({ ...img, isMain: img.tempId === tempId })));
    };

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
                    {displayImages.length >= MAX_IMAGES
                        ? `Can't add more than ${MAX_IMAGES} images`
                        : isDragActive
                            ? "Drop the images here"
                            : "Drag 'n' drop some files here, or click to select files"}
                </p>
                <em>(JPEG/PNG only)</em>
            </div>

            {errorMessage && <p className="text-xs text-red-500 mt-1">{errorMessage}</p>}

            <div className="mt-3 flex flex-wrap gap-2">
                {displayImages.map((image) => {
                    const uploading = image.percent < 100;

                    return (
                        <div key={image.tempId} className="relative group">
                            <img
                                src={image.url}
                                alt=""
                                className={`h-20 w-20 rounded-md object-cover border ${uploading ? "opacity-50" : ""}`}
                            />

                            {uploading && (
                                <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                                    <Progress type="dashboard" percent={image.percent} size={20} />
                                </span>
                            )}

                            {!uploading && (
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
                                        onClick={() => handleDelete(image)}
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