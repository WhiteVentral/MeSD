# MeSD 项目主页

独立的英文论文主页，可直接部署到 GitHub Pages。无需 Node.js、构建工具或额外依赖。

## 本地预览

在本目录运行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

浏览器打开 <http://127.0.0.1:8000>。

## 更新内容

- `site-config.js`：填写论文、代码仓库和模型的公开链接。GitHub 代码入口与 Hugging Face 模型入口均带有平台标识；未填写链接时显示 Coming soon，填写后自动成为可点击的按钮。
- `index.html`：标题、作者、单位、项目介绍、默认可见的 Qwen3-VL 结果表、基础设施亮点和默认 BibTeX。
- `site.js`：论文中的实验数据、对比基准切换和交互。主表的静态备份也在 `index.html` 中，修改数据时同步更新。
- `assets/`：论文 PDF、方法图、概览图和平台 SVG 标识。GitHub 标识来自 [Primer Octicons](https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg)（[MIT 许可](assets/github-LICENSE.txt)）；Hugging Face 标识来自[官方品牌资源](https://huggingface.co/brand)。

MeSD 模型权重正在进行内部发布审批。审批期间保持 `modelUrl` 为空，页面显示 **Models · Coming soon** 及审批说明；获批并上传权重后填写公开下载链接，这两处提示会自动隐藏。代码仓库发布后单独填写 `codeUrl`。

当前内容来自 MeSD 论文。作者顺序采用 `MeSD_arxiv/authors.tex`；尚未填写 arXiv 编号，因此默认引用标为 Manuscript。填写 `arxivId` 后，页面会自动更新 BibTeX。

## 训练效率数据

第四小节以 vLLM rollout、FSDP 分布式更新、教师共享参数与复用学生轨迹为核心，只展示训练用时、加速比和计算成本三项结果。页面用一行交代 MeSD-7B、STGR-RL、1 epoch / 2,327 步和 A800，详细配置通过论文链接查看；以下保留维护所需的数据来源。

第四小节的效率数据针对 MeSD-7B（初始化为 Open-o3-Video-SFT-7B）。数据来自 `assets/mesd-paper.pdf` 第 25 页附录 F.4、表 12；对照为 VISD no-feedback，两者训练预算均为 2,327 步。

- 用时：61.36h → 20.96h，减少 `(61.36 - 20.96) / 61.36 × 100 ≈ 65.8%`。
- 加速比：`61.36 / 20.96 ≈ 2.93×`；每小时训练步数提升 `(61.36 / 20.96 - 1) × 100 ≈ 192.7%`，由表内用时计算。
- 计算成本：981.70 → 335.38 A800 GPU-hours，减少约 65.8%。

训练设置依据正文 §4.1、附录表 5–6：STGR-RL 共 37,231 条，1 epoch；16 prompts × 4 responses；视频 2 FPS、最多 16 帧；回复最多 768 tokens，temperature 1.0；前 1,000 步使用教师监督，之后为 GRPO。

硬件信息区分来源：论文表 12 明确为 A800，GPU-hours / wall time 约为 16，因此 16 卡为根据表中数字的推算；`MeSD/configs/train_mesd.yaml` 与启动器明确默认 2 节点 × 8 GPU。当前论文未明确实测节点拓扑与单卡显存，不将代码默认值直接写成实测确认，也不推测为 80GB。

## Qwen3-VL 结果表

实验部分常驻表格来自论文第 24 页附录表 9–10。覆盖 4B、8B、32B 的基座、MeSD 及增益，列出 V-STaR mLGM、WorldSense Overall、VideoMMMU Overall、LRR Accuracy、TVGBench mIoU 与四 benchmark 平均值。平均值不包含 V-STaR。保留论文由未舍入分数计算的 Avg./Δ，包括 32B 的 +5.7。

原先只显示平均值的 Model scaling 页签已由这张常驻表替代；主结果和 Additional benchmarks 页签仍可交互切换。开头三个概览指标已移除。

## 发布到 GitHub Pages

1. 在自己的 GitHub 账号或组织下新建一个公开仓库，例如 `MeSD-project-page`。
2. 把本目录的内容上传到仓库根目录，保留 `.nojekyll`。
3. 打开 **Settings → Pages → Build and deployment**，选择 **Deploy from a branch → main → / (root)** 并保存。
4. 部署完成后，访问 `https://<用户名>.github.io/MeSD-project-page/`。

网站与 MeSD 训练仓库独立，通过 `codeUrl` 关联。所有资源使用相对路径，支持 GitHub Pages 的仓库子路径。
