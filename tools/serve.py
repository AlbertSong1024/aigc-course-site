#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""课程教程站 · 本地预览服务器（禁用缓存版）

用法：
    python tools/serve.py            # 默认 8806
    python tools/serve.py 9000       # 指定端口

为什么不直接用 `python -m http.server`：
    默认服务器会带上 Last-Modified，浏览器据此缓存 course-map.js / site.js。
    改了数据源之后刷新页面，浏览器可能仍用旧缓存，典型症状是
    「新课明明做完了，侧栏里那几课还是点不动」——白白排查半天。

    本脚本给所有响应加 no-store 头，刷新生效，从根上避免这种误判。
    只用标准库，无需 pip install。

判断当前拿到的是不是最新数据，看页面**页脚**：
    「已上线 5 / 27 课 · 资料版本 2026-09-17」——数字对得上就是最新的。
"""
import http.server
import os
import socketserver
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # 静默，不刷屏


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8806
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)

    socketserver.TCPServer.allow_reuse_address = True
    try:
        httpd = socketserver.TCPServer(("127.0.0.1", port), NoCacheHandler)
    except OSError as e:
        print("端口 %d 启动失败：%s" % (port, e))
        print("可能已有服务在跑。换一个端口，例如：python tools/serve.py 8807")
        return 1

    print("课程教程站已启动：http://127.0.0.1:%d/" % port)
    print("根目录：%s" % root)
    print("已禁用缓存（Cache-Control: no-store）——改了文件刷新即生效。")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
