#!/bin/bash

echo "🌴 椰子怪討伐戰 2.0 正在啟動..."

# 檢查系統是否有安裝 node
if ! command -v node &> /dev/null
then
    echo "錯誤：找不到 Node.js！請確認伺服器已安裝 Node.js"
    echo "安裝指令參考：sudo apt install nodejs (Ubuntu/Debian)"
    exit 1
fi

node server.js
