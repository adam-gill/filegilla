"use client";

import "@/styles/_keyframe-animations.scss";
import "@/styles/_variables.scss";

import * as React from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import Mention from "@tiptap/extension-mention";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import userData from "./data/users.json";

// --- Custom Extensions ---
import { Link } from "@/components/tiptap/tiptap-extension/link-extension";
import { Selection } from "@/components/tiptap/tiptap-extension/selection-extension";
import { TrailingNode } from "@/components/tiptap/tiptap-extension/trailing-node-extension";
import { FontSizeExtension } from "@/components/tiptap/tiptap-extension/font-size-extension";
import { CustomUnderline } from "@/components/tiptap/tiptap-extension/underline-extension";

// --- UI Primitives ---
import { Button } from "@/components/tiptap/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap/tiptap-node/image-upload-node/image-upload-node-extension";
import "@/components/tiptap/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap/tiptap-icons/link-icon";

// --- Hooks ---
import { useMobile } from "@/hooks/use-mobile";

// --- Components ---
import { ThemeToggle } from "@/components/tiptap/simple/theme-toggle";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap/simple/simple-editor.scss";
import { FontSizeInput } from "@/components/tiptap/tiptap-ui/font-size-input";

import { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import { Instance } from "tippy.js";
import { mergeAttributes } from "@tiptap/react";

// Add type for User after imports
type User = { id: number; name: string; email: string };

const users = userData.users;

const mentionSuggestion = {
  items: ({ query }: { query: string }) => {
    return users
      .filter((user: User) =>
        user.name.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, 5);
  },
  render: () => {
    let component: HTMLDivElement;
    let popup: Instance;
    let selectedIndex: number = 0;
    let currentItems: User[] = [];
    let currentCommand: (attrs: {
      id: number;
      label: string;
    }) => void = () => {};

    return {
      onStart: (props: SuggestionProps<User>) => {
        component = document.createElement("div");
        component.classList.add("mention-suggestions");

        if (!props.clientRect) {
          return;
        }

        popup = tippy(document.body, {
          getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(),
          appendTo: () => document.body,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        }) as Instance;

        currentItems = props.items;
        currentCommand = props.command as any; // Adjust for type
        selectedIndex = 0;
        renderItems();
      },

      onUpdate: (props: SuggestionProps<User>) => {
        currentItems = props.items;
        currentCommand = props.command as any;
        selectedIndex = 0;
        renderItems();
      },

      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === "Escape") {
          popup.hide();
          return true;
        }

        if (props.event.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1) % currentItems.length;
          renderItems();
          return true;
        }

        if (props.event.key === "ArrowUp") {
          selectedIndex =
            (selectedIndex + currentItems.length - 1) % currentItems.length;
          renderItems();
          return true;
        }

        if (props.event.key === "Enter" || props.event.key === "Tab") {
          const item = currentItems[selectedIndex];
          if (item) {
            currentCommand({ id: item.id, label: item.name });
          }
          return true;
        }

        return false;
      },

      onExit: () => {
        popup.destroy();
        component.remove();
      },
    };

    function renderItems() {
      component.innerHTML = "";

      if (currentItems.length === 0) {
        component.innerHTML = "<div>No results</div>";
        return;
      }

      const list = document.createElement("ul");

      currentItems.forEach((item: User, index: number) => {
        const listItem = document.createElement("li");
        listItem.textContent = item.name;
        listItem.addEventListener("click", () => {
          currentCommand({ id: item.id, label: item.name });
        });
        if (index === selectedIndex) {
          listItem.classList.add("selected");
        }
        list.appendChild(listItem);
      });

      component.appendChild(list);
    }
  },
};

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <FontSizeInput />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor({
  content,
  setContent,
  canEdit,
}: {
  content: string;
  setContent: (content: string) => void;
  canEdit: boolean;
}) {
  const isMobile = useMobile();
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CustomUnderline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image.configure({
        allowBase64: true,
      }),
      Typography,
      Superscript,
      Subscript,
      FontSizeExtension,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: mentionSuggestion,
        renderHTML: ({ options, node }) => {
          return [
            "span",
            mergeAttributes(options.HTMLAttributes, {
              "data-id": node.attrs.id,
            }),
            `@${node.attrs.label ?? node.attrs.id}`,
          ];
        },
      }),

      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
    ],
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    content: content,
    editable: canEdit,
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  return (
    <EditorContext.Provider value={{ editor }}>
      {canEdit && (
        <Toolbar
          key={`toolbar-${editor?.isEditable}`}
          ref={toolbarRef}
          style={
            isMobile
              ? {
                  bottom: `0px`,
                }
              : {}
          }
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>
      )}

      <div className="content-wrapper">
        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </div>
    </EditorContext.Provider>
  );
}
