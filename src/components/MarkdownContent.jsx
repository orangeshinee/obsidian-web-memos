import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * MarkdownContent 组件：渲染带标签和图片的 markdown 内容
 * @param {string} content - markdown 文本内容
 * @param {(tag: string) => void} onTagClick - 标签点击回调
 * @param {string} tagClassName - 标签额外样式类名
 */
export default function MarkdownContent({ content, onTagClick, tagClassName = "" }) {
  const [previewImg, setPreviewImg] = useState(null);
  const [previewIdx, setPreviewIdx] = useState(-1);
  
  // 提取所有图片链接，以便稍后单独渲染
  const imgRegex = /!\[[^\]]*\]\(([^\)]+)\)/g;
  const images = [];
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content))) {
    images.push(imgMatch[1]);
  }
  
  // 处理标签点击，将多级标签拆分处理
  const handleTagClick = (tag) => {
    if (!tag || !onTagClick) return;
    const tagText = tag.replace(/^#/, '');
    const subTags = tagText.split("/");
    subTags.forEach(t => onTagClick(t));
  };

  // 自定义组件，用于处理各种 Markdown 元素的渲染
  const components = {
    // 处理段落，识别并处理标签
    p: ({ node, children, ...props }) => {
      // 过滤掉只包含空白的段落
      const text = React.Children.toArray(children).join("").trim();
      if (!text) return null;
      // 标签处理
      const processChildren = (items) => {
        if (!items) return [];
        return React.Children.map(items, child => {
          if (typeof child !== 'string') return child;
          const parts = child.split(/(#[\w\u4e00-\u9fa5]+(?:\/[\w\u4e00-\u9fa5]+)*)/);
          if (parts.length === 1) return child;
          return parts.map((part, i) => {
            if (/^#[\w\u4e00-\u9fa5]+(?:\/[\w\u4e00-\u9fa5]+)*$/.test(part)) {
              return (
                <button
                  key={i}
                  className={`inline-block bg-blue-50 text-blue-700 rounded px-2 py-0.5 mr-2 mb-1 hover:bg-blue-100 transition-colors align-middle ${tagClassName}`}
                  style={{ border: 'none', cursor: 'pointer', fontSize: '1em' }}
                  onClick={() => handleTagClick(part)}
                >
                  {part}
                </button>
              );
            }
            return part;
          });
        });
      };
      return <p {...props}>{processChildren(children)}</p>;
    },
    
    // 代码块语法高亮
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-sm font-mono`} {...props}>
          {children}
        </code>
      );
    },
    
    // 自定义标题样式
    h1: (props) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
    h2: (props) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
    h3: (props) => <h3 className="text-lg font-bold mt-3 mb-1" {...props} />,
    
    // 自定义列表样式
    ul: (props) => <ul className="list-disc ml-5 my-2" {...props} />,
    ol: (props) => <ol className="list-decimal ml-5 my-2" {...props} />,
    
    // 自定义表格样式
    table: (props) => <table className="border-collapse border border-gray-300 my-2 w-full" {...props} />,
    thead: (props) => <thead className="bg-gray-100" {...props} />,
    th: (props) => <th className="border border-gray-300 px-4 py-2 text-left" {...props} />,
    td: (props) => <td className="border border-gray-300 px-4 py-2" {...props} />,
    
    // 任务列表项样式
    li: ({ node, checked, children, ...props }) => {
      if (checked !== null && checked !== undefined) {
        return (
          <li {...props} className="flex items-start my-1">
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mt-1 mr-2"
            />
            <span>{children}</span>
          </li>
        );
      }
      return <li {...props}>{children}</li>;
    },
    
    // 不在正文中渲染图片，直接返回 null
    img: () => null,
  };

  return (
    <>
      {/* 使用 ReactMarkdown 渲染内容 */}
      <div className="markdown-body">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
      
      {/* 仍然保留图片缩略图功能，在内容下方显示 */}
      {images.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2 mt-2">
          {images.map((src, idx) => (
            <img
              key={src + idx}
              src={src}
              alt=""
              className="object-cover rounded shadow max-h-28 max-w-[120px] border border-gray-200 cursor-pointer"
              style={{ background: '#f8f8fa' }}
              onClick={() => { setPreviewImg(src); setPreviewIdx(idx); }}
            />
          ))}
        </div>
      )}
      
      {/* 图片预览弹窗，支持多图切换 */}
      {previewImg && previewIdx >= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => { setPreviewImg(null); setPreviewIdx(-1); }}>
          {/* 左右切换按钮 */}
          {images.length > 1 && previewIdx > 0 && (
            <button className="absolute left-8 text-white text-4xl font-bold px-2 py-1 bg-black/30 rounded-full hover:bg-black/60" onClick={e => { e.stopPropagation(); setPreviewImg(images[previewIdx-1]); setPreviewIdx(previewIdx-1); }}>&lt;</button>
          )}
          <img src={previewImg} alt="预览" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl border-4 border-white" onClick={e => e.stopPropagation()} />
          {images.length > 1 && previewIdx < images.length-1 && (
            <button className="absolute right-8 text-white text-4xl font-bold px-2 py-1 bg-black/30 rounded-full hover:bg-black/60" onClick={e => { e.stopPropagation(); setPreviewImg(images[previewIdx+1]); setPreviewIdx(previewIdx+1); }}>&gt;</button>
          )}
          <button className="absolute top-6 right-8 text-white text-3xl font-bold" onClick={() => { setPreviewImg(null); setPreviewIdx(-1); }}>&times;</button>
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
    const parts = tag.split("/");
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
      currentNote.content += line.replace(/^\s+/, '') + "\n";
    }
  });

  if (currentNote) result.push(currentNote);
  return result;
}