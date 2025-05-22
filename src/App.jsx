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
      <div 
        className="relative group"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="操作菜单"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
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

      <div className="bg-white rounded-xl border border-green-300 shadow-sm p-4 mb-2 relative" style={{ minHeight: 120 }}>
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="输入你的 Markdown 笔记..."
          className="w-full border-none outline-none resize-none bg-transparent min-h-[80px] text-base"
          style={{ boxShadow: 'none', height: 'auto', overflow: 'hidden' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        <Button
          onClick={handleAddNote}
          className={`!bg-green-500 hover:!bg-green-600 text-white rounded-lg absolute bottom-3 right-4 px-4 py-1 shadow-md ${!newNote.trim() ? 'opacity-50' : ''}`}
          style={{ minWidth: 30 }}
        >
          <svg width="1.5em" height="1.5em" fill="none" viewBox="0 0 24 24"><path d="M4 20L20 12L4 4V10L16 12L4 14V20Z" fill="currentColor"/></svg>
        </Button>
      </div>

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
                <div className="relative">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full"
                  />
                  <div className="absolute right-2 bottom-2 flex gap-2 z-20">
                    <Button onClick={() => handleSaveEdit(index)} className="px-5 shadow-md bg-green-500 hover:bg-green-600 text-white">保存</Button>
                    <Button variant="ghost" onClick={() => setEditingIndex(null)} className="px-5">取消</Button>
                  </div>
                </div>
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