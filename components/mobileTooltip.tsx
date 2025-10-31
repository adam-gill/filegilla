"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMobile } from "@/hooks/use-mobile"
import { useState } from "react";

interface MobileTooltipProps {
    trigger: React.ReactNode;
    content: React.ReactNode;
    maxContentWidth?: number; // default 200px
}

export default function MobileTooltip({ trigger, content, maxContentWidth }: MobileTooltipProps) {
    const isMobile = useMobile();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isMobile ? (
                <div className="relative">
                    <div onClick={() => setIsOpen(!isOpen)}>
                        {trigger}
                    </div>
                    {isOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setIsOpen(false)}
                            />
                            <div className={`${maxContentWidth ? `w-[${maxContentWidth}px]` : "w-[200px]"} absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-black bg-white rounded-md shadow-2xl shadow-neutral-900/40 max-w-[200px] animate-in fade-in-0 zoom-in-95`}>
                                {content}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <Tooltip>
                    <TooltipTrigger>
                        {trigger}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-[200px]">{content}</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </>
    )
}