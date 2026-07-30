'use client'

import React, { useState, useEffect, useRef } from 'react'
import { signOut } from 'next-auth/react'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

// 1. Premium SVG Logo for Habarnoma
const HabarnomaLogo = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#161f30" stroke="#2d3d5a" strokeWidth="1.5" />
    <path d="M7 9L12 13L17 9" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 17V8C5 6.89543 5.89543 6 7 6H17C18.1046 6 19 6.89543 19 8V14C19 15.1046 18.1046 16 17 16H8.82843C8.29799 16 7.78929 16.2107 7.41421 16.5858L5.70711 18.2929C5.39301 18.607 4.875 18.3849 4.875 17.9393V17Z" stroke="#f8fafc" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="18" cy="6" r="2.5" fill="#10b981" stroke="#161f30" strokeWidth="1.5" />
  </svg>
)

const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6"/>
  </svg>
)

const PaperclipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const BanIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
)

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
)

interface Message {
  id: string
  sender_name: string
  avatar: string
  text: string
  created_at: string
  reply_to_id?: string
  reply_to_text?: string
  reply_to_sender?: string
  file_url?: string
  file_type?: string
  file_name?: string
  is_edited?: boolean
}

const avatarOptions = [
  '👨‍💻', '👩‍💻', '🦊', '🐼', '🤖', '👻', '🐱', '🦖',
  '🦁', '🐯', '🐨', '🐙', '🦄', '🐉', '👽', '👾',
  '🥷', '🧙‍♂️', '🧙‍♀️', '🧑‍🚀', '🤠', '🤡', '👹', '👺',
  '🐻', '🐺', '🐸', '🐹', '🐷', '🐒', '🐔', '🐧',
  '🦅', '🦉', '🦋', '🐝', '🐠', '🐢', '🦈', '🦌'
]

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language || 'text'}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? <CheckIcon /> : <CopyIcon />} {copied ? 'Nusxalandi' : 'Nusxalash'}
        </button>
      </div>
      <SyntaxHighlighter
        language={(language || 'text').toLowerCase()}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '14px',
          padding: '12px',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

