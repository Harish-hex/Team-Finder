'use client'

type DividerProps = {
    text?: string
}

export function Divider({ text }: DividerProps) {
    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/10" />
            </div>
            {text && (
                <div className="relative flex justify-center">
                    <span className="bg-[#0d1320] px-2 text-sm text-blue-100/50">{text}</span>
                </div>
            )}
        </div>
    )
}
