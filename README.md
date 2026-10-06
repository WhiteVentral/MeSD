# MeSD Project Page

An English-language paper website that can be deployed directly to GitHub Pages. It requires no Node.js, build tools, or additional dependencies.

Live site: https://whiteventral.github.io/MeSD/

Code repository: https://github.com/WhiteVentral/MeSD-code

Paper: [arXiv:2610.06342](https://arxiv.org/abs/2610.06342)

## Local preview

Run the following command in this directory:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8000> in a browser.

## Site configuration

- `site-config.js` stores the public paper, code, and model URLs. Entries with no URL remain in a **Coming soon** state and automatically become clickable after a public link is added.
- `index.html` contains the title, project overview, results, infrastructure highlights, and default BibTeX entry.
- `site.js` contains the paper's experimental data, baseline switching, resource-link handling, and other interactions. A static copy of the main results table also appears in `index.html`; update both representations when changing the data.
- `assets/` contains the paper PDF, method and overview figures, and platform marks. The GitHub mark comes from [Primer Octicons](https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg) under its included [MIT license](assets/github-LICENSE.txt). The Hugging Face mark comes from the [official brand resources](https://huggingface.co/brand).

The paper is available at [arXiv:2610.06342](https://arxiv.org/abs/2610.06342). `paperUrl` and `arxivId` are configured for this release; the paper button, footer link, and BibTeX entry point to the published preprint.

The trained MeSD model weights are undergoing internal release approval and are not yet available for download. Keep `modelUrl` empty while approval is pending. The site displays **Models · Coming soon** and explains the approval status. After approval and upload, set `modelUrl` to the public download URL; both pending messages will automatically be replaced by active links.

The source code is linked through `codeUrl` and currently points to the `WhiteVentral/MeSD-code` repository.

## Training-efficiency data

The fourth section focuses on vLLM rollouts, distributed FSDP updates, shared teacher parameters, and reused student trajectories. It presents three headline quantities: wall-clock time, speedup, and compute cost. A short configuration line identifies MeSD-7B, STGR-RL, one epoch / 2,327 steps, and NVIDIA A800 GPUs, while the paper provides the complete setup.

The efficiency results apply to MeSD-7B initialized from Open-o3-Video-SFT-7B. They come from Appendix F.4, Table 12 on page 25 of `assets/mesd-paper.pdf`. The comparator is VISD without feedback, and both methods use a 2,327-step training budget.

- Wall-clock time: 61.36h to 20.96h, a reduction of approximately 65.8%.
- Speedup: `61.36 / 20.96 ≈ 2.93x`; training steps per hour increase by approximately 192.7%.
- Compute cost: 981.70 to 335.38 A800 GPU-hours, a reduction of approximately 65.8%.

The training configuration follows Section 4.1 and Appendix Tables 5-6: 37,231 STGR-RL samples, one epoch, 16 prompts x 4 responses, video sampled at 2 FPS with at most 16 frames, responses capped at 768 tokens, temperature 1.0, teacher supervision for the first 1,000 steps, and GRPO afterward.

The paper explicitly identifies A800 GPUs. The ratio of GPU-hours to wall-clock time is approximately 16, so the 16-GPU figure is inferred from Table 12. The released training configuration and launcher specify two nodes x eight GPUs. The paper does not confirm the measured node topology or per-GPU memory capacity, so the website does not present those details as measured facts.

## Qwen3-VL results table

The persistent table in the results section comes from Appendix Tables 9-10 on page 24 of the paper. It covers the 4B, 8B, and 32B base models, MeSD variants, and gains for V-STaR mLGM, WorldSense Overall, VideoMMMU Overall, LRR Accuracy, TVGBench mIoU, and the four-benchmark average. V-STaR is excluded from the average. The displayed averages and gains follow the paper's calculations from unrounded scores, including the +5.7 gain at 32B.

The earlier model-scaling tab that showed only averages has been replaced by this persistent table. The main-results and additional-benchmarks tabs remain interactive.

## Deploying to GitHub Pages

1. Keep this repository public when using GitHub Free; private-repository Pages requires an eligible paid plan.
2. Upload the contents of this directory to the repository root and retain `.nojekyll`.
3. Open **Settings → Pages → Build and deployment**.
4. Choose **Deploy from a branch → main → / (root)** and save.
5. Visit https://whiteventral.github.io/MeSD/ after the deployment completes.

The project website and training repository are separate and are connected through `codeUrl`. All assets use relative paths so the site works under a GitHub Pages project subpath.