const renderTextWithLinks = (text: string) => {
  const codeBlockRegex = /```([\w-]*)(?:\r?\n)?([\s\S]*?)```/g
  const parts = []
  let lastIndex = 0
  let match

  const renderLinks = (str: string, baseIndex: number) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urlParts = str.split(urlRegex)
    return urlParts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={`link-${baseIndex}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="message-link"
          >
            {part}
          </a>
        )
      }
      return <span key={`text-${baseIndex}-${index}`}>{part}</span>
    })
  }

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderLinks(text.substring(lastIndex, match.index), lastIndex))
    }
    const language = match[1] || ''
    const code = match[2]
    parts.push(<CodeBlock key={`code-${match.index}`} code={code} language={language} />)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(renderLinks(text.substring(lastIndex), lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : renderLinks(text, 0)
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

const getReplyToTextValue = (m: Message) => {
  if (m.text) return m.text
  if (m.file_type?.startsWith('image/')) return '🖼️ Rasm'
  if (m.file_name) return `📎 ${m.file_name}`
  if (m.file_url) return '📎 Fayl'
  return null
}

const isSuperAdminFormat = (name: string) => {
  if (!name) return false
  const trimmed = name.trim()
  return trimmed.startsWith(',') && trimmed.endsWith('.') && trimmed.length > 2
}

const isSuperAdmin = (name: string) => {
  return isSuperAdminFormat(name)
}

const getDisplayName = (name: string) => {
  if (!name) return ''
  const trimmed = name.trim()
  if (isSuperAdminFormat(trimmed)) {
    return trimmed.substring(1, trimmed.length - 1)
  }
  return name
}

const isAdminUser = (name: string, adminList: string[] = []) => {
  if (!name) return false
  return isSuperAdmin(name) || adminList.map(a => a.toLowerCase()).includes(name.toLowerCase())
}

const isRegularAdmin = (name: string, adminList: string[] = []) => {
  return adminList.map(a => a.toLowerCase()).includes(name.toLowerCase()) && !isSuperAdmin(name)
}

interface ChatAppProps {
  user: {
    name: string
    email: string
    image: string
    role: string
  }
}

export function ChatApp({ user }: ChatAppProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [tempAvatar, setTempAvatar] = useState(avatarOptions[0])

  const [messages, setMessages] = useState<Message[]>([])
  const [isFetchingMessages, setIsFetchingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [showInstallAlert, setShowInstallAlert] = useState(false)
  const [codeSnippet, setCodeSnippet] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('')

  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [isSelfBlocked, setIsSelfBlocked] = useState(false)
  const [adminsList, setAdminsList] = useState<string[]>([])

  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'chat' | 'admin'>('chat')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingChannelRef = useRef<any>(null)

  useEffect(() => {
    setIsMounted(true)

    // PWA install prompt handler
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 2-second timer to allow views to settle
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Auto-setup name and avatar from NextAuth session props
    let finalName = user.name
    if (user.role === 'admin' && !isSuperAdminFormat(user.name)) {
      finalName = `,${user.name || 'Admin'}.`
    }
    setUsername(finalName)

    try {
      const storedAvatar = localStorage.getItem('xabarnoma_avatar')
      if (storedAvatar) {
        setAvatar(storedAvatar)
      }
    } catch (err) {
      console.error('LocalStorage error:', err)
    }

    if (isSupabaseConfigured) {
      let blockedChannel: any = null
      let adminsChannel: any = null

      const initData = async () => {
        try {
          const { data: blockedData } = await supabase.from('blocked_users').select('username')
          if (blockedData) {
            const names = blockedData.map((b: any) => b.username.toLowerCase())
            setBlockedUsers(names)
            if (names.includes(finalName.trim().toLowerCase())) {
              setIsSelfBlocked(true)
            }
          }
        } catch (e) {
          console.error('blocked_users error:', e)
        }

        try {
          const { data: adminData } = await supabase
            .from('admins')
            .select('username')
            .order('created_at', { ascending: true })
          if (adminData) {
            setAdminsList(adminData.map((a: any) => a.username))
          }
        } catch (e) {
          console.error('admins error:', e)
        }
      }
      initData()

      try {
        blockedChannel = supabase
          .channel('blocked-users-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'blocked_users' },
            (payload) => {
              try {
                if (payload.eventType === 'INSERT') {
                  const newBlocked = (payload.new as any).username
                  setBlockedUsers((prev) => [...prev, newBlocked.toLowerCase()])

                  if (finalName.trim().toLowerCase() === newBlocked.trim().toLowerCase()) {
                    setIsSelfBlocked(true)
                    alert('Siz admin tomonidan bloklandingiz!')
                    signOut({ callbackUrl: '/' })
                  }
                } else if (payload.eventType === 'DELETE') {
                  const blockedName = (payload.old as any).username
                  if (blockedName) {
                    setBlockedUsers((prev) =>
                      prev.filter((name) => name !== blockedName.toLowerCase())
                    )
                    if (finalName.trim().toLowerCase() === blockedName.trim().toLowerCase()) {
                      setIsSelfBlocked(false)
                    }
                  }
                }
              } catch (e) {
                console.error('Realtime blocked error:', e)
              }
            }
          )
          .subscribe()
      } catch (e) {
        console.error('blockedChannel subscribe error:', e)
      }

      try {
        adminsChannel = supabase
          .channel('admins-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'admins' },
            () => {
              supabase
                .from('admins')
                .select('username')
                .order('created_at', { ascending: true })
                .then(
                  ({ data }) => {
                    if (data) setAdminsList(data.map((a: any) => a.username))
                  },
                  () => {}
                )
            }
          )
          .subscribe()
      } catch (e) {
        console.error('adminsChannel subscribe error:', e)
      }

      return () => {
        clearTimeout(timer)
        if (blockedChannel) supabase.removeChannel(blockedChannel)
        if (adminsChannel) supabase.removeChannel(adminsChannel)
      }
    }

    return () => clearTimeout(timer)
  }, [user])

  // Fetch messages and subscribe to real-time events
  useEffect(() => {
    if (!isMounted || !username || !isSupabaseConfigured) return

    const fetchMessages = async () => {
      setIsFetchingMessages(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) {
        console.error('Xabarlarni yuklashda xatolik:', error)
      } else if (data) {
        setMessages(data)
      }
      setIsFetchingMessages(false)
    }

    fetchMessages()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as Message
            setMessages((prev) =>
              prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
            )
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isMounted, username])

  // Typing broadcasts
  useEffect(() => {
    if (!username || !isSupabaseConfigured) return

    const channel = supabase.channel('typing_room', {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user: typingUser, isTyping } = payload.payload
        if (!typingUser) return
        setTypingUsers((prev) => {
          const current = new Set(prev)
          if (isTyping) {
            current.add(typingUser)
          } else {
            current.delete(typingUser)
          }
          return Array.from(current)
        })
      })
      .subscribe()

    typingChannelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [username])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
      } else {
        try {
          const text = await file.text()
          let ext = file.name.split('.').pop() || ''
          if (ext === 'txt') ext = ''
          const codeBlock = `\`\`\`${ext}\n${text}\n\`\`\``
          setNewMessage((prev) => (prev ? `${prev}\n\n${codeBlock}` : codeBlock))
          if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (err) {
          alert('Faylni o\'qishda xatolik yuz berdi!')
        }
      }
    }
  }

  const copyToClipboard = (msgId: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedMessageId(msgId)
    setTimeout(() => {
      setCopiedMessageId(null)
    }, 2000)
  }

  const handleEditClick = (msg: Message) => {
    setEditingMessage(msg)
    setReplyingTo(null)
    setNewMessage(msg.text)
  }

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Haqiqatan ham ushbu xabarni o\'chirib tashlamoqchimisiz?')) return

    const { error } = await supabase.from('messages').delete().eq('id', msgId)

    if (error) {
      console.error('Xabarni o\'chirishda xatolik:', error)
      alert('Xabarni o\'chirishda xatolik yuz berdi: ' + error.message)
    }
  }

  const scrollToMessage = (msgId: string) => {
    const element = document.getElementById(`msg-${msgId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('highlighted-message')
      setTimeout(() => {
        element.classList.remove('highlighted-message')
      }, 2000)
    }
  }

  const handleClearChat = async () => {
    if (!confirm('Haqiqatan ham butun chatni tozalamoqchimisiz? Barcha xabarlar o\'chiriladi!'))
      return

    const { error } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      console.error('Chatni tozalashda xatolik:', error)
      alert('Chatni tozalashda xatolik yuz berdi: ' + error.message)
    } else {
      setMessages([])
    }
  }

  const handleToggleMessageSelection = (msgId: string) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev)
      if (next.has(msgId)) {
        next.delete(msgId)
      } else {
        next.add(msgId)
      }
      return next
    })
  }

  const handleSelectAllMessages = () => {
    setSelectedMessageIds(new Set(messages.map((m) => m.id)))
  }

  const handleCancelSelection = () => {
    setIsSelectMode(false)
    setSelectedMessageIds(new Set())
  }

  const handleDeleteSelectedMessages = async () => {
    const count = selectedMessageIds.size
    if (count === 0) return
    if (!confirm(`Haqiqatan ham tanlangan ${count} ta xabarni o'chirib tashlamoqchimisiz?`)) return

    const idsToDelete = Array.from(selectedMessageIds)
    const { error } = await supabase.from('messages').delete().in('id', idsToDelete)

    if (error) {
      console.error('Xabarlarni o\'chirishda xatolik:', error)
      alert('Xabarlarni o\'chirishda xatolik yuz berdi: ' + error.message)
    } else {
      setMessages((prev) => prev.filter((m) => !selectedMessageIds.has(m.id)))
      setIsSelectMode(false)
      setSelectedMessageIds(new Set())
    }
  }

  const handleBlockUser = async (userToBlock: string) => {
    if (!isSuperAdmin(username) && isAdminUser(userToBlock, adminsList)) {
      alert('Admin boshqa adminni bloklay olmaydi!')
      return
    }

    if (!confirm(`Haqiqatan ham "${userToBlock}"ni bloklab, chatdan chiqarib yubormoqchimisiz?`))
      return

    const { error } = await supabase.from('blocked_users').insert([{ username: userToBlock }])

    if (error) {
      console.error('Bloklashda xatolik:', error)
      alert('Bloklashda xatolik yuz berdi: ' + error.message)
    } else {
      if (isRegularAdmin(userToBlock, adminsList)) {
        await supabase.from('admins').delete().eq('username', userToBlock)
      }
      await supabase.from('messages').delete().eq('sender_name', userToBlock)
      alert(`"${userToBlock}" bloklandi va uning xabarlari tozalandi.`)
    }
  }

  const handleRemoveAdmin = async (adminName: string) => {
    if (!confirm(`Haqiqatan ham "${adminName}"ni adminlar ro'yxatidan o'chirmoqchimisiz?`)) return
    const { error } = await supabase.from('admins').delete().eq('username', adminName)
    if (error) {
      alert('Xatolik yuz berdi: ' + error.message)
    } else {
      setAdminsList(prev => prev.filter(a => a !== adminName))
      alert(`"${adminName}" adminlar ro'yxatidan o'chirildi.`)
    }
  }

  const handleAddAdminWithName = async (adminName: string) => {
    if (!confirm(`Haqiqatan ham "${adminName}"ni admin qilmoqchimisiz?`)) return
    const { error } = await supabase.from('admins').insert([{ username: adminName }])
    if (error) {
      alert('Xatolik yuz berdi: ' + error.message)
    } else {
      setAdminsList(prev => [...prev, adminName])
      alert(`"${adminName}" admin qilindi.`)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = (e.currentTarget as HTMLFormElement).querySelector('input')
    const name = input?.value.trim()
    if (name) {
      await handleAddAdminWithName(name)
      if (input) input.value = ''
    }
  }

  const handleUnblockUser = async (userName: string) => {
    if (!confirm(`Haqiqatan ham "${userName}"ni blokdan chiqarmoqchimisiz?`)) return
    const { error } = await supabase.from('blocked_users').delete().eq('username', userName)
    if (error) {
      alert('Xatolik yuz berdi: ' + error.message)
    } else {
      setBlockedUsers(prev => prev.filter(u => u !== userName.toLowerCase()))
      alert(`"${userName}" blokdan chiqarildi.`)
    }
  }

  const handleBlockNewUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = (e.currentTarget as HTMLFormElement).querySelector('input')
    const name = input?.value.trim()
    if (name) {
      await handleBlockUser(name)
      if (input) input.value = ''
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || isSending || !isSupabaseConfigured) return

    setIsSending(true)
    const messageText = newMessage

    setNewMessage('')

    if (editingMessage) {
      const { error } = await supabase
        .from('messages')
        .update({ text: messageText, is_edited: true })
        .eq('id', editingMessage.id)

      if (error) {
        console.error('Xabarni tahrirlashda xatolik:', error)
        setNewMessage(messageText)
      } else {
        setEditingMessage(null)
      }
      setIsSending(false)
      return
    }

    let fileUrl = ''
    let fileType = ''
    let fileName = ''

    if (selectedFile) {
      try {
        fileUrl = await fileToBase64(selectedFile)
        fileType = selectedFile.type
        fileName = selectedFile.name
      } catch (err) {
        console.error('Faylni Base64 formatiga o\'tkazishda xatolik:', err)
        alert('Rasmni o\'qishda xatolik yuz berdi.')
        setIsSending(false)
        setNewMessage(messageText)
        return
      }
    }

    const { error } = await supabase.from('messages').insert([
      {
        sender_name: username,
        avatar: avatar,
        text: messageText,
        reply_to_id: replyingTo?.id || null,
        reply_to_text: replyingTo ? getReplyToTextValue(replyingTo) : null,
        reply_to_sender: replyingTo?.sender_name || null,
        file_url: fileUrl || null,
        file_type: fileType || null,
        file_name: fileName || null,
      },
    ])

    if (error) {
      console.error('Xabar yuborishda xatolik:', error)
      alert('Xatolik yuz berdi (bazaga yozishda): ' + error.message)
      setNewMessage(messageText)
    } else {
      setReplyingTo(null)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }

    if (typingChannelRef.current) {
      typingChannelRef.current
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { user: username, isTyping: false },
        })
        .catch(() => {})
    }

    setIsSending(false)
  }

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null)
      })
    } else {
      setShowInstallAlert(true)
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return ''
    }
  }

  if (!isMounted || isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-logo-wrapper">
            <HabarnomaLogo />
            <div className="logo-glow-ring"></div>
          </div>
          <h1 className="loading-title">
            Habarnoma<span className="logo-accent">.</span>
          </h1>
          <p className="loading-subtitle">Xavfsiz va tezkor muloqot tizimi</p>
          <div className="premium-spinner-bar">
            <div className="spinner-progress"></div>
          </div>
        </div>
      </div>
    )
  }

  if (isSelfBlocked) {
    return (
      <div className="modal-overlay">
        <div className="modal-content glass-effect" style={{ borderColor: '#ef4444' }}>
          <div className="modal-logo" style={{ color: '#ef4444' }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h1 className="modal-title" style={{ color: '#ef4444' }}>
            Siz bloklangansiz!
          </h1>
          <p className="modal-subtitle">
            Admin tomonidan chatdan chetlashtirildingiz. Savollar bo'lsa, admin bilan bog'laning.
          </p>
          <a
            href="https://t.me/HayrullohAdusamadov"
            target="_blank"
            rel="noreferrer"
            className="modal-button"
            style={{
              backgroundColor: '#ef4444',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            Admin bilan bog'lanish
          </a>
        </div>
      </div>
    )
  }

  // Emoji picker modal on first login to choose avatar (persists to localStorage)
  if (!avatar) {
    return (
      <div className="modal-overlay">
        <div className="modal-content glass-effect">
          <div className="modal-logo">
            <HabarnomaLogo />
          </div>
          <h1 className="modal-title">
            Habarnoma<span className="logo-accent">.</span>
          </h1>
          <p className="modal-subtitle">
            Chatdan foydalanish uchun o&apos;zingizga logotip (avatar) tanlang.
          </p>

          <div className="modal-form">
            <div className="modal-input-group">
              <label className="modal-label">Avatar tanlang</label>
              <div className="avatar-selector">
                {avatarOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`avatar-option ${tempAvatar === opt ? 'selected' : ''}`}
                    onClick={() => setTempAvatar(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setAvatar(tempAvatar)
                localStorage.setItem('xabarnoma_avatar', tempAvatar)
              }}
              className="modal-button"
            >
              Chatga kirish
            </button>
          </div>

          <div className="modal-footer-attribution">
            <p>
              Yaratuvchi: <strong>Hayrulloh Abdusamadov</strong>
            </p>
            <p>
              Telegram kanal:{' '}
              <a href="https://t.me/HayrullohAdusamadov" target="_blank" rel="noreferrer">
                @HayrullohAdusamadov
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header glass-effect">
        <div className="logo-container">
          <HabarnomaLogo />
          <h1 className="logo-text">
            Habarnoma<span className="logo-accent">.</span>
          </h1>
          {isAdminUser(username, adminsList) && (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
              <button
                onClick={() => setActiveTab('chat')}
                className="clear-chat-btn select-all-btn"
                style={activeTab === 'chat' ? { background: 'var(--color-primary)', color: '#000' } : {}}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className="clear-chat-btn select-all-btn"
                style={activeTab === 'admin' ? { background: 'var(--color-primary)', color: '#000' } : {}}
              >
                🛡️ Admin Panel
              </button>
            </div>
          )}
        </div>
        <div
          className="header-actions-group"
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          {isAdminUser(username, adminsList) && (
            <>
              {isSelectMode ? (
                <div
                  className="select-mode-actions"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <button className="clear-chat-btn select-all-btn" onClick={handleSelectAllMessages}>
                    ✓ Hammasini belgilash
                  </button>
                  <button
                    className="clear-chat-btn delete-selected-btn"
                    onClick={handleDeleteSelectedMessages}
                    disabled={selectedMessageIds.size === 0}
                  >
                    🗑️ Tanlanganlarni o'chirish ({selectedMessageIds.size})
                  </button>
                  <button className="clear-chat-btn cancel-select-btn" onClick={handleCancelSelection}>
                    Bekor qilish
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="clear-chat-btn" onClick={handleClearChat} title="Butun chatni tozalash">
                    🧹 Tozalash
                  </button>
                  <button
                    className="clear-chat-btn select-delete-toggle-btn"
                    onClick={() => setIsSelectMode(true)}
                    title="Tanlab o'chirish"
                  >
                    ☑ Tanlab o'chirish
                  </button>
                </div>
              )}
            </>
          )}
          {username && (
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="user-profile">
                <span className="user-avatar">{avatar}</span>
                <span className="user-name">{getDisplayName(username)}</span>
                {isAdminUser(username, adminsList) && <span className="admin-badge">👑</span>}
              </div>
              <button
                className="action-btn"
                style={{
                  opacity: 1,
                  transform: 'none',
                  color: 'var(--color-primary)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  marginLeft: '12px',
                  width: '36px',
                  height: '36px',
                }}
                onClick={handleInstallClick}
                title="Yorliq sifatida o'rnatish"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button
                className="action-btn"
                style={{
                  opacity: 1,
                  transform: 'none',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  marginLeft: '12px',
                  width: '36px',
                  height: '36px',
                }}
                onClick={() => setShowLogoutModal(true)}
                title="Chiqish"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="chat-window glass-effect-subtle" style={{ display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'admin' ? (
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--color-primary)' }}>
              🛡️ Admin Boshqaruv Paneli
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* 1. Admins List */}
              <div className="glass-effect" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>
                  👑 Adminlar Ro'yxati ({adminsList.length + 1})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                  {/* Super Admin */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                    <span>{getDisplayName(username)} (Siz)</span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--color-primary)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>SUPER ADMIN</span>
                  </div>
                  
                  {adminsList.map(admin => (
                    <div key={admin} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      <span>{admin}</span>
                      <button 
                        onClick={() => handleRemoveAdmin(admin)}
                        className="clear-chat-btn" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        O'chirish
                      </button>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleAddAdmin} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Yangi admin ismi..." 
                    className="chat-input" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    required
                  />
                  <button type="submit" className="send-button" style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem' }}>
                    Qo'shish
                  </button>
                </form>
              </div>

              {/* 2. Blocked Users List */}
              <div className="glass-effect" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>
                  🚫 Bloklangan Foydalanuvchilar ({blockedUsers.length})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                  {blockedUsers.length === 0 ? (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Hech kim bloklanmagan.</span>
                  ) : (
                    blockedUsers.map(user => (
                      <div key={user} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                        <span>{user}</span>
                        <button 
                          onClick={() => handleUnblockUser(user)}
                          className="clear-chat-btn select-all-btn" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Blokdan yechish
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <form onSubmit={handleBlockNewUser} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Bloklanadigan ism..." 
                    className="chat-input" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    required
                  />
                  <button type="submit" className="send-button" style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem', backgroundColor: '#ef4444' }}>
                    Bloklash
                  </button>
                </form>
              </div>
            </div>

            {/* 3. Active Chat Senders */}
            <div className="glass-effect" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>
                👥 Chatda faol foydalanuvchilar (Xabar yozganlar)
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '12px 8px' }}>Avatar</th>
                      <th style={{ padding: '12px 8px' }}>Foydalanuvchi ismi</th>
                      <th style={{ padding: '12px 8px' }}>Roli</th>
                      <th style={{ padding: '12px 8px' }}>Holat</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right' }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(messages.map(m => m.sender_name))).map(sender => {
                      const isSenderAdmin = isAdminUser(sender, adminsList)
                      const isSenderBlocked = blockedUsers.includes(sender.toLowerCase())
                      const isSelf = sender.toLowerCase() === username.toLowerCase()
                      const avatarEmoji = messages.find(m => m.sender_name === sender)?.avatar || '👤'
                      
                      return (
                        <tr key={sender} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px 8px', fontSize: '1.25rem' }}>{avatarEmoji}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{getDisplayName(sender)} {isSelf && ' (Siz)'}</td>
                          <td style={{ padding: '12px 8px' }}>
                            {isSuperAdmin(sender) ? (
                              <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Super Admin</span>
                            ) : isSenderAdmin ? (
                              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Admin</span>
                            ) : (
                              <span>User</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            {isSenderBlocked ? (
                              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🚫 Bloklangan</span>
                            ) : (
                              <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓ Faol</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            {!isSelf && !isSuperAdmin(sender) && (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                {isSenderAdmin ? (
                                  <button 
                                    onClick={() => handleRemoveAdmin(sender)}
                                    className="clear-chat-btn" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  >
                                    User qilish
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleAddAdminWithName(sender)}
                                    className="clear-chat-btn select-all-btn" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  >
                                    Admin qilish
                                  </button>
                                )}
                                
                                {isSenderBlocked ? (
                                  <button 
                                    onClick={() => handleUnblockUser(sender)}
                                    className="clear-chat-btn select-all-btn" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  >
                                    Blokdan yechish
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleBlockUser(sender)}
                                    className="clear-chat-btn" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                                  >
                                    Bloklash
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                {typingUsers.map(getDisplayName).join(', ')} yozmoqda...
              </div>
            )}
        {!isSupabaseConfigured && (
          <div style={{ padding: '20px' }}>
            <div className="config-banner">
              <strong>Diqqat!</strong> Supabase ulanishi sozlanmagan.
            </div>
          </div>
        )}

        <div className="messages-container">
          {isFetchingMessages ? (
            <div className="messages-empty-state">
              <div
                className="spinner-small"
                style={{ width: 40, height: 40, borderWidth: 4, margin: '0 auto 16px' }}
              ></div>
              <p>Xabarlar yuklanmoqda...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="messages-empty-state">
              <HabarnomaLogo />
              <h3>Hozircha xabarlar yo&apos;q</h3>
              <p>Birinchi bo&apos;lib xabar yuboring!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOutgoing = msg.sender_name === username
              const isRegAdmin = isRegularAdmin(msg.sender_name, adminsList)
              const repliedMessage = msg.reply_to_id
                ? messages.find((m) => m.id === msg.reply_to_id)
                : null
              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`message-wrapper ${isOutgoing ? 'outgoing' : 'incoming'} ${
                    isRegAdmin ? 'admin-message' : ''
                  } ${isSelectMode ? 'in-select-mode' : ''} ${
                    selectedMessageIds.has(msg.id) ? 'is-selected-message' : ''
                  }`}
                  onClick={() => {
                    if (isSelectMode) {
                      handleToggleMessageSelection(msg.id)
                    }
                  }}
                  style={isSelectMode ? { cursor: 'pointer' } : {}}
                >
                  {!isOutgoing && (
                    <div className="message-sender">
                      <span className="msg-avatar">{msg.avatar || '👤'}</span>
                      <span>{getDisplayName(msg.sender_name)}</span>
                      {isRegAdmin && <span className="admin-badge">👑 ADMIN</span>}
                    </div>
                  )}

                  <div
                    className="message-select-container"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      flexDirection: isOutgoing ? 'row-reverse' : 'row',
                    }}
                  >
                    {isSelectMode && (
                      <div
                        className="message-select-checkbox"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          className={`custom-checkbox ${
                            selectedMessageIds.has(msg.id) ? 'checked' : ''
                          }`}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid var(--color-border)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            background: 'rgba(255,255,255,0.05)',
                          }}
                        >
                          {selectedMessageIds.has(msg.id) && <CheckIcon />}
                        </div>
                      </div>
                    )}

                    <div className="message-bubble-container" style={{ flex: 1 }}>
                      <div className="message-bubble">
                        {/* Render Quoted Reply */}
                        {(msg.reply_to_id || msg.reply_to_text) && (
                          <div
                            className="quoted-reply"
                            onClick={(e) => {
                              if (isSelectMode) return
                              e.stopPropagation()
                              if (msg.reply_to_id) scrollToMessage(msg.reply_to_id)
                            }}
                            style={{
                              cursor: msg.reply_to_id && !isSelectMode ? 'pointer' : 'default',
                            }}
                          >
                            <span className="quoted-sender">
                              {getDisplayName(msg.reply_to_sender || '')}
                            </span>
                            <div className="quoted-content-flex">
                              {repliedMessage?.file_url &&
                                repliedMessage.file_type?.startsWith('image/') && (
                                  <img
                                    src={repliedMessage.file_url}
                                    alt="replied preview"
                                    className="quoted-reply-image"
                                  />
                                )}
                              <span className="quoted-text">
                                {repliedMessage
                                  ? getReplyToTextValue(repliedMessage)
                                  : msg.reply_to_text}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Render Attachments */}
                        {msg.file_url && (
                          <div className="message-attachment">
                            {msg.file_type?.startsWith('image/') ? (
                              <img
                                src={msg.file_url}
                                alt="Birma rasm"
                                className="attachment-image"
                                onClick={(e) => {
                                  if (isSelectMode) return
                                  e.stopPropagation()
                                  setViewerImage(msg.file_url!)
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            ) : msg.file_type?.startsWith('audio/') ? (
                              <audio
                                controls
                                src={msg.file_url}
                                className="attachment-audio"
                                onClick={(e) => {
                                  if (isSelectMode) e.stopPropagation()
                                }}
                              />
                            ) : (
                              <a
                                href={msg.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="attachment-file-btn"
                                onClick={(e) => {
                                  if (isSelectMode) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleToggleMessageSelection(msg.id)
                                  }
                                }}
                              >
                                📎 {msg.file_name}
                              </a>
                            )}
                          </div>
                        )}

                        {msg.text && <p className="message-text-content">{renderTextWithLinks(msg.text)}</p>}
                      </div>

                      <div className="message-meta-row">
                        <span className="message-time">
                          {formatTime(msg.created_at)}
                          {msg.is_edited && <span className="edited-tag"> (tahrirlangan)</span>}
                        </span>

                        {!isSelectMode && (
                          <div className="action-buttons">
                            {msg.text && (
                              <button
                                className="action-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(msg.id, msg.text)
                                }}
                                title="Nusxalash"
                              >
                                {copiedMessageId === msg.id ? <CheckIcon /> : <CopyIcon />}
                              </button>
                            )}
                            <button
                              className="action-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                setReplyingTo(msg)
                              }}
                              title="Javob berish"
                            >
                              <ReplyIcon />
                            </button>
                            {isOutgoing && (
                              <button
                                className="action-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditClick(msg)
                                }}
                                title="Tahrirlash"
                              >
                                <EditIcon />
                              </button>
                            )}
                            {(isOutgoing || isAdminUser(username, adminsList)) && (
                              <button
                                className="action-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteMessage(msg.id)
                                }}
                                title="O'chirish"
                              >
                                <TrashIcon />
                              </button>
                            )}
                            {isAdminUser(username, adminsList) && !isOutgoing && (
                              <button
                                className="action-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBlockUser(msg.sender_name)
                                }}
                                title="Bloklash"
                              >
                                <BanIcon />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Contexts */}
        <div className="input-area-container">
          {isSending && (
            <div className="sending-overlay">
              <div className="spinner-small"></div>
              <span>Yuklanmoqda...</span>
            </div>
          )}

          {editingMessage && (
            <div className="replying-context editing-context">
              <div className="replying-info">
                <EditIcon />
                <span className="replying-name">Xabarni tahrirlash</span>
              </div>
              <button
                className="close-reply-btn"
                onClick={() => {
                  setEditingMessage(null)
                  setNewMessage('')
                }}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          {replyingTo && !editingMessage && (
            <div className="replying-context">
              <div className="replying-info">
                <ReplyIcon />
                <div className="replying-content-wrapper">
                  <span className="replying-name">
                    Javob qaytarilmoqda: {replyingTo.sender_name}
                  </span>
                  <div className="replying-content-flex">
                    {replyingTo.file_url && replyingTo.file_type?.startsWith('image/') && (
                      <img
                        src={replyingTo.file_url}
                        alt="reply preview"
                        className="replying-image-preview"
                      />
                    )}
                    <span className="replying-text">{getReplyToTextValue(replyingTo) || ''}</span>
                  </div>
                </div>
              </div>
              <button className="close-reply-btn" onClick={() => setReplyingTo(null)} type="button">
                <CloseIcon />
              </button>
            </div>
          )}

          {selectedFile && !editingMessage && (
            <div className="file-preview-context">
              <PaperclipIcon />
              <span className="file-preview-name">{selectedFile.name}</span>
              <button
                className="close-reply-btn"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="input-bar">
            {!editingMessage && (
              <>
                <button
                  type="button"
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                  title="Fayl yuklash"
                >
                  <PaperclipIcon />
                </button>
                <button
                  type="button"
                  className="attach-btn"
                  onClick={() => setShowCodeModal(true)}
                  disabled={isSending}
                  title="Kod formatida yozish"
                >
                  <CodeIcon />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.js,.ts,.py,.txt,.html,.css,.json,.md,.cpp,.c,.java"
                  style={{ display: 'none' }}
                />
              </>
            )}

            <input
              type="text"
              placeholder={
                isSupabaseConfigured
                  ? editingMessage
                    ? 'Tahrirlash...'
                    : 'Xabaringizni yozing...'
                  : 'Ulanish kutilmoqda...'
              }
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                if (typingChannelRef.current) {
                  typingChannelRef.current
                    .send({
                      type: 'broadcast',
                      event: 'typing',
                      payload: { user: username, isTyping: true },
                    })
                    .catch(() => {})
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                  typingTimeoutRef.current = setTimeout(() => {
                    typingChannelRef.current
                      .send({
                        type: 'broadcast',
                        event: 'typing',
                        payload: { user: username, isTyping: false },
                      })
                      .catch(() => {})
                  }, 2000)
                }
              }}
              disabled={!isSupabaseConfigured || isSending}
              className="chat-input"
              autoFocus={!!editingMessage}
            />

            <button
              type="submit"
              disabled={
                !isSupabaseConfigured || (!newMessage.trim() && !selectedFile) || isSending
              }
              className="send-button"
            >
              {isSending ? '...' : editingMessage ? 'Saqlash' : 'Yuborish'}
            </button>
          </form>
        </div>
      </>
    )}
  </div>
      <footer className="app-footer">
        <span>
          Yaratuvchi: <strong>Hayrulloh Abdusamadov</strong>
        </span>
        <span className="footer-separator">•</span>
        <span>
          Telegram kanal:{' '}
          <a href="https://t.me/HayrullohAdusamadov" target="_blank" rel="noreferrer">
            @HayrullohAdusamadov
          </a>
        </span>
      </footer>

      {viewerImage && (
        <div className="image-viewer-overlay" onClick={() => setViewerImage(null)}>
          <button className="viewer-close-btn" onClick={() => setViewerImage(null)}>
            <CloseIcon />
          </button>

          <a
            href={viewerImage}
            download="Habarnoma_rasm"
            className="viewer-download-btn"
            onClick={(e) => e.stopPropagation()}
          >
            Yuklab olish
          </a>

          <img
            src={viewerImage}
            alt="Kattalashtirilgan rasm"
            className="viewer-image-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-effect" style={{ borderColor: '#ef4444' }}>
            <div className="modal-logo" style={{ color: '#ef4444' }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <h2 className="modal-title" style={{ color: '#ef4444', marginBottom: '1rem' }}>
              Chiqasizmi?
            </h2>
            <p className="modal-subtitle" style={{ marginBottom: '2rem' }}>
              Haqiqatan ham ushbu chatdan chiqib ketmoqchimisiz?
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <button
                className="modal-button"
                style={{ flex: 1, backgroundColor: '#4b5563' }}
                onClick={() => setShowLogoutModal(false)}
              >
                Yo'q
              </button>
              <button
                className="modal-button"
                style={{ flex: 1, backgroundColor: '#ef4444' }}
                onClick={() => {
                  setShowLogoutModal(false)
                  signOut({ callbackUrl: '/' })
                }}
              >
                Ha
              </button>
            </div>
          </div>
        </div>
      )}

      {showCodeModal && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-effect"
            style={{ maxWidth: '600px', borderColor: 'var(--color-primary)' }}
          >
            <h2 className="modal-title" style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
              Kod Yozish
            </h2>
            <div className="modal-form">
              <div className="modal-input-group">
                <label className="modal-label">Dasturlash tili (ixtiyoriy)</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="masalan: javascript, python, html..."
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                />
              </div>
              <div className="modal-input-group">
                <label className="modal-label">Kodni kiriting</label>
                <textarea
                  className="modal-input"
                  style={{ minHeight: '200px', fontFamily: 'monospace', resize: 'vertical' }}
                  placeholder="Kodni shu yerga joylashtiring..."
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                width: '100%',
                marginTop: '1.5rem',
              }}
            >
              <button
                className="modal-button"
                style={{ flex: 1, backgroundColor: '#4b5563' }}
                onClick={() => {
                  setShowCodeModal(false)
                  setCodeSnippet('')
                  setCodeLanguage('')
                }}
              >
                Bekor qilish
              </button>
              <button
                className="modal-button"
                style={{ flex: 1 }}
                onClick={() => {
                  if (codeSnippet.trim()) {
                    const formattedCode = `\`\`\`${codeLanguage.trim()}\n${codeSnippet}\n\`\`\``
                    setNewMessage((prev) => prev + (prev ? '\n' : '') + formattedCode)
                  }
                  setShowCodeModal(false)
                  setCodeSnippet('')
                  setCodeLanguage('')
                }}
              >
                Xabarga qo'shish
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstallAlert && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-effect"
            style={{
              borderColor: 'var(--color-primary)',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <div className="modal-logo" style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: '0 auto' }}
              >
                <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h2 className="modal-title" style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
              O'rnatish imkoni yo'q
            </h2>
            <p className="modal-subtitle" style={{ marginBottom: '2rem' }}>
              Avtomatik o'rnatish imkoni topilmadi. Iltimos, brauzer menyusidan{' '}
              <strong>&apos;O&apos;rnatish&apos; (Install)</strong> yoki{' '}
              <strong>&apos;Bosh ekranga qo&apos;shish&apos; (Add to Home screen)</strong> ni tanlang.
            </p>
            <button
              className="modal-button"
              style={{ width: '100%', backgroundColor: 'var(--color-primary)' }}
              onClick={() => setShowInstallAlert(false)}
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
