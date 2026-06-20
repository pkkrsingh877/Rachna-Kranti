"use client";

import React from 'react';

function renderNode(node: Record<string, unknown>, key: number): React.ReactNode {
  if (node.type === 'text') {
    const marks = node.marks as Array<Record<string, unknown>> | undefined;
    let text = String(node.text || '');
    if (marks) {
      for (const mark of marks) {
        switch (mark.type) {
          case 'bold':
            text = <strong key={key}>{text}</strong> as unknown as string;
            break;
          case 'italic':
            text = <em key={key}>{text}</em> as unknown as string;
            break;
          case 'strike':
            text = <s key={key}>{text}</s> as unknown as string;
            break;
          case 'code':
            text = <code key={key} className="bg-muted px-1 rounded text-sm">{text}</code> as unknown as string;
            break;
          case 'link': {
            const href = String((mark.attrs as Record<string, unknown>)?.href || '#');
            text = <a key={key} href={href} className="text-primary underline">{text}</a> as unknown as string;
            break;
          }
          case 'highlight': {
            const color = String((mark.attrs as Record<string, unknown>)?.color || 'var(--tt-highlight-yellow)');
            text = <mark key={key} style={{ backgroundColor: color }}>{text}</mark> as unknown as string;
            break;
          }
          case 'subscript':
            text = <sub key={key}>{text}</sub> as unknown as string;
            break;
          case 'superscript':
            text = <sup key={key}>{text}</sup> as unknown as string;
            break;
        }
      }
    }
    return <React.Fragment key={key}>{text}</React.Fragment>;
  }

  const children = renderContent(node.content);
  const keyAttr = { key };

  switch (node.type) {
    case 'paragraph':
      return <p key={key} className="mb-4 leading-relaxed">{children}</p>;
    case 'heading': {
      const level = String((node.attrs as Record<string, unknown>)?.level || '2');
      return React.createElement(`h${level}`, { ...keyAttr, className: 'font-semibold mt-6 mb-3' }, children);
    }
    case 'codeBlock':
      return (
        <pre key={key} className="bg-muted rounded-lg p-4 mb-4 overflow-x-auto text-sm">
          <code>{children || String(node.text || '')}</code>
        </pre>
      );
    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">
          {children}
        </blockquote>
      );
    case 'bulletList':
      return <ul key={key} className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
    case 'orderedList':
      return <ol key={key} className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
    case 'listItem':
      return <li key={key}>{children}</li>;
    case 'taskList':
      return <ul key={key} className="mb-4 space-y-1">{children}</ul>;
    case 'taskItem': {
      const checked = Boolean((node.attrs as Record<string, unknown>)?.checked);
      return (
        <li key={key} className="flex items-start gap-2">
          <input type="checkbox" checked={checked} readOnly className="mt-1" />
          <span>{children}</span>
        </li>
      );
    }
    case 'horizontalRule':
      return <hr key={key} className="my-6" />;
    case 'image': {
      const src = String((node.attrs as Record<string, unknown>)?.src || '');
      const alt = String((node.attrs as Record<string, unknown>)?.alt || '');
      return <img key={key} src={src} alt={alt} className="max-w-full rounded-lg my-4" />;
    }
    default:
      return children || null;
  }
}

function renderContent(content: unknown): React.ReactNode {
  if (!content) return null;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((node, i) => renderNode(node as Record<string, unknown>, i));
  }
  return null;
}

export default function RenderTiptap({ doc }: { doc: Record<string, unknown> }) {
  if (doc.type === 'doc') {
    return <>{renderContent(doc.content)}</>;
  }
  return <>{renderContent(doc)}</>;
}

export { renderContent, renderNode };
