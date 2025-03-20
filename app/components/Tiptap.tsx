'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { forwardRef, useImperativeHandle, useState } from 'react';

interface TiptapProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
}

const Tiptap = forwardRef<any, TiptapProps>(({ value, onChange, onBlur, name }, ref) => {
  const [content, setContent] = useState(value)
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      onChange(html);
    },
    onBlur: () => {
        onBlur()
    }
  })

  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
  }));

  return <EditorContent editor={editor} />
});

Tiptap.displayName = 'Tiptap';
export default Tiptap;
