"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash, Upload, X } from "lucide-react";
import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                        <div className="z-10 absolute top-2 right-2">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="image"
                            src={url}
                        />
                    </div>
                ))}
            </div>
            <div className="w-full">
                <UploadButton<OurFileRouter, "imageUploader">
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                            onChange(res[0].url);
                        }
                    }}
                    onUploadError={(error: Error) => {
                        console.error("Upload error:", error);
                    }}
                    disabled={disabled}
                    className="w-full"
                    content={{
                        button({ ready, isUploading, uploadProgress }) {
                            if (isUploading) {
                                return (
                                    <div className="flex items-center gap-2">
                                        <Upload className="h-4 w-4 animate-pulse" />
                                        <span>Subiendo... {uploadProgress}%</span>
                                    </div>
                                );
                            }
                            if (ready) {
                                return (
                                    <div className="flex items-center gap-2">
                                        <ImagePlus className="h-4 w-4" />
                                        <span>Haz clic para seleccionar imagen</span>
                                    </div>
                                );
                            }
                            return "Cargando...";
                        },
                        allowedContent({ ready, fileTypes, isUploading }) {
                            if (!ready) return "Verificando...";
                            if (isUploading) return "Subiendo archivo...";
                            return `Imagen (máx. 4MB)`;
                        },
                    }}
                />
            </div>
        </div>
    )
};

export default ImageUpload;