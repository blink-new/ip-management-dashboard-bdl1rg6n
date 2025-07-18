import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  StickyNote, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  User, 
  Clock,
  Lock,
  Globe,
  Reply,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useEntityNotes, useEntityComments } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'

interface NotesCommentsPanelProps {
  entityType: string
  entityId: string
  entityTitle: string
}

export function NotesCommentsPanel({ entityType, entityId, entityTitle }: NotesCommentsPanelProps) {
  const { user } = useAuth()
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useEntityNotes(entityType, entityId)
  const { comments, loading: commentsLoading, createComment, deleteComment } = useEntityComments(entityType, entityId)
  
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteIsPublic, setNewNoteIsPublic] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editNoteContent, setEditNoteContent] = useState('')
  const [editNoteIsPublic, setEditNoteIsPublic] = useState(false)
  
  const [newCommentContent, setNewCommentContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus({ type: null, message: '' }), 3000)
  }

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return

    try {
      setSaving(true)
      await createNote(newNoteContent.trim(), newNoteIsPublic)
      setNewNoteContent('')
      setNewNoteIsPublic(false)
      showStatus('success', 'Note created successfully')
    } catch (error) {
      showStatus('error', 'Failed to create note')
    } finally {
      setSaving(false)
    }
  }

  const handleEditNote = (noteId: string, content: string, isPublic: boolean) => {
    setEditingNote(noteId)
    setEditNoteContent(content)
    setEditNoteIsPublic(isPublic)
  }

  const handleUpdateNote = async () => {
    if (!editingNote || !editNoteContent.trim()) return

    try {
      setSaving(true)
      await updateNote(editingNote, editNoteContent.trim(), editNoteIsPublic)
      setEditingNote(null)
      setEditNoteContent('')
      setEditNoteIsPublic(false)
      showStatus('success', 'Note updated successfully')
    } catch (error) {
      showStatus('error', 'Failed to update note')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId)
      showStatus('success', 'Note deleted successfully')
    } catch (error) {
      showStatus('error', 'Failed to delete note')
    }
  }

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) return

    try {
      setSaving(true)
      await createComment(newCommentContent.trim())
      setNewCommentContent('')
      showStatus('success', 'Comment added successfully')
    } catch (error) {
      showStatus('error', 'Failed to add comment')
    } finally {
      setSaving(false)
    }
  }

  const handleReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return

    try {
      setSaving(true)
      await createComment(replyContent.trim(), parentCommentId)
      setReplyingTo(null)
      setReplyContent('')
      showStatus('success', 'Reply added successfully')
    } catch (error) {
      showStatus('error', 'Failed to add reply')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId)
      showStatus('success', 'Comment deleted successfully')
    } catch (error) {
      showStatus('error', 'Failed to delete comment')
    }
  }

  const cancelEdit = () => {
    setEditingNote(null)
    setEditNoteContent('')
    setEditNoteIsPublic(false)
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setReplyContent('')
  }

  // Group comments by parent
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id)
  const getReplies = (commentId: string) => comments.filter(comment => comment.parent_comment_id === commentId)

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {status.type && (
        <Alert className={`border-0 ${
          status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center gap-2">
            {status.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={
              status.type === 'success' ? 'text-green-800' : 'text-red-800'
            }>
              {status.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes" className="gap-2">
            <StickyNote className="h-4 w-4" />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          {/* Create New Note */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-600" />
                Add New Note
              </CardTitle>
              <CardDescription>
                Create a personal note for this {entityType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your note here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={4}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public-note"
                    checked={newNoteIsPublic}
                    onCheckedChange={setNewNoteIsPublic}
                  />
                  <Label htmlFor="public-note" className="flex items-center gap-2">
                    {newNoteIsPublic ? (
                      <>
                        <Globe className="h-4 w-4 text-green-600" />
                        Public note
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-gray-600" />
                        Private note
                      </>
                    )}
                  </Label>
                </div>
                
                <Button 
                  onClick={handleCreateNote}
                  disabled={!newNoteContent.trim() || saving}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Note
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-amber-600" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <StickyNote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
                  <p className="text-gray-600">Add your first note to keep track of important information</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 bg-amber-50">
                      {editingNote === note.id ? (
                        <div className="space-y-4">
                          <Textarea
                            value={editNoteContent}
                            onChange={(e) => setEditNoteContent(e.target.value)}
                            rows={4}
                          />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`edit-public-${note.id}`}
                                checked={editNoteIsPublic}
                                onCheckedChange={setEditNoteIsPublic}
                              />
                              <Label htmlFor={`edit-public-${note.id}`} className="flex items-center gap-2">
                                {editNoteIsPublic ? (
                                  <>
                                    <Globe className="h-4 w-4 text-green-600" />
                                    Public
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 text-gray-600" />
                                    Private
                                  </>
                                )}
                              </Label>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={handleUpdateNote}
                                disabled={saving}
                              >
                                {saving ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-amber-200 rounded">
                                <User className="h-3 w-3 text-amber-700" />
                              </div>
                              <span className="text-sm font-medium">You</span>
                              <Badge variant="outline" className={note.is_public ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                                {note.is_public ? (
                                  <>
                                    <Globe className="h-3 w-3 mr-1" />
                                    Public
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-3 w-3 mr-1" />
                                    Private
                                  </>
                                )}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNote(note.id, note.content, note.is_public)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this note? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteNote(note.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Note
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <p className="text-gray-900 whitespace-pre-wrap mb-3">{note.content}</p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            Created {new Date(note.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {/* Create New Comment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Add Comment
              </CardTitle>
              <CardDescription>
                Start a discussion about this {entityType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your comment here..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                rows={3}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleCreateComment}
                  disabled={!newCommentContent.trim() || saving}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Discussion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : topLevelComments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">Start the discussion by adding the first comment</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {topLevelComments.map((comment) => {
                    const replies = getReplies(comment.id)
                    
                    return (
                      <div key={comment.id} className="space-y-4">
                        {/* Main Comment */}
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-blue-200 rounded">
                                <User className="h-3 w-3 text-blue-700" />
                              </div>
                              <span className="text-sm font-medium">You</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(comment.id)}
                                className="h-8 px-2 text-xs"
                              >
                                <Reply className="h-3 w-3 mr-1" />
                                Reply
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this comment? This will also delete all replies. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Comment
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <p className="text-gray-900 whitespace-pre-wrap mb-3">{comment.content}</p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>

                          {/* Reply Form */}
                          {replyingTo === comment.id && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                              <Textarea
                                placeholder="Write your reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={cancelReply}>
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleReply(comment.id)}
                                  disabled={!replyContent.trim() || saving}
                                >
                                  {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    'Reply'
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Replies */}
                        {replies.length > 0 && (
                          <div className="ml-8 space-y-3">
                            {replies.map((reply) => (
                              <div key={reply.id} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 bg-gray-200 rounded">
                                      <User className="h-3 w-3 text-gray-700" />
                                    </div>
                                    <span className="text-sm font-medium">You</span>
                                  </div>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Reply</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this reply? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteComment(reply.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete Reply
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                                
                                <p className="text-gray-900 whitespace-pre-wrap mb-2">{reply.content}</p>
                                
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {new Date(reply.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}