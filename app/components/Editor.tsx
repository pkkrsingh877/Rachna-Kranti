"use client";

import { MDXEditor, MDXEditorMethods, headingsPlugin } from "@mdxeditor/editor";
import { FC } from "react";
import React from "react";
import { useRef } from "react";

interface EditorProps {
  markdown: string;
  editorRef: React.RefObject<MDXEditorMethods>;
}

/**
 * Extend this Component further with the necessary plugins or props you need.
 * proxying the ref is necessary. Next.js dynamically imported components don't support refs.
 */
const Editor: FC<EditorProps> = ({ markdown, editorRef }) => {
  return (
    <MDXEditor
      onChange={(e) => console.log(e)}
      ref={editorRef}
      markdown={markdown}
      plugins={[headingsPlugin()]}
    />
  );
};

export default Editor;