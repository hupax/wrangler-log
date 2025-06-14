---
title: 'Caddy：懒人的 HTTPS 神器'
date: '2024-12-28'
description:
  '厌倦了配置 Nginx 的繁琐步骤？试试 Caddy 吧！自动申请、续签 HTTPS
  证书，简单到哭！'
tags: ['Caddy', 'HTTPS', 'Web服务器', "Let's Encrypt"]
---

# Caddy：懒人的 HTTPS 神器

> 厌倦了配置 Nginx 的繁琐步骤？试试 Caddy 吧！自动申请、续签 HTTPS 证书，简单到
> 哭！

## 为什么选择 Caddy？

Caddy 是一个现代化的 Web 服务器，用 Go 语言编写，最大特点是**自动化 HTTPS**。与
传统的 Nginx 相比，它有这些优势：

- **配置超简单**：几乎零配置就能启用 HTTPS
- **自动申请证书**：告别手动申请、续签 Let's Encrypt 证书的烦恼
- **自动重定向**：HTTP 自动跳转到 HTTPS
- **语法友好**：配置文件比 Nginx 更易读易写
- **现代化安全**：默认采用最新的 TLS 1.3 协议

当然，老牌的 Nginx 在极端高并发场景下性能略胜一筹。但对于大多数个人和中小型项目
，Caddy 的便利性完全可以碾压这点性能差异！

## 安装配置步骤

让我们一步步安装并配置 Caddy：

### 1. 安装 Caddy

```bash
# 如果你使用 Ubuntu/Debian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt install caddy

# 检查是否安装成功
caddy version
```

### 2. 检查 Caddy 状态

```bash
# 检查 Caddy 服务状态（Caddy 默认占用 80 和 443 端口）
sudo systemctl status caddy
```

### 3. 准备你的域名

1. 注册一个域名（如果还没有的话）
2. 在域名控制面板中添加 A 记录，指向你的服务器 IP
3. **重要提示**：如果使用 Cloudflare，请将代理状态关闭（只做 DNS 解析，不通过
   Cloudflare 代理）

### 4. 准备网站文件

```bash
# 创建或进入网站目录
cd /var/www/html

# 创建一个测试页面
echo "<h1>Caddy 成功运行了！</h1>" > index.html
```

### 5. 配置 Caddy

```bash
# 编辑 Caddy 配置文件
sudo nano /etc/caddy/Caddyfile
```

将默认配置替换为：

```
your-domain.com {
    root * /var/www/html
    file_server
}
```

替换 `your-domain.com` 为你的实际域名。

### 6. 重新加载配置

```bash
sudo systemctl reload caddy
```

就这么简单！现在访问你的域名，应该能看到带有 HTTPS 的安全网站了！

## 配置多域名支持

想让你的 Caddy 服务器支持多个域名？轻而易举：

```
your-first-domain.com {
    root * /var/www/site1
    file_server
}

your-second-domain.com {
    root * /var/www/site2
    file_server
}
```

保存配置文件并重新加载 Caddy：

```bash
sudo systemctl reload caddy
```

Caddy 会自动为所有域名申请并配置 HTTPS 证书。不需要额外的配置！

## 配置 IP 到域名的重定向

当用户直接访问你的服务器 IP 时，你可能希望将他们重定向到你的域名：

```
# 添加以下配置到 Caddyfile
your-server-ip:80, your-server-ip:443 {
    redir https://your-domain.com{uri}
}
```

这样，访问 IP 的用户会自动被重定向到你的域名，并且会保留原来请求的路径。

保存并重新加载配置：

```bash
sudo systemctl reload caddy
```

## 进阶技巧与常见问题

### 反向代理配置

如果你需要将请求转发到后端服务（如 Node.js、Python 等应用）：

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

这会将所有请求转发到本地的 3000 端口。

### 自定义错误页面

```
your-domain.com {
    root * /var/www/html
    file_server
    handle_errors {
        rewrite * /error.html
    }
}
```

### SSL 证书位置

Caddy 自动获取的证书默认存储在：

```
/var/lib/caddy/.local/share/caddy/certificates/
```

### 常见问题排查

1. **证书申请失败**：确保域名正确解析到服务器，且 80/443 端口开放
2. **权限问题**：确保 Caddy 对网站目录有读取权限
3. **端口冲突**：检查 80/443 端口是否被其他程序占用

```bash
# 检查端口占用
sudo lsof -i :80
sudo lsof -i :443
```

## Caddy vs Nginx：如何选择？

| 特性       | Caddy                | Nginx                  |
| ---------- | -------------------- | ---------------------- |
| 自动 HTTPS | ✅ 原生支持          | ❌ 需要额外配置        |
| 配置复杂度 | 简单                 | 较复杂                 |
| 性能       | 好                   | 极高并发场景下更好     |
| 内存占用   | 较高                 | 较低                   |
| 社区支持   | 较新但活跃           | 成熟且广泛             |
| 适用场景   | 个人项目、中小型网站 | 大型项目、极高流量场景 |

### 何时选择 Caddy？

- 想要简单快速地配置 HTTPS
- 不想处理证书更新的烦恼
- 项目规模较小或中等
- 更注重开发效率而非极致性能

### 何时选择 Nginx？

- 需要处理极高并发
- 对内存占用有严格限制
- 需要复杂的负载均衡配置
- 已有成熟的 Nginx 配置和经验

---

> **小贴士**：不确定哪个更适合你？从 Caddy 开始尝试！如果后期确实遇到性能瓶颈，
> 再考虑迁移到 Nginx 也不迟。大多数项目都不会达到需要为了性能牺牲便利性的程度！
