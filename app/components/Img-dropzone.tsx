import { UploadCloudIcon, X } from "lucide-react";
import * as React from "react";
import { twMerge } from "tailwind-merge";

type InputProps = {
  width?: number;
  height?: number;
  className?: string;
  value?: File | string;
  onChange?: (file?: File) => void | Promise<void>;
  disabled?: boolean;
};

const variants = {
  base: "relative rounded-md flex justify-center items-center flex-col cursor-pointer min-h-[150px] min-w-[200px] border border-dashed border-gray-400 dark:border-gray-300 transition-colors duration-200 ease-in-out",
  image: "border-0 p-0 min-h-0 min-w-0 relative shadow-md bg-slate-200 dark:bg-slate-900 rounded-md",
  disabled: "bg-gray-200 border-gray-300 cursor-default pointer-events-none bg-opacity-30 dark:bg-gray-700"
};

export default function SingleImageDropzone ({ width, height, className, value, onChange, disabled }: InputProps) {
    const [dragActive, setDragActive] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const imageUrl = React.useMemo(() => {
      if (typeof value === "string") {
        return value;
      } else if (value) {
        return URL.createObjectURL(value);
      }
      return null;
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        onChange?.(e.target.files[0]);
      }
    };

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        
        if (e.dataTransfer.files?.[0]) {
          onChange?.(e.dataTransfer.files[0]);
        }
      },
      [onChange]
    );

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    }, []);

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
    }, []);

    return (
      <div className="relative">
        <button
          className={twMerge(
            variants.base,
            dragActive && "border-blue-500",
            imageUrl && variants.image,
            disabled && variants.disabled,
            className
          )}
          style={{ width, height }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            disabled={disabled}
          />

          {imageUrl ? (
            <img
              className="h-full w-full rounded-md object-cover"
              src={imageUrl}
              alt="Upload preview"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-xs text-gray-400">
              <UploadCloudIcon className="mb-2 h-7 w-7" />
              <div className="text-gray-400">
                Drag & drop to upload cover image
              </div>
            </div>
          )}
        </button>

        {imageUrl && !disabled && (
          <button
            className="group absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(undefined);
            }}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-solid border-gray-500 bg-white transition-all duration-300 hover:h-6 hover:w-6 dark:border-gray-400 dark:bg-black">
              <X className="text-gray-500 dark:text-gray-400" width={16} height={16} />
            </div>
          </button>
        )}
      </div>
    );
  }