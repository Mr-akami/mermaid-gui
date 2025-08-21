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
実装は t-wada スタイルの TDD で行うこと。useEffecはマウント・アンマウントの処理のために使う、変更を検知させる場合はatomを使うこと。
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
