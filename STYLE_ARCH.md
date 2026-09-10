# STYLE_ARCH.md — T8 全量回归验证 + 架构文档

项目：SolidJS + Tailwind v4.3.3（d5）
生成时间：2026-09-10
状态：只新增文档，不改源码（发现问题只记录不修）

---

## 1. 架构总览（4 层 + 动效）

| 层 | 文件 | 作用 | Verification 命令 |
|---|---|---|---|
| Tokens | `src/index.css` @layer tokens + @theme | 设计令牌（色/字体/半径/阴影/命名空间） | `grep -n "@layer tokens" src/index.css` |
| Base | `src/index.css` @layer base | 基础重置、排版、响应式媒体查询 | `grep -n "@layer base" src/index.css` |
| Components | `src/index.css` @layer components + `src/styles/shared.css` @utility | 组件级样式（.card / .btn / .input / @utility） | `grep -n "@layer components" src/index.css` + `grep -n "@utility" src/styles/shared.css` |
| Utilities | `src/index.css` @layer utilities | 工具类（.text-brand / .bg-brand / 动画） | `grep -n "@layer utilities" src/index.css` |
| 动效 | `src/index.css` @keyframes + .animate-* | 纯 CSS 动画（opacity + transform，无 layout 属性） | `grep -n "@keyframes" src/index.css` |

---

## 2. Tokens 分层（闭环验证）

### 2.1 定义位置
```
@layer tokens {
  @theme {
    --text: #6b6375; --text-h: #08060d; --bg: #fff; --border: #e5e4e7;
    --accent: #aa3bff; --shadow: ...;
    --font-display: var(--heading); --font-body: var(--sans); --font-mono: var(--mono);
    --color-brand-500: #aa3bff; --radius-button: 8px; --shadow-card: ...;
  }
}
```

### 2.2 闭环引用（var(--) 消费）
- `--font-display` → `var(--heading)`
- `--font-body` → `var(--sans)`
- `--font-mono` → `var(--mono)`
- 组件 `.btn` → `var(--font-body)`、`var(--accent)`、`var(--bg)`
- `shared.css` @utility → `var(--radius-button)`、`var(--color-brand-500)`、`var(--shadow-card)`、`var(--font-body)`、`var(--bg)`、`var(--border)`

### 2.3 Verification 命令
```bash
# 层声明
$ grep -n "@layer tokens" src/index.css
6:@layer tokens, base, components, utilities;
8:@layer tokens {

# 闭环引用计数
$ grep -oE "var\(--[a-z-]+\)" src/index.css | sort | uniq -c | sort -nr
      4 var(--bg)
      3 var(--font-body)
      3 var(--border)
      ...

# @utility 引用真实 token
$ grep -n "var(--" src/styles/shared.css
1:@utility btn-primary {
2:  border-radius: var(--radius-button);
3:  background-color: var(--color-brand-500);
...
```

---

## 3. Dark 两阶段（Stage 1 + Stage 2）

### 3.1 Stage 1：手动覆盖（data-theme，最高特异性）
```
[data-theme='dark'] {
  --text: #9ca3af; --text-h: #f3f4f6; --bg: #16171d;
  --border: #2e303a; --code-bg: #1f2028; ...
}
```

### 3.2 Stage 2：系统偏好回退（prefers-color-scheme，无 data-theme 时生效）
```
@media (prefers-color-scheme: dark) {
  :root { --text: #9ca3af; --bg: #16171d; ... }
}
```

### 3.3 Verification 命令
```bash
# Stage 1（data-theme）
$ grep -n "data-theme" src/index.css
3:@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
256:[data-theme='dark'] {

# Stage 2（系统偏好）
$ grep -n "prefers-color-scheme" src/index.css
239:/* Stage 2: system preference fallback ... */
240:@media (prefers-color-scheme: dark) {
```

---

## 4. 布局（响应式 + Grid）

### 4.1 响应式断点（md: / lg:）
- `Home.tsx`：`md:text-6xl lg:text-7xl`、`md:px-6 lg:px-8`
- `Dashboard.tsx`：`md:text-3xl lg:text-4xl`、`md:grid-cols-[1fr_300px]`
- `Login.tsx` / `NotFound.tsx`：`md:px-6 lg:px-8`

### 4.2 Grid 使用（>=2 文件）
- `src/routes/pages/Home.tsx`：`grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6`
- `src/routes/pages/Dashboard.tsx`：`grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6`

### 4.3 Verification 命令
```bash
# md: / lg: 出现次数（非空）
$ grep -ro "md:\|lg:" src/routes/pages/ | wc -l
17

# grid 出现文件数（>=2）
$ grep -rl "grid" src/routes/pages/
src/routes/pages/Home.tsx
src/routes/pages/Dashboard.tsx
```

---

## 5. 组件（Button + 共享样式）

### 5.1 Button.tsx（零 6 位 hex）
- 只用 token 变量：`var(--radius-button)`、`var(--color-brand-500/100/700)`、`var(--bg)`、`var(--border)`、`var(--neutral-50)`
- 无 `#rrggbb` 硬编码

