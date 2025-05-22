
import { useState } from 'react'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'

function parseTags(text) {
  const tags = new Set()
  const regex = /#([\w\/]+)/g
  let match
  while ((match = regex.exec(text))) {
    match[1].split('/').forEach(t => tags.add(t))
  }
  return Array.from(tags)
}

function NoteCard({ note, onEdit }) {
  return (
    <Card className='mb-2'>
      <CardContent onClick={onEdit}>
        <div className='text-sm whitespace-pre-wrap'>{note.content}</div>
      </CardContent>
    </Card>
  )
}

export default function App() {
  const [notes, setNotes] = useState([])
  const [input, setInput] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [filterTag, setFilterTag] = useState(null)

  const handleAdd = () => {
    if (editingIndex !== null) {
      const updated = [...notes]
      updated[editingIndex].content = input
      updated[editingIndex].tags = parseTags(input)
      setNotes(updated)
      setEditingIndex(null)
    } else {
      setNotes([{ content: input, tags: parseTags(input) }, ...notes])
    }
    setInput('')
  }

  const handleEdit = (index) => {
    setEditingIndex(index)
    setInput(notes[index].content)
  }

  const filteredNotes = filterTag
    ? notes.filter(note => note.tags.includes(filterTag))
    : notes

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)))

  return (
    <div className='max-w-md mx-auto p-4 space-y-4'>
      <Textarea value={input} onChange={e => setInput(e.target.value)} />
      <Button onClick={handleAdd}>{editingIndex !== null ? '保存修改' : '添加笔记'}</Button>
      <div className='flex flex-wrap gap-2 pt-2'>
        {allTags.map(tag => (
          <Button
            key={tag}
            variant={filterTag === tag ? 'default' : 'outline'}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
          >
            #{tag}
          </Button>
        ))}
      </div>
      <div>
        {filteredNotes.map((note, idx) => (
          <NoteCard key={idx} note={note} onEdit={() => handleEdit(idx)} />
        ))}
      </div>
    </div>
  )
}
