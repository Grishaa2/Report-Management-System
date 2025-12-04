'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}/*************  ✨ Windsurf Command ⭐  *************/
/*******  fd0851c7-9dce-4dcc-b116-2efb1a3bed87  *******//**

 * ThemeProvider is a wrapper around NextThemesProvider that allows
 * for easy theme management using the next-themes library.
 *
 * @param {React.ReactNode} children - The components that will have access to the theme context.
 * @param {ThemeProviderProps} props - Additional props that are passed to the NextThemesProvider.
 */

