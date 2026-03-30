import { UserButton } from '@clerk/clerk-react'

export default function TopBar() {
  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-end px-6">
      {/*
        UserButton — Clerk 內建的用戶頭像按鈕
        點擊後顯示：管理帳號 / 登出
        完全不需要自己寫登出邏輯
      */}
      <UserButton afterSignOutUrl="/" />
    </header>
  )
}
