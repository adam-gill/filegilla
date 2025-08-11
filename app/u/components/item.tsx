"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Folder, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File,
  Trash2,
  Edit,
  Copy,
  Share,
  Info
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@radix-ui/react-context-menu";

// Type for folder contents
interface FolderItem {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
  path: string;
  etag?: string;
}

interface ItemProps {
  item: FolderItem;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.toLowerCase().split('.').pop();
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(extension || '')) {
    return <Image className="w-5 h-5 text-blue-400" />;
  }
  
  // Video files
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension || '')) {
    return <Video className="w-5 h-5 text-purple-400" />;
  }
  
  // Audio files
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(extension || '')) {
    return <Music className="w-5 h-5 text-green-400" />;
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension || '')) {
    return <Archive className="w-5 h-5 text-orange-400" />;
  }
  
  // Document files
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension || '')) {
    return <FileText className="w-5 h-5 text-red-400" />;
  }
  
  // Default file icon
  return <File className="w-5 h-5 text-gray-400" />;
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date?: Date): string => {
  if (!date) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function Item({ item }: ItemProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className="group relative w-full max-w-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-400 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Top Banner */}
            <div className="flex items-center justify-between p-3 border-b border-gray-600">
              {/* Icon and Name */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {item.type === 'folder' ? (
                    <Folder className="w-5 h-5 text-blue-400" />
                  ) : (
                    getFileIcon(item.name)
                  )}
                </div>
                
                {/* Name with truncation */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 truncate">
                    {item.name}
                  </p>
                </div>
              </div>

              {/* Options Button - Always visible */}
              <div className="flex-shrink-0 ml-2 relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-600 text-gray-300 hover:text-white"
                  onClick={handleOptionsClick}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {/* Dropdown Menu */}
                {isOptionsOpen && (
                  <div className="absolute right-0 top-full mt-1 min-w-[200px] bg-gray-800 rounded-md shadow-lg border border-gray-600 p-1 z-50">
                    <button className="flex items-center w-full px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-sm text-gray-100">
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </button>
                    
                    <button className="flex items-center w-full px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-sm text-gray-100">
                      <Copy className="mr-2 h-4 w-4" />
                      Make a copy
                    </button>
                    
                    <button className="flex items-center w-full px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-sm text-gray-100">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </button>
                    
                    <button className="flex items-center w-full px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-sm text-gray-100">
                      <Info className="mr-2 h-4 w-4" />
                      More information
                    </button>
                    
                    <div className="h-px bg-gray-600 my-1" />
                    
                    <button className="flex items-center w-full px-3 py-2 text-sm cursor-pointer hover:bg-red-900 text-red-400 rounded-sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3">
              {/* File Info */}
              <div className="space-y-1">
                {item.type === 'file' && item.size && (
                  <p className="text-xs text-gray-400">{formatFileSize(item.size)}</p>
                )}
                {item.lastModified && (
                  <p className="text-xs text-gray-400">{formatDate(item.lastModified)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>

      {/* Right-click Context Menu */}
      <ContextMenuContent className="min-w-[200px] bg-gray-800 rounded-md shadow-lg border border-gray-600 p-1">
        <ContextMenuItem className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-sm text-gray-100">
          <Edit className="mr-2 h-4 w-4" />
          Rename
        </ContextMenuItem>
        
        <ContextMenuItem className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-sm text-gray-100">
          <Copy className="mr-2 h-4 w-4" />
          Make a copy
        </ContextMenuItem>
        
        <ContextMenuItem className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-sm text-gray-100">
          <Share className="mr-2 h-4 w-4" />
          Share
        </ContextMenuItem>
        
        <ContextMenuItem className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-sm text-gray-100">
          <Info className="mr-2 h-4 w-4" />
          More information
        </ContextMenuItem>
        
        <ContextMenuSeparator className="h-px bg-gray-600 my-1" />
        
        <ContextMenuItem className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-red-900 text-red-400 rounded-sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}