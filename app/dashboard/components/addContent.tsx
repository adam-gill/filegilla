"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, Upload, FolderPlus, FileText, Image, Video, Music } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/tiptap/tiptap-ui-primitive/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createFolder } from "../actions";

export default function AddContent() {
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Folder name validation function
    const validateFolderName = (name: string): string => {
        if (!name.trim()) {
            return "";
        }

        // Check for invalid characters
        const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
        if (invalidChars.test(name)) {
            return "Folder name cannot contain: < > : \" / \\ | ? * or control characters";
        }

        // Check for leading/trailing spaces and dots
        if (name.startsWith(" ") || name.endsWith(" ") || name.startsWith(".") || name.endsWith(".")) {
            return "Folder name cannot start or end with spaces or dots";
        }

        if (name.length > 255) {
            return "Folder name cannot exceed 255 characters";
        }

        if (name.includes("..")) {
            return "Folder name cannot contain consecutive dots";
        }

        return "";
    };

    const handleFileUpload = async () => {
        // Handle file upload logic
        console.log("File upload clicked");
    };

    const handleFolderUpload = () => {
        // Handle folder upload logic
        console.log("Folder upload clicked");
    };

    const handleNewFolder = () => {
        // This will be handled by the dialog trigger
        console.log("New folder clicked");
    };

    const handleNewDocument = () => {
        // Handle new document creation logic
        console.log("New document clicked");
    };

    const handleCreateFolder = async () => {
        if (!folderName.trim()) return;
        
        // Validate folder name before creating
        const error = validateFolderName(folderName);
        if (error) {
            setValidationError(error);
            return;
        }
        
        setIsCreating(true);
        try {
            const result = await createFolder(folderName.trim());
            if (result.success) {
                console.log("Folder created:", result.message);
                setFolderName("");
                setValidationError("");
                setIsFolderDialogOpen(false);
            } else {
                console.error("Failed to create folder:", result.message);
                setValidationError(result.message);
            }
        } catch (error) {
            console.error("Error creating folder:", error);
            setValidationError("An unexpected error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isCreating) {
            handleCreateFolder();
        } else if (e.key === "Escape") {
            setIsFolderDialogOpen(false);
            setFolderName("");
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant={"pretty"}
                        className="w-full max-w-[150px] h-12 px-4 py-4 text-3xl text-black border-none relative hover:brightness-[115%] rounded-2xl transition-all duration-300 outline-none focus-visible:ring-0"
                    >
                        <Plus className="w-8 h-8 mr-2" strokeWidth={2} />
                        Add
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl shadow-white p-1">
                    <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded cursor-pointer outline-none"
                        onSelect={handleFileUpload}
                    >
                        <Upload className="w-4 h-4" />
                        Upload files
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded cursor-pointer outline-none"
                        onSelect={handleFolderUpload}
                    >
                        <Folder className="w-4 h-4" />
                        Upload folder
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded cursor-pointer outline-none"
                        onSelect={() => {
                            setIsFolderDialogOpen(true);
                        }}
                    >
                        <FolderPlus className="w-4 h-4" />
                        New folder
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded cursor-pointer outline-none"
                        onSelect={handleNewDocument}
                    >
                        <FileText className="w-4 h-4" />
                        New document
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-black text-2xl">
                            Create New Folder
                        </AlertDialogTitle>
                        <AlertDialogDescription className="!text-gray-600 text-base">
                            Enter a name for your new folder
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            type="text"
                            placeholder="Folder name"
                            value={folderName}
                            onChange={(e) => {
                                const newName = e.target.value;
                                setFolderName(newName);
                                setValidationError(validateFolderName(newName));
                            }}
                            onKeyDown={handleKeyPress}
                            className={`text-base border-gray-600 text-black placeholder:text-gray-400 focus:border-gray-500 focus:ring-gray-500 ${
                                validationError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                            }`}
                            autoFocus
                            disabled={isCreating}
                        />
                        {validationError && (
                            <p className="text-red-500 text-sm mt-2">{validationError}</p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans"
                            disabled={isCreating}
                            onClick={() => {
                                setFolderName("");
                                setValidationError("");
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCreateFolder}
                            disabled={!folderName.trim() || isCreating || !!validationError}
                            className="text-base !bg-black cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
                        >
                            {isCreating ? "Creating..." : "Create"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}