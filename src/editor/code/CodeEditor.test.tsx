import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { Provider as JotaiProvider, createStore } from 'jotai'
import { CodeEditor } from './CodeEditor'
import { nodesAtom, edgesAtom } from '../../flowchart'

// Test doubles
const createTestStore = () => createStore()

describe('CodeEditor', () => {
  describe('初期表示', () => {
    test('Mermaid Codeのタイトルが表示される', () => {
      const store = createTestStore()
      
      render(
        <JotaiProvider store={store}>
          <CodeEditor />
        </JotaiProvider>
      )

      expect(screen.getByText('Mermaid Code')).toBeTruthy()
    })

    test('テキストエリアが表示される', () => {
      const store = createTestStore()
      
      render(
        <JotaiProvider store={store}>
          <CodeEditor />
        </JotaiProvider>
      )

      expect(screen.getByRole('textbox')).toBeTruthy()
    })

    test('プレースホルダーテキストが表示される', () => {
      const store = createTestStore()
      
      render(
        <JotaiProvider store={store}>
          <CodeEditor />
        </JotaiProvider>
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.placeholder).toContain('flowchart TD')
    })
  })

  describe('コード編集', () => {
    test('テキストエリアに入力できる', () => {
      const store = createTestStore()
      
      render(
        <JotaiProvider store={store}>
          <CodeEditor />
        </JotaiProvider>
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      // まずフォーカスして編集モードにする
      fireEvent.focus(textarea)
      
      fireEvent.change(textarea, { 
        target: { value: 'flowchart TD\n    A --> B' } 
      })

      expect(textarea.value).toBe('flowchart TD\n    A --> B')
    })
  })

  describe('エラー表示', () => {
    test('無効なMermaidコードを入力するとエラーが表示される', async () => {
      const store = createTestStore()
      
      render(
        <JotaiProvider store={store}>
          <CodeEditor />
        </JotaiProvider>
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { 
        target: { value: 'invalid code' } 
      })

      await waitFor(() => {
        expect(screen.getByText(/Invalid syntax/)).toBeTruthy()
      })
    })

    test('有効なMermaidコードを入力するとエラーが表示されない', async () => {
      const store = createTestStore()
      
      render(
        <JotaiProvider store={store}>
          <CodeEditor />
        </JotaiProvider>
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { 
        target: { value: 'flowchart TD\n    A[Start] --> B[End]' } 
      })

      await waitFor(() => {
        expect(screen.queryByText(/Invalid syntax/)).toBeFalsy()
      })
    })
  })

  describe('双方向同期', () => {
    test('mermaidCodeAtomの値がテキストエリアに反映される', () => {
      const store = createTestStore()
      // 事前にノードとエッジを設定してmermaidCodeを生成
      store.set(nodesAtom, [
        { id: 'X', type: 'rectangle', parentId: undefined, childIds: [], position: { x: 0, y: 0 }, data: { label: 'X' } },
        { id: 'Y', type: 'rectangle', parentId: undefined, childIds: [], position: { x: 100, y: 0 }, data: { label: 'Y' } }
      ])
      store.set(edgesAtom, [
        { id: 'edge1', source: 'X', target: 'Y', type: 'normal-arrow', data: undefined }
      ])
      
      render(
        <JotaiProvider store={store}>
          <CodeEditor />
        </JotaiProvider>
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toContain('flowchart TB')
      expect(textarea.value).toContain('X --> Y')
    })

    test('有効なコードを入力するとパースが実行される', async () => {
      const store = createTestStore()
      
      render(
        <JotaiProvider store={store}>
          <CodeEditor />
        </JotaiProvider>
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.focus(textarea) // 編集モードにする
      fireEvent.change(textarea, { 
        target: { value: 'flowchart TD\n    A[Start] --> B[End]' } 
      })

      // パースが成功していればエラーが表示されない
      expect(screen.queryByText(/Invalid syntax/)).toBeFalsy()
    })
  })
})