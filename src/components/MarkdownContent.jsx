import React from "react";

/**
 * MarkdownContent 组件：渲染带标签和图片的 markdown 内容
 * @param {string} content - markdown 文本内容
 * @param {(tag: string) => void} onTagClick - 标签点击回调
 * @param {string} tagClassName - 标签额外样式类名
 */
export default function MarkdownContent({ content, onTagClick, tagClassName = "" }) {
  // 提取所有图片链接
  const imgRegex = /!\[[^\]]*\]\(([^\)]+)\)/g;
  const images = [];
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content))) {
    images.push(imgMatch[1]);
  }
  // 去除图片标记后的文本内容
  const textContent = content.replace(imgRegex, "");

  return (
    <>
      {/* 渲染文本和标签 */}
      {textContent.split(/(#[\w\u4e00-\u9fa5]+(?:\/[\w\u4e00-\u9fa5]+)*)/g).map((part, i) => {
        if (/^#[\w\u4e00-\u9fa5]+(?:\/[\w\u4e00-\u9fa5]+)*$/.test(part)) {
          return (
            <button
              key={i}
              className={`inline-block bg-blue-50 text-blue-700 rounded px-2 py-0.5 mr-2 mb-1 hover:bg-blue-100 transition-colors align-middle ${tagClassName}`}
              style={{ border: 'none', cursor: 'pointer', fontSize: '1em' }}
              onClick={() => {
                const subTags = part.slice(1).split("/");
                subTags.forEach((t) => onTagClick && onTagClick(t));
              }}
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
      {/* 渲染图片缩略图，横向排列 */}
      {images.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2 mt-2">
          {images.map((src, idx) => (
            <img
              key={src + idx}
              src={src}
              alt=""
              className="object-cover rounded shadow max-h-28 max-w-[120px] border border-gray-200"
              style={{ background: '#f8f8fa' }}
            />
          ))}
        </div>
      )}
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