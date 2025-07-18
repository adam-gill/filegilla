import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Set the font size
             */
            setFontSize: (size: string) => ReturnType;
            /**
             * Unset the font size
             */
            unsetFontSize: () => ReturnType;
        };
    }
}

export const FontSizeExtension = Mark.create({
    name: 'fontSize',

    addOptions() {
        return {
            HTMLAttributes: {},
        }
    },

    addAttributes() {
        return {
            size: {
                default: "16",
                parseHTML: (element) => {
                    const fontSize = element.style.fontSize;
                    return fontSize ? fontSize.replace('px', '') : "16";
                },
                renderHTML: (attributes) => {
                    if (!attributes.size) {
                        return {
                            style: `font-size: 16px`
                        };
                    }
                    return {
                        style: `font-size: ${attributes.size}px`
                    };
                }
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span[style*="font-size"]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
    },

    addCommands() {
        return {
            setFontSize:
                (size) =>
                ({ commands }) => {
                    return commands.setMark(this.name, { size: size });
                },
            unsetFontSize:
                () =>
                ({ commands }) => {
                    return commands.unsetMark(this.name);
                }
        };
    }
}); 