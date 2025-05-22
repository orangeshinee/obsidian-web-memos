import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import MarkdownContent, { extractTags, parseMdNotes } from "@/components/MarkdownContent";

function NoteActions({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute top-2 right-2 z-10">
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
        onClick={() => setOpen((v) => !v)}
        aria-label="操作菜单"
      >
        <span style={{ fontSize: 22, fontWeight: 700 }}>...</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-28 bg-white rounded shadow-lg border border-gray-100 py-1 text-sm">
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => { setOpen(false); onEdit(); }}>编辑</button>
          <button className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50" onClick={() => { setOpen(false); onDelete(); }}>删除</button>
        </div>
      )}
    </div>
  );
}

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

  const handleDeleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
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

      {filteredNotes.map((note, index) => {
        const cleanContent = note.content.replace(/\n+$/, "");
        return (
          <Card key={note.filename + index + note.createdAt} className="mt-4 relative">
            <NoteActions
              onEdit={() => {
                setEditingIndex(index);
                setEditContent(note.content);
              }}
              onDelete={() => handleDeleteNote(index)}
            />
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
                <div className="whitespace-pre-wrap font-sans">
                  <MarkdownContent content={cleanContent} onTagClick={setActiveTag} tagClassName="align-middle" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}