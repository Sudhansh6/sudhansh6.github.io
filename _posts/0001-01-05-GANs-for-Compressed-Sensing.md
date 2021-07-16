---

layout: post
title: Generative Adversarial Networks for Compressed Sensing
categories: [Research]
excerpt: TBA

---

<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML" async></script>

# Generative Adversarial Networks

Take a look at [this](https://towardsdatascience.com/understanding-generative-adversarial-networks-gans-cd6e4651a29) blog for an introduction to GANs. 

## GANs for Inverse Problems

- Traditionally, natural images are considered sparse in some fixed or learnable basis. Many algorithms use this property is used to recover images from compressive measurements.
- Typically, instead of a sparse prior, some algorithms also use a **learned prior**. 
- Some approaches also use neural networks to solve inverse problems. These are an alternative to the classical regularization approach. These methods mainly fall into $$3$$ categories.
  - Networks that learn prior and the regularization parameter 
  - Networks that learn the optimization solver
  - Networks that perform the full reconstruction directly from the measurements. This method can be further classified as 
    - Learned full reconstruction operators - This is computationally expensive, and the performance is highly dependent on the training data.
    - Learned post-processing denoisers - The initial reconstruction is done via a primitive algorithm. For example, in tomography, the initial reconstruction is formulated via filtered back-projection. After this, the network constructs the final reconstruction using the initial reconstruction. 
    - Learned iterative reconstruction - These networks reconstruct the image through iterative steps. These are similar to the full reconstruction operators, but unlike them, these use multiple steps. Primal-Dual Hybrid Gradient is one such algorithm. 

The following approach uses GANs to model the distribution of the data. Generally, these algorithms involve the expensive computation of the Jacobian $$\nabla_z G$$ of the differentiable generator $$G$$ with respect to the latent input $$z$$. Computing $$\nabla G_z$$ involves backpropagation through $$G$$ at every iteration. 

The **Projected Gradient Descent (PGD)** approach shows substantial improvements in performance and the recovery rate.

### Problem Formulation

Let $$x^* \in \mathbb R^n$$ denote the ground truth image, $$A$$ denote the measurement matrix, and $$y = Ax^* + v \in \mathbb R^m$$ denote the noisy measurement with noise $$v \sim \mathcal N(0, \sigma^2I) $$. We assume the ground truth images lie in a *non-convex* set $$S = R(G)$$, the range of the generator $$G$$. The maximum likelihood estimator of $$x^*$$, $$\hat x _{MLE}$$, can be formulated as:

<div style="text-align:centre">
$$
\begin{align} \hat x_{MLE} &= \arg \min_ {x\in R(G)} -\log p(y|x) \\ &= \arg \min_{x\in R(G)} \|y - Ax \|^2_2 \end{align}
$$

</div>

One such approach suggested by Bora *et al* to solve the algorithm (which we shall refer to as CSGM) is as follows. They solve the optimization problem 

<div style="text-align:centre">

$$
\hat z = \arg \min_{z \in \mathbb{R}^k}\|y - AG(z) \|^2 + \lambda\|z\|^2
$$

</div>

in the latent space($$z$$), and set $$\hat x = G(\hat z)$$. Formally, a generative model is given by a deterministic function $$G : \mathbb R^k \to \mathbb R^n$$, and a distribution $$P_Z$$ over $$z \in \mathbb R^k$$. To generate a sample from the generator, we can draw $$z \sim P_Z$$ and the sample is then $$G(z)$$. Typically, we have $$k \ll n $$, i.e. the generative model maps from a low dimensional representation space to a high dimensional sample space.

In other words, we generate $$z$$ from a known distribution, say a Gaussian. The GAN $$G$$ takes $$z$$ as input and produces an output $$x = G(z)$$ in $$R(G)$$. This $$x$$ is supposed to model the distribution of the training data of images. Then, by using any optimization procedure, $$\hat z$$ is estimated. We are simply optimizing in the representation space instead of the sample space. The results significantly outperform Lasso with relatively fewer measurements.

The problem with this approach is that the gradient descent algorithm often gets stuck at local optima. To resolve this problem, Shah and Hegde proposed a projected gradient descent (PGD)- based method (we shall refer to this as PGD-GAN). They perform gradient descent in the ambient $$(x)$$-space and project the updated term onto $$R(G)$$. This projection involves solving another non-convex minimization problem using the *Adam optimizer*. Their algorithm can be summarised as:

<div align = center>

$$
x_k \rightarrow \fbox{$I - \eta\nabla_xf$} \\ x'_k \downarrow  \\ \fbox{$\hat z_{k+1} \gets \arg\min_z \|G(z) - x'_k\|^2$} \\ \begin{align} \hat z_{k+1} &\downarrow \\  &\fbox{ $G$ } \rightarrow x_{k+1} \end{align}
$$

</div>**Note.** <span style="color:red"> The GAN is trained separately. We are just trying to reconstruct the original image using the above algorithm </span>

Our aim is to replace this iterative scheme in the inner-loop (estimation of $$\hat z$$) with a learning-based approach. A network architecture can be carefully designed using a suitable training strategy that can project onto $$R(G)$$. This does away with the inner loop in the above algorithm. The inner loop is the most expensive computational step in the algorithm. The new approach is summarised as:

