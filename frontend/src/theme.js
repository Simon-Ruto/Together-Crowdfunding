import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }){
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  },[theme])
  return React.createElement(ThemeContext.Provider, { value: { theme, setTheme } }, children)
}

export function useTheme(){ return useContext(ThemeContext) }

// default export for compatibility
export default ThemeProvider
