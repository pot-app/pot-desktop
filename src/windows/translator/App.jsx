import React from 'react'
import TopBar from './components/TopBar';
import SourceArea from './components/SourceArea';
import LanguageSelector from './components/LanguageSelector';
import TargetArea from './components/TargetArea';

export default function App() {
  return (
    <>
      <TopBar />
      <SourceArea />
      <LanguageSelector />
      <TargetArea />
    </>
  )
}
