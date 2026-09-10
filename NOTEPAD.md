T4 完成记录 (2026-09-10)
- 新建 BaseLayout.tsx：唯一 ThemeSync createEffect + nav 变体 props (showNav)
- 删除 Layout.tsx / AuthLayout.tsx（重复消除）
- App.tsx：MainLayout → BaseLayout（默认 nav）；LoginLayout → BaseLayout(showNav=false)
- Token 替换：bg-white → bg-[var(--bg)]，dark:bg-[#16171d] → bg-[var(--bg)]/80，text-gray-600 → text-[var(--text)]，border-gray-200 → border-[var(--border)]
- data-theme 切换链（light/dark/system + matchMedia）行为不变
- i18n locale select + theme toggle + sticky nav 原样搬运
- Suspense/ErrorBoundary 行为不变
- grep createEffect 在 _components/ 仅1处（BaseLayout.tsx）
- build + typecheck 0 错误

T6 完成记录 (2026-09-10)
- 文件：src/components/shared/Button.tsx（唯一修改文件）
- 抽公共 base：inline-flex items-center justify-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none transition-colors（只写一次）
- variant 只写差异：primary 用 bg-[var(--color-brand-500)] / hover:bg-[var(--color-brand-100)] / active:bg-[var(--color-brand-700)] / dark:bg-[var(--color-brand-500)] / dark:text-[var(--bg)] / dark:hover:bg-[var(--color-brand-100)]；ghost 用 bg-transparent / border-[var(--border)] / hover:bg-[var(--neutral-50)] / dark:hover:bg-[var(--neutral-50)]/5 / dark:border-[var(--border)]
- 零 6 位 hex（grep 无命中）；token 变量命中：var(--radius-button)、var(--color-brand-500/100/700)、var(--bg)、var(--border)、var(--neutral-50)
- 保留 API：ButtonProps（variant?: 'primary' | 'ghost'）、ParentProps、splitProps、disabled/transition-colors 行为不变
- dark 变体只走 token（无具体色值如 indigo-400/gray-950/white/10 等）
- build + typecheck 0 错误

T7 完成记录 (2026-09-10) — 动效层 pure CSS (C)
- 文件：src/index.css（@layer utilities + 3 个 @keyframes）、src/components/shared/Button.tsx、src/routes/pages/Home.tsx
- index.css：@layer utilities 新增 .animate-fade-in / .animate-slide-up / .animate-fade-slide-up（duration 250ms/300ms）；@keyframes fade-in / slide-up / fade-slide-up（仅 opacity + transform，无 layout 属性）；reduced-motion 媒体查询（T1 已有）原样保留，自动降级
- Button.tsx：base 保留 transition-colors，新增 duration-200（200ms 在 200-300ms 范围内）
- Home.tsx：h1 加 animate-fade-in（入场），卡片 grid 加 animate-slide-up（入场）— 共 2 处应用
- 无 motion-one / JS 动效库引入；无 as any；未动布局/theme/测试文件
- build 0 错误；grep @keyframes=3（>=2）；grep duration-200=1

T5 完成记录 (2026-09-10)
- 文件：src/routes/pages/Home.tsx、Dashboard.tsx、Login.tsx、NotFound.tsx、src/index.css（仅响应式注释段）
- Home：h1 升级 sm:text-5xl → md:text-6xl lg:text-7xl 阶梯；容器 px-4 md:px-6 lg:px-8；新增 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 卡片（Router/Stores/API）；保留 #root text-align:center 居中语义（卡片内 text-left 局部覆盖）
- Dashboard：h1 升级 md:text-3xl lg:text-4xl；容器 px-4 md:px-6 lg:px-8；新增 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6（Profile + Actions 卡片）
- Login：容器 px-4 md:px-6 lg:px-8 min-w-0 overflow-hidden；h1 升级 md:text-3xl lg:text-4xl truncate；表单输入保留 w-full
- NotFound：容器 px-4 md:px-6 lg:px-8 min-w-0 overflow-hidden truncate；h1 升级 md:text-7xl lg:text-8xl
- index.css TODO(T5)：保留原 @media (max-width:1024px)（不删旧 media）；新增 @media (min-width:1024px) lg: 收敛注释 + font-size:18px；注释行标注“新增 lg: 收敛注释（不删旧 media）”
- 未碰 _components/ 布局壳（Layout/BaseLayout 不动）；无 masonry/subgrid；无动态拼接类名；无 theme/Button 改动
- grep 结果：grid 出现 Home + Dashboard（>=2）；md: 出现 9 处、lg: 出现 8 处（非空）；build 0 错误

T8 完成记录 (2026-09-10) — 全量回归验证 + STYLE_ARCH.md
- 新建 STYLE_ARCH.md（根目录）：tokens 分层 / dark 两阶段 / 布局 / 组件 / 动效 + 每节 verification 命令
- build: 0 错误（293ms，47 模块，CSS 77.26kB gzip 15.12kB）
- typecheck: 0 错误
- test: 2 失败（token-consumption 预存在：fetch localhost:3000 ECONNREFUSED + CSS 文件名不匹配 index-DzU4xWvK.css vs 期望 BPzSBTWV.css + .btn-primary 缺失构建输出）— 只记录不修
- 10 点 checklist 实测（真实 grep 输出贴入 STYLE_ARCH.md 附录）：
  1 @layer=5 行 / 2 dark 双 stage（data-theme + prefers-color-scheme）/ 3 createEffect 仅 BaseLayout.tsx / 4 grid=2 文件（Home+Dashboard）/ 5 md:lg:=17 / 6 Button 零 hex（退出码1=0匹配）/ 7 @keyframes=3 / 8 token 引用=34 / 9 @utility=3 / 10 build OK test 2fail typecheck OK
- 无源码修改（仅新增 STYLE_ARCH.md）；无 commit；无浏览器截图

T8 跟进修复 + visual-qa（orchestrator 亲执行，2026-09-10）
- 根因：shared.css 从未被 import（构建天然缺 .btn-primary）；测试用 fetch + 硬编码哈希文件名（ECONNREFUSED 脆弱）
- 修复：index.css 加 @import "./styles/shared.css"；Home CTA 改用 btn-primary（content 扫描进构建）；测试改 node:fs 直读（/// reference 三斜线过 tsc，属必需编译指令）
- 终验：test 12/12 全绿 / typecheck 0 / build 0 / .btn-primary 进 dist CSS
- 真机截图（headless chromium，dev server）：light 1280 正常（nav/hero/紫色 CTA/三卡片 grid）；mobile 390 无溢出；dark data-theme 探针页深色 token 全生效（stage1 覆盖成立）；截图 /tmp/d5-{light,dark,mobile,darkprobe}.png
- 收尾：dev 服务器已杀，dark-probe.html 已删，STYLE_ARCH.md 第 8.2/9 节已同步为全绿
- 未提交（无 commit 授权）

Review 跟进修复（orchestrator 亲执行，2026-09-10）
- #1 ghost hover 未定义 token：--neutral-50 → --color-neutral-50（hover 曾静默失效，现恢复）
- #2 primary hover 对比度：light hover brand-100→brand-700（白字 ~6.5:1）；dark hover 保留 brand-100（配深色字，高对比）
- #3 显式 light 被系统深色覆盖：stage2 改 :root:not([data-theme='light'])，手动选择优先
- #4 登录失垂直居中：BaseLayout showNav=false 时 main 切 centered 变体，截图验证卡片回中央
- #5 --social-bg：两处 dark 覆盖已删，零引用确认
- #6 .card 双定义：index.css @layer components 恢复为空壳（shared.css @utility 为唯一 canonical；bare btn/input 无调用方）
- #7 minor：Dashboard Button 加 justify-start（text-left 生效）；AppError 按钮 brand token 化；truncate/{...rest}/SignOut 记 note（无害/不可达/正确但脆弱）
- 终验：test 12/12 / typecheck 0 / build 0 / login 截图 PASS；未提交
