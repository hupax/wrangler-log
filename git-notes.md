# Git 常用命令速查笔记

本笔记整理了 Git 日常使用中常用的命令和概念，帮助你更高效地进行版本控制。

## 1. 项目的获取与克隆

*   **`git clone <repository_url>`**
    *   **作用：** 将远程仓库克隆到本地。这是开始一个新项目或加入现有项目的第一步。
    *   **示例：** `git clone https://github.com/your-username/your-repo.git`

## 2. 远程仓库管理

*   **`git remote -v`**
    *   **作用：** 查看当前项目配置的所有远程仓库。通常会显示名为 `origin` 的远程仓库的 fetch (拉取) 和 push (推送) 地址。
    *   **输出示例：**
        ```
        origin  https://github.com/user/repo.git (fetch)
        origin  https://github.com/user/repo.git (push)
        ```
*   **`git remote set-url <remote_name> <new_url>`**
    *   **作用：** 修改指定远程仓库的 URL 地址。这在你需要更改远程仓库源（如仓库迁移）时非常有用。
    *   **示例：** `git remote set-url origin https://github.com/new-user/new-repo.git`