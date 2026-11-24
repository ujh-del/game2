# 心動小鎮：小小理財家

Godot 4 教育遊戲原型，使用繁體中文，主題是生活理財投資。

## 開啟

1. 安裝 Godot 4.x。
2. 在 Godot Project Manager 匯入本資料夾（`project.godot`）。
3. 按 Play。
4. 使用 WASD／方向鍵移動，走近紅色「理財互動站」後按 E。

## 遊戲流程

- 第一關：計算 20 - 12 的剩餘金額。
- 第二關：辨識保留資金與投資風險。
- 答對：+50 分並取得 KEY。
- 答錯：-10 分並顯示提示，可重新作答。
- 第二關完成：顯示總分、KEY 數量與三項進步成果。

## Blender

`blender/create_village_props.py` 是可重跑的資產產生腳本，已用 Blender 5.3 產出：

- `assets/heart_town_props.blend`
- `assets/village_props.glb`

## 目前環境限制

本機沒有 `C:\Godot` 或 `C:\blender` 資料夾，也沒有找到 Godot 執行檔；實際找到的 Blender 是 `C:\Program Files\Blender Foundation\Blender 5.3\blender.exe`。因此目前已完成可匯入 Godot 的專案原始碼與資產，但尚未能在本機啟動 Godot 做遊戲內執行測試。

## GitHub Pages 部署

推送到 `main` 後，GitHub Actions 會將 `web/` 發布到 `gh-pages` 分支。

第一次請到 GitHub 儲存庫的 **Settings → Pages**：

1. Source 選擇 **Deploy from a branch**。
2. Branch 選擇 `gh-pages`，資料夾選 `/ (root)`。
3. 儲存後，網站網址為：`https://ujh-del.github.io/game2/`

若使用 GitHub Pages 的 Actions 模式，也可以改回官方 Pages workflow；目前採用分支模式是為了不要求儲存庫事先啟用 Pages API。
