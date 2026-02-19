import { Package } from 'lucide-react';
import { cn } from "./utils";

interface ImageRendererProps {
    url?: string | null;
    alt?: string;
    className?: string;
}

const ImageRenderer = ({ url, alt = "Imagen", className }: ImageRendererProps) => {
    return (
        <div className={cn(
            "h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center border",
            className
        )}>
            {url ? (
                <img
                    src={url.startsWith('/') ? url : `/${url}`}
                    alt={alt}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = ''; // Clear src on error to show placeholder
                    }}
                />
            ) : (
                <Package className="text-gray-400" size={24} />
            )}
        </div>
    );
};

export default ImageRenderer;
