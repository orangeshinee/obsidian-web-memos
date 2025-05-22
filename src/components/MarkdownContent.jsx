import React from "react";
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
      if (!children) return <p {...props}>{children}</p>;
      
      // 直接查找和处理文本节点中的标签
      const processChildren = (items) => {
        if (!items) return [];
        
        return React.Children.map(items, child => {
          // 如果子元素不是字符串，直接返回
          if (typeof child !== 'string') return child;
          
          // 处理文本节点中的标签
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
    
    // 不在上方单独渲染图片，而是让 ReactMarkdown 直接处理
    // 这样可以保持原文中图片的位置
    img: ({ src, alt, ...props }) => (
      <img 
        src={src} 
        alt={alt || ''} 
        className="my-2 max-w-full rounded" 
        {...props}
      />
    )
  };

  return (
    <>
      {/* 使用 ReactMarkdown 渲染内容 */}
      <div className="markdown-body">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkBreaks]} 
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