---
title: Stochastic Primal-Dual Network for 3D Tomographic reconstruction
description: Developed a stochastic version of primal-dual algorithm for reconstructing image volumes from CT scans. Implemented a python framework with custom Tensorflow layers and a library using Astra to aid the project.
category: 3D Reconstruction
importance: 3
img: /assets/video/lspd.gif
viz: tomography
links:
  - label: ICMS talk abstract
    url: https://icms.ac.uk/wp-content/uploads/archive/downloads/MARTA-BETCKE.pdf
---

Joint work with Marta M. Betcke, Andreas Hauptmann, WonTek Hong, Elliott Macneil and Francesc (Kiko) Rullan. This page summarizes the method and results from our manuscript, *Learned Stochastic Primal Dual for large scale and fully 3D tomographic reconstruction*. The results come from our experiments and have not been peer reviewed. Marta presented the method at ICMS ([abstract](https://icms.ac.uk/wp-content/uploads/archive/downloads/MARTA-BETCKE.pdf)).

## The problem

In X-ray CT we recover a volume $$x$$ from projections $$y = Ax + \text{noise}$$, where $$A$$ is the X-ray transform. With few angles or a low photon count, classical methods such as filtered back-projection (FBP) are noisy and streaky, and hand-made priors such as total variation (TV) only go so far.

Unrolled networks such as the learned primal-dual method (LPD) do much better: they take a fixed number of primal-dual iterations and replace each update with a small CNN trained end to end. But every layer applies the full forward operator $$A$$ and its adjoint $$A^{*}$$, and every layer's activations must be kept for back-propagation. For 3D cone-beam data that is the bottleneck: training memory and time grow with the number of projections times the number of layers.

## Learned stochastic primal-dual

LSPD borrows the trick of stochastic primal-dual hybrid gradient: split the projections into $$m$$ random subsets $$S_1, \dots, S_m$$, and let each layer see only one subset. Layer $$k$$ updates the dual variable for its subset and then the image:

$$
h_{k+1} = \Gamma_{\theta_k}\!\left(h_k,\ A_{S_k} x_k,\ y_{S_k}\right), \qquad
x_{k+1} = \Lambda_{\phi_k}\!\left(x_k,\ A_{S_k}^{*}\, h_{k+1}\right),
$$

where $$\Gamma$$ and $$\Lambda$$ are small CNNs. One reconstruction *epoch* is a pass over all $$m$$ subsets, so it costs about one application of $$A$$ and $$A^{*}$$ in total instead of one per layer. Two consequences:

- **It fits in 3D.** Each layer touches only a fraction of the data, so we could train on full walnut volumes on ordinary hardware.
- **It learns a sampling distribution.** In the 3D experiments the subsets are re-drawn at random every iteration, in training and at test time, so the network is trained for random sampling in general rather than one fixed set of angles.

We compared variants with 1–3 epochs, with the CNN weights either shared between layers (*static*) or separate for each layer (*flexible*).

## 2D: subsampled Shepp–Logan

Parallel-beam CT at 128×128, reconstructing from 60 of 180 angles chosen at random. The networks were trained with Adam on random-ellipse phantoms generated on the fly, so no training image repeats.

![Shepp–Logan reconstructions from 60 of 180 angles: ground truth, FBP, TV, LPD and LSPD with 3 epochs](/assets/img/lspd/shepp-logan-subsampled.webp)

| Method | PSNR (dB) | SSIM |
| --- | --- | --- |
| FBP | 21.90 | 0.589 |
| TV | 27.58 | 0.813 |
| LPD | 38.79 | 0.992 |
| LSPD, 1 epoch | 32.14 | 0.977 |
| LSPD, 3 epochs, static | 36.54 | 0.989 |

In 2D, where the full operator is cheap, LPD is still the most accurate. LSPD closes most of the gap as it gets more epochs, and both learned methods are far ahead of FBP and TV. On 100 random-ellipse test images the ordering was the same (LPD 34.99 dB, 3-epoch LSPD 34.38 dB). With low-dose Poisson noise, LPD (29.30 dB) and 2-epoch LSPD (28.13 dB) beat TV (27.17 dB), but 1-epoch LSPD did not (26.55 dB).

## 3D: walnut cone-beam CT

Real cone-beam data from a public walnut data set, downsampled 4× to 128³. We trained on 40 walnuts and tested on a held-out one, using 3 circular orbits with 60 angles each (180 projections, 6 random subsets per epoch) and 5% Gaussian noise.

![Central slice of the test walnut: ground truth, Nesterov gradient, LPD with one iteration and LSPD with one epoch](/assets/img/lspd/walnut-gaussian.webp)

| Method | PSNR (dB) | SSIM | Training |
| --- | --- | --- | --- |
| Nesterov gradient (30 iterations) | 47.96 | 0.995 | – |
| LPD, 1 iteration | 45.87 | 0.990 | 20 h |
| LSPD, 1 epoch | 50.33 | 0.997 | 34 h |
| LSPD, 1 epoch, random angles | 49.40 | 0.997 | 36 h |

Here the picture flips. In 3D, LPD was run with a single iteration and ended up behind even the classical Nesterov baseline. LSPD, with the same total number of operator applications spread over six cheap layers, was the best of the three.

For low-dose data we used 300 angles per orbit (900 projections) and simulated Poisson noise at 10⁴ photons. At that size LPD could not be trained at all, while LSPD still could:

![Low-dose walnut: ground truth, Nesterov gradient and LSPD](/assets/img/lspd/walnut-lowdose.webp)

| Method | PSNR (dB) | SSIM | Training |
| --- | --- | --- | --- |
| Nesterov gradient (30 iterations) | 36.10 | 0.841 | – |
| LSPD, 1 epoch | 46.73 | 0.993 | 65 h |

My part was the experiments: a Python framework with custom TensorFlow layers and an ASTRA-based library for the 2D and 3D runs, with Elliott on the 3D reconstructions.