<div style="text-align:centre">

$$
x_k \rightarrow \fbox{$I - \eta\nabla_x f$} \overset{x'_k}{\rightarrow} \fbox{$ P_G = GG^\dagger$} \rightarrow x_{k+1}
$$

</div>

$$P_G$$ is the network based projector. The following architecture is used to train a projector onto $$R(G)$$.

<div style="text-align:centre">

$$
\begin{align}   z \sim \mathcal N(0, I) \rightarrow \; &\fbox{ $G$ } \\ &\downarrow \text{Noise added} \\ \text{output} \leftarrow \fbox{ G } \leftarrow \; &\fbox{$G^\dagger_\theta$} \end{align}
$$

</div>

This approach has the following advantages:

1. There is no inner loop which reduces the number of iterations and, hence, the time required.
2. It does not require the computation of $$ \nabla G_z$$ which is a very expensive operation.

### Training of GAN

The goal is to train a network that projects an image $$x \in \mathbb R^n$$  onto $$R(G)$$. The projector, $$P_S$$ onto a set $$S$$ should satisfy two main properties:

1. *Idempotence*, for any point $$x$$, $$P_S(P_S(x)) = P_S(x) $$
2. *Least distance*, for any point $$\tilde x$$, $$P_S(\tilde x) = \arg\min_{x \in S}\|x - \tilde x\|^2 $$ . 

The multi-task loss to train the projector is 

<div style="text-align:centre">

$$
\begin{equation} \mathcal L(\theta) = \mathbb E_{z, \nu} \left[ \| G\left(G^\dagger_\theta(G(z) + \nu)\right) - G(z)\|^2 \right] \\ + \mathbb E_{z, \nu} \left[\lambda \| G^\dagger_\theta(G(z) + \nu) - z \|^2 \right] \end{equation}
$$

</div>

where $$G$$ is a generator obtained from the GAN trained on a particular dataset. Operator $$G^\dagger_\theta : \mathbb R^n \to \mathbb R ^k $$, parametrized by $$\theta$$, approximated a non-linear least squares pseudo-inverse of $$G$$ (Hence the usage of $$G^\dagger$$ for representation) and $$\nu \sim \mathcal N(0, I_n)$$ indicated noise added to the generator's output for different $$z \sim \mathcal N(0, I_k) $$  <span style="color:red"> so that the projector network denoted by $P_G = GG^\dagger_\theta$ is trained on points outside $R(G)$ and learns how to projects them onto $R(G)$ </span>. 

The objective function consists of two parts. 

- The first is similar to the standard *Encoder-Decoder* framework, however the loss function is minimized over $$\theta$$, while keeping the parameters of $$G$$ fixed. This ensures that $$R(G)$$ does not change and $$P_G$$ is a mapping onto $$R(G)$$.
- The second part is used to keep $$G^\dagger(G(z))$$ close to true $$z$$ used to generate training image $$G(z)$$. This can be regarded as the regularizer.

## Theoretical Study

### Convergence Analysis

> **Restricted Eigenvalue Constraint (REC)**  - Let $$S \subset \mathbb R^n$$. For some parameters $$0 < \alpha < \beta$$, matrix $$A \in \mathbb R^{m \times n}$$ is said to satisfy the *REC($$S, \alpha, \beta$$)* if the following holds for all $$x_1, x_2 \in S$$.
>
> <div align = center>
>
> $$
> \alpha\|x_1 - x_2\|^2 \leq \|A(x_1 - x_2) \|^2 \leq \beta\|x_1 - x_2\|^2
> $$
>
> </div>
>
> **Approximate Projection using GAN** - A concatenated network $$G(G^\dagger(.)) : \mathbb R^n \rightarrow R(G)$$ is a $$\delta$$-approximate projector, if the following holds for all $$ x\in \mathbb R^n$$.
>
> <div align = center>
>
> $$
> \|x - G(G^\dagger(x))\|^2 \leq \min_{z \in \mathbb R^k} \|x - G(z)\|^2 + \delta
> $$
>
> </div>

> **Theorem** Let matrix $$ A \in \mathbb R^{m \times n}$$ satisfy the $$REC(S, \alpha, \beta)$$ with $$\beta/\alpha < 2$$, and let the concatenated network $$G(G^\dagger(.))$$ be a $$\delta$$-approximate projects. Then for every $$ x^* \in R(G)$$ and measurement $$y = Ax^*$$, executing the algorithm with step size $$\eta = 1/\beta$$, will yield 
>
> <div align = center>
>
> $$
> f(x_n) \leq \left(\frac{\beta}{\alpha} - 1\right)^nf(x_0) + \frac{\beta\delta}{2 - \beta/\alpha}
> $$
>
> </div>
>
> Furthermore, the algorithm achieves $$\|x_n - x^* \|^2 \leq \left(C + \frac{1}{2\alpha/\beta - 1}\right)\delta$$ after $$\frac{1}{2 - \beta/\alpha}\log\left(\frac{f(x_0)}{C\alpha\delta}\right)$$ steps. When $$n \rightarrow \infty$$, $$\|x^* - x_\infty\|^2 \leq \frac{\delta}{2\alpha/\beta - 1}$$.