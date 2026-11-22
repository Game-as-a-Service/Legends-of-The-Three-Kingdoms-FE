# 專案操作偏好

## GitHub

- 此專案的 GitHub 操作一律透過 GitHub CLI（`gh` 或 `gh api`），包含查詢 PR／issue、檢查 CI、留言、建立或修改 PR，以及更新遠端分支。
- 不使用 GitHub MCP、GitKraken MCP 或其他工具替代 `gh` 操作 GitHub。若 `gh` 不可用或權限不足，明確回報並請使用者決定，不自行改用其他方式。
- 純本機的 Git 操作（查看狀態、建立分支、提交等）仍可使用 `git`。
- `gh` 沒有 `push` 子命令，不要虛構 `gh push`。若遠端傳輸無法透過 `gh api` 完成而需要使用 `git push`，先說明限制並取得使用者同意。
- macOS 若 PATH 中找不到 `gh`，先檢查 `/opt/homebrew/bin/gh`，不要直接判定未安裝或自行安裝。
