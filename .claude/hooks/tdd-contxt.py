#!/usr/bin/env python3
import json
import sys

# stdin（Claude Codeからのイベント入力）を読むが、
# 今回は単に固定の追加コンテキストを出すだけでもOK
try:
    _ = json.load(sys.stdin)
except Exception:
    # 入力の有無に依らず続行（堅牢性のため）
    pass

# 追加したい文言（自由に拡張可）
additional = """\
[追加コンテキスト]
実装は t-wada スタイルの TDD で行うこと。
- レッド -> グリーン -> リファクタリング の小さなサイクルを厳守
- 最小の例から始めて、仮実装・三角測量を適宜活用
- 明確で読みやすいテスト名・振る舞い記述を重視
- 重複の除去と設計の洗練を継続的に行う
"""

# 方法1: UserPromptSubmitの特例として、stdoutに文字列を出すだけで追加される
print(additional)
sys.exit(0)

# 方法2（高度制御が必要ならこちら）:
# print(json.dumps({
#   "hookSpecificOutput": {
#     "hookEventName": "UserPromptSubmit",
#     "additionalContext": additional
#   }
# }))
# sys.exit(0)
