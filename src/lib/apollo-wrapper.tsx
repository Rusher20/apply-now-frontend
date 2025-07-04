"use client"

import type React from "react"

import { ApolloProvider } from "@apollo/client"
import client from "./apolloClient"

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