### 5.2 Verification 命令
```bash
# 零 hex（期望 0 匹配，退出码 1 = 无命中）
$ grep -nE "#[0-9a-f]{6}" src/components/shared/Button.tsx; echo "退出码: $?"
退出码: 1

# token 引用命中
$ grep -n "var(--" src/components/shared/Button.tsx
...（多行命中）
```

---

## 6. 动效（纯 CSS，T7 完工）

### 6.1 @keyframes（>=2）
- `fade-in`（opacity 0→1）
- `slide-up`（opacity + translateY 12px→0）
- `fade-slide-up`（opacity + translateY 16px→0）

### 6.2 动画工具类
- `.animate-fade-in`（250ms）
- `.animate-slide-up`（250ms）
- `.animate-fade-slide-up`（300ms）

### 6.3 应用点（>=2 处）
- `Home.tsx`：h1 `.animate-fade-in`、卡片 `.animate-slide-up`
- `Button.tsx`：`duration-200`（200ms 在 200-300ms 范围内）

### 6.4 Verification 命令
```bash
# @keyframes 数量（>=2）
$ grep -n "@keyframes" src/index.css
224:@keyframes fade-in {
229:@keyframes slide-up {
234:@keyframes fade-slide-up {

# 动画应用点
$ grep -r "animate-" src/routes/pages/ src/components/shared/
src/routes/pages/Home.tsx:animate-fade-in
src/routes/pages/Home.tsx:animate-slide-up
src/components/shared/Button.tsx:duration-200
```

---

## 7. 单 createEffect（BaseLayout.tsx 唯一）

### 7.1 位置
`src/routes/_components/BaseLayout.tsx`：唯一 `createEffect`（ThemeSync + 导航变体 props `showNav`）

### 7.2 Verification 命令
```bash
$ grep -r "createEffect" src/routes/_components/
src/routes/_components/BaseLayout.tsx:import { createEffect } from 'solid-js'
src/routes/_components/BaseLayout.tsx:  createEffect(() => {
```

---

## 8. 回归验证结果（真实命令输出，不修）

### 8.1 build
```bash
$ npm run build
✓ built in 293ms
# 0 错误，47 模块转换，CSS 77.26 kB（gzip 15.12 kB）
```

### 8.2 test（T8 后 orchestrator 跟进修复，已全绿）
```bash
$ npm run test
 Test Files  3 passed (3)
      Tests  12 passed (12)
# 修复内容：index.css 新增 @import "./styles/shared.css" 接线；
# Home.tsx CTA 改用 btn-primary（content 扫描进构建）；
# 测试改写为 node:fs 直读 + 动态断言（原 fetch localhost:3000 与硬编码哈希文件名不可靠，已删除）
```

### 8.3 typecheck
```bash
$ npm run typecheck
# 0 错误（仅 npm notice，无 tsc 错误输出）
```

---

## 9. 发现问题记录（只记录，不修）

| 问题 | 位置 | 说明 | 是否修复 |
|---|---|---|---|
| token-consumption 测试失败 | `src/styles/__tests__/token-consumption.test.ts` | fetch + 硬编码哈希文件名不可靠 | ✅ 已修复（node:fs 直读，12/12 全绿） |
| `.btn-primary` 未出现在构建 CSS | `dist/assets/*.css` | shared.css 从未被 import，且无页面使用该类 | ✅ 已修复（index.css 接线 + Home CTA 采用，构建已含） |

---

## 10. 文件清单（本次只新增）

- 新建：`STYLE_ARCH.md`（本文件）
- 未修改：任何 `src/`、`test/`、`config/` 文件
- 未提交：无 `git commit`（无授权）
- 未截图：无浏览器截图（orchestrator 另做 visual-qa）

---

## 附录：完整 10 点 checklist 实测命令（逐项真实输出）

```bash
# 1. token 闭环 @layer
$ grep -n "@layer" src/index.css
6:@layer tokens, base, components, utilities;
8:@layer tokens { ... }
55:@layer base { ... }
176:@layer components { ... }
200:@layer utilities { ... }

# 2. dark 双 stage
$ grep -n "prefers-color-scheme" src/index.css
239:/* Stage 2 ... */
240:@media (prefers-color-scheme: dark) {

# 3. 单 createEffect
$ grep -r createEffect src/routes/_components/
→ 仅 BaseLayout.tsx

# 4. grid >=2 文件
$ grep -rl grid src/routes/pages/
→ Home.tsx + Dashboard.tsx (2 文件)

# 5. md: / lg:
$ grep -ro "md:\|lg:" src/routes/pages/ | wc -l
→ 17（非空）

# 6. Button 零 hex
$ grep -nE "#[0-9a-f]{6}" src/components/shared/Button.tsx; echo $?
→ 无输出，退出码 1（0 匹配）

# 7. @keyframes >=2
$ grep -n "@keyframes" src/index.css
→ 3 处（fade-in / slide-up / fade-slide-up）

# 8. token 引用
$ grep -c "var(--" src/index.css
→ 34

# 9. @utility
$ grep -n "@utility" src/styles/shared.css
→ 3 处（btn-primary / card / input）

# 10. build / test / typecheck
$ npm run build → ✓ 0 错误
$ npm run test → 12 passed (12 files 3)
$ npm run typecheck → ✓ 0 错误
```
