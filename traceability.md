| Requirement | Implementation | Verification |
|---|---|---|
| 兩關 | `main.gd` `level` 與 `question_data` | 啟動後完成第一題才進入第二題 |
| 每關互動解題 | 理財互動站 + `interact` + `_answer_pressed` | 走近站點按 E，三選一題目出現 |
| 通過取得 KEY | `keys += 1` 僅在正確答案分支 | 答錯不增加 KEY，答對顯示取得 KEY |
| 每關得分 | `score += 50`、答錯 `score - 10`、HUD 更新 | 頂部顯示分數與 KEY |
| 最終進步成果 | `_show_results()` | 第二關答對後顯示總結 |
| Blender 3D 資產 | `blender/create_village_props.py` 輸出 `assets/village_props.glb` | GLB 檔案存在且由 Blender 產出 |
