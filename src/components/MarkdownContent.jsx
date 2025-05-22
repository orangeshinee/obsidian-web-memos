import React from "react";

/**
 * MarkdownContent 组件：渲染带标签和图片的 markdown 内容
 * @param {string} content - markdown 文本内容
 * @param {(tag: string) => void} onTagClick - 标签点击回调
 */
export default function MarkdownContent({ content, onTagClick }) {
  return (
    <>
      {content.split(/(#[\w\u4e00-\u9fa5]+(?:\/[\w\u4e00-\u9fa5]+)*|!\[[^\]]*\]\([^\)]+\))/g).map((part, i) => {
        if (/^#[\w\u4e00-\u9fa5]+(?:\/[\w\u4e00-\u9fa5]+)*$/.test(part)) {
          return (
            <button
              key={i}
              className="text-blue-600 underline hover:text-blue-800"
              onClick={() => {
                const subTags = part.slice(1).split("/");
                subTags.forEach((t) => onTagClick && onTagClick(t));
              }}
            >
              {part}
            </button>
          );
        }
        const imgMatch = part.match(/^!\[[^\]]*\]\(([^\)]+)\)/);
        if (imgMatch) {
          return <img key={i} src={imgMatch[1]} alt="" className="my-2 max-w-full" />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// 提取所有标签，包括多级标签拆分
export function extractTags(content) {
  const rawTags = [...content.matchAll(/#([\w\u4e00-\u9fa5]+(?:\/[\w\u4e00-\u9fa5]+)*)/g)].map((m) => m[1]);
  const allParts = new Set();
  rawTags.forEach((tag) => {
    const parts = tag.slice(1).split("/");
    parts.forEach((t) => allParts.add(t));
  });
  return Array.from(allParts);
}

// 解析 yyyy-MM-dd.md 文件格式中的 - HH:mm 开头分段
export function parseMdNotes(filename, rawContent, lastModified) {
  const lines = rawContent.split("\n");
  const result = [];
  let currentNote = null;

  lines.forEach((line) => {
    const timeMatch = line.match(/^\s*-\s*(\d{2}):(\d{2})/);
    if (timeMatch) {
      if (currentNote) result.push(currentNote);

      const [_, hour, minute] = timeMatch;
      const datePart = filename.replace(/\.md$/, "");
      const fullDate = new Date(`${datePart}T${hour}:${minute}`);

      currentNote = {
        filename,
        content: '',
        createdAt: fullDate,
      };
    } else if (currentNote) {
      currentNote.content += line + "\n";
    }
  });

  if (currentNote) result.push(currentNote);
  return result;
} 