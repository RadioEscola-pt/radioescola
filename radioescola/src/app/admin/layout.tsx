import ContextProvider, { useAdminContext } from "./context"

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    
    return (
    <>
        <ContextProvider>
            {children}
        </ContextProvider>
    </>
    )
  }