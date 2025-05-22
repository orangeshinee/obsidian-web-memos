import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

// 提取所有标签，包括多级标签拆分
const extractTags = (content) => {
  const rawTags = [...content.matchAll(/#\w+(?:\/\w+)*/g)].map((m) => m[0]);
  const allParts = new Set();
  rawTags.forEach((tag) => {
    const parts = tag.slice(1).split("/");
    parts.forEach((t) => allParts.add(t));
  });
  return Array.from(allParts);
};

// 渲染标签和图片
const renderContent = (content, onTagClick) => {
  return content.split(/(#[\w\/]+|!\[[^\]]*\]\([^\)]+\))/g).map((part, i) => {
    if (/^#\w+(?:\/\w+)*$/.test(part)) {
      return (
        <button
          key={i}
          className="text-blue-600 underline hover:text-blue-800"
          onClick={() => {
            const subTags = part.slice(1).split("/");
            subTags.forEach((t) => onTagClick(t));
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
  });
};

// 解析 yyyy-MM-dd.md 文件格式中的 - HH:mm 开头分段
const parseMdNotes = (filename, rawContent, lastModified) => {
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
};

export default function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      filename: `note_${Date.now()}.md`,
      content: newNote,
      createdAt: new Date(),
    };
    setNotes([note, ...notes]);
    setNewNote("");
  };

  const handleSaveEdit = (index) => {
    const updated = [...notes];
    updated[index].content = editContent;
    setNotes(updated);
    setEditingIndex(null);
    setEditContent("");
  };

  const handleLoadFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const newNotes = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file" && entry.name.endsWith(".md")) {
          const file = await entry.getFile();
          const text = await file.text();
          const parsed = parseMdNotes(entry.name, text, file.lastModified);
          newNotes.push(...parsed);
        }
      }
      setNotes(newNotes);
    } catch (err) {
      console.error("目录读取失败:", err);
    }
  };

  const filteredNotes = activeTag
    ? notes.filter((n) => extractTags(n.content).includes(activeTag))
    : notes;

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">📝 笔记卡片</h1>

      <div className="space-x-2">
        <Button onClick={handleAddNote}>添加笔记</Button>
        <Button variant="outline" onClick={handleLoadFolder}>读取本地文件夹</Button>
      </div>

      <Textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="输入你的 Markdown 笔记..."
        className="w-full"
      />

      {activeTag && (
        <div className="text-sm text-gray-600">
          当前筛选标签：<span className="font-semibold">{activeTag}</span>
          <Button variant="link" onClick={() => setActiveTag(null)}>
            清除筛选
          </Button>
        </div>
      )}

      {filteredNotes.map((note, index) => (
        <Card key={note.filename + index + note.createdAt} className="mt-4">
          <CardContent className="p-4 space-y-2">
            <div className="text-sm text-gray-500">
              {format(note.createdAt, "yyyy-MM-dd HH:mm")}
            </div>

            {editingIndex === index ? (
              <>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full"
                />
                <Button onClick={() => handleSaveEdit(index)}>保存</Button>
                <Button variant="ghost" onClick={() => setEditingIndex(null)}>取消</Button>
              </>
            ) : (
              <>
                <div className="whitespace-pre-wrap font-sans">
                  {renderContent(note.content, (tag) => setActiveTag(tag))}
                </div>
                <Button variant="link" onClick={() => {
                  setEditingIndex(index);
                  setEditContent(note.content);
                }}>
                  编辑
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}