'use client'
import React from 'react'
import { QueryClientProvider,QueryClient } from '@tanstack/react-query'

//wrapping our application with react query
type Props = {
    children:React.ReactNode
}

const queryClient = new QueryClient();

const Providers = ({children}: Props) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default Providers