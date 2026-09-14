import { Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { AdminPage } from '../pages/AdminPage'
import { CreatePostPage } from '../pages/CreatePostPage'
import { EditPostPage } from '../pages/EditPostPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PostDetailPage } from '../pages/PostDetailPage'

function AppShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/posts/new" element={<CreatePostPage />} />
          <Route path="/admin/posts/:postId/edit" element={<EditPostPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
