import { useEffect, useRef } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon,
  Undo2, Redo2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

type Command = "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList" | "undo" | "redo";

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={event => event.preventDefault()}
      onClick={onClick}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-gray-600 hover:bg-rose-50 hover:text-rose-700"
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here…",
  minHeight = "180px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command: Command, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const addLink = () => {
    const url = window.prompt("Enter the link URL");
    if (url) runCommand("createLink" as Command, url);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-rose-500">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 p-1.5">
        <ToolbarButton label="Bold" onClick={() => runCommand("bold")}><Bold size={15} /></ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => runCommand("italic")}><Italic size={15} /></ToolbarButton>
        <ToolbarButton label="Underline" onClick={() => runCommand("underline")}><Underline size={15} /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <select
          aria-label="Text style"
          defaultValue="p"
          onChange={event => runCommand("formatBlock" as Command, event.target.value)}
          className="h-8 rounded-md border-0 bg-transparent px-2 text-xs font-medium text-gray-600 outline-none hover:bg-rose-50"
        >
          <option value="p">Paragraph</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
        </select>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton label="Bulleted list" onClick={() => runCommand("insertUnorderedList")}><List size={15} /></ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => runCommand("insertOrderedList")}><ListOrdered size={15} /></ToolbarButton>
        <ToolbarButton label="Add link" onClick={addLink}><LinkIcon size={15} /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton label="Undo" onClick={() => runCommand("undo")}><Undo2 size={15} /></ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => runCommand("redo")}><Redo2 size={15} /></ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={event => onChange(event.currentTarget.innerHTML)}
        className="prose prose-sm max-w-none px-4 py-3 text-gray-700 outline-none empty:before:pointer-events-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]"
        style={{ minHeight }}
        suppressContentEditableWarning
      />
    </div>
  );
}