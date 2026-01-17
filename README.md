# 我死了吗？（死亡契约 / Dead Man's Switch on Monad）

一个部署在 **Monad Testnet** 的“死亡开关”DApp：你存入遗产（MON），必须定期“签到证明活着”。一旦超时未签到，任何人都可以触发“宣告死亡”，遗产将自动转给你设置的继承人，同时铸造一枚墓碑 NFT 记录你的遗言。

## 项目信息填写提示（提交前必看）

目标：提交前请确认**必填项**和**文档规范**完善，避免审核往返。

### 必填信息（带 * 必填）

- **项目名称***：建议使用中文（更好记，投票更容易被记住）
- **前端演示地址***：必须可直接访问
- **GitHub 仓库***：保持公开，评审可验证
- **关联活动***：填写你报名/参加的活动名称或链接
- **项目 Logo**：上传 1 个清晰 Logo（建议 1:1）
- **核心截图**：至少 1 张能展示核心功能（注册/设置继承人/追加遗产/分享链接）
- **项目描述**：要写清定位/亮点/使用场景，不能敷衍或直接粘贴格式混乱的内容（这也是评分项）

### 提交前检查清单（Checklist）

- [ ] 演示地址可打开（无 404/无空白页）
- [ ] GitHub 仓库公开，README 完整
- [ ] Logo + 截图已上传
- [ ] `.env` / 私钥未提交到仓库
- [ ] 合约地址与链信息在 README 中可查

## 演示地址 / GitHub

- **Demo（Netlify）**：https://wosilema.netlify.app
- **GitHub**：https://github.com/new4u/wosilema

## 链信息（Monad 化）

- **Network**：Monad Testnet
- **Chain ID**：10143
- **RPC**：https://testnet-rpc.monad.xyz
- **Explorer**：https://testnet.monadexplorer.com
- **合约地址（AmIDeadYet）**：`0x554A40E5866012Bf666654c9eE49BE5634735c52`
- **计价单位**：UI 全部用 **MON**（Monad 原生币）

## 一眼看懂的架构（ASCII）

```
┌──────────────┐     window.ethereum / ethers v6      ┌──────────────────────┐
│ React + Vite  │ ───────────────────────────────────> │ AmIDeadYet.sol        │
│ UI (Status/UI)│                                      │ Monad Testnet         │
└──────┬───────┘                                      └─────────┬────────────┘
       │                                                        │
       │ 分享链接: /?heir=0x...                                 │ users(address)
       v                                                        v
┌──────────────────┐                                  ┌──────────────────────┐
│ Heir 自动预填输入框 │                                  │ register/checkIn/...  │
└──────────────────┘                                  └──────────────────────┘
```

## 核心功能

- **注册/存入遗产**：`register(lastWords)`（payable）
- **签到续命**：`checkIn()`
- **设置继承人**：`setHeir(address)`
- **追加遗产**：`addToEstate()`（payable）
- **宣告死亡**：`declareDeath(address)`（超时后可被任何人触发）
- **墓碑 NFT**：死亡时铸造，并把遗言写进 tokenURI（简化版）
- **分享继承人地址**：生成 `/?heir=0x...`，支持复制链接 + 分享到 X/Facebook

## 本地安装与运行

```bash
npm install
npm run dev
```

### 前端环境变量（根目录 `.env.local`）

```bash
VITE_CONTRACT_ADDRESS=0x554A40E5866012Bf666654c9eE49BE5634735c52
VITE_CHAIN_ID=10143
VITE_RPC_URL=https://testnet-rpc.monad.xyz
VITE_EXPLORER_URL=https://testnet.monadexplorer.com
```

## 合约部署（smart-contract）

```bash
cd smart-contract
npm install
npm run deploy:monad
```

说明：部署需要 `smart-contract/.env`（不要提交到 GitHub）：

```bash
PRIVATE_KEY=（64位 hex，不要带 0x）
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
```

## 构建与部署（Netlify）

```bash
npm run build
npm run deploy
```

## README 规范（评审友好）

README 必须包含：

- **项目概述**（是什么/解决什么问题）
- **安装/运行步骤**（如何在本地跑起来）
- **主要功能或技术栈**（React/Vite/ethers/Monad 等）

如有：演示账号、部署方式或许可证信息，也请在 README 中写明并保持更新。
